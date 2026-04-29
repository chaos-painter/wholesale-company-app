use async_trait::async_trait;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use sqlx::{FromRow, PgPool};

use crate::domain::order::{Order, OrderItem, OrderItemInput};
use crate::error::AppError;
use crate::ports::OrderRepo;

#[derive(FromRow)]
struct OrderRow {
    id: i32,
    user_id: Option<i32>,
    status: String,
    total_amount: Option<Decimal>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<OrderRow> for Order {
    fn from(r: OrderRow) -> Self {
        Self {
            id: r.id,
            user_id: r.user_id,
            status: r.status,
            total_amount: r.total_amount,
            created_at: r.created_at,
            updated_at: r.updated_at,
        }
    }
}

#[derive(FromRow)]
struct OrderItemRow {
    id: i32,
    order_id: i32,
    inventory_id: i32,
    quantity: i32,
    price_at_purchase: Decimal,
}

impl From<OrderItemRow> for OrderItem {
    fn from(r: OrderItemRow) -> Self {
        Self {
            id: r.id,
            order_id: r.order_id,
            inventory_id: r.inventory_id,
            quantity: r.quantity,
            price_at_purchase: r.price_at_purchase,
        }
    }
}

pub struct PgOrderRepo {
    pool: PgPool,
}

impl PgOrderRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl OrderRepo for PgOrderRepo {
    async fn list_for_user(
        &self,
        user_id: i32,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Order>, AppError> {
        sqlx::query_as::<_, OrderRow>(
            "SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3",
        )
        .bind(user_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await
        .map(|rows| rows.into_iter().map(Into::into).collect())
        .map_err(Into::into)
    }

    async fn list_all(&self, limit: i64, offset: i64) -> Result<Vec<Order>, AppError> {
        sqlx::query_as::<_, OrderRow>(
            "SELECT * FROM orders ORDER BY id DESC LIMIT $1 OFFSET $2",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await
        .map(|rows| rows.into_iter().map(Into::into).collect())
        .map_err(Into::into)
    }

    async fn find_by_id(&self, id: i32) -> Result<(Order, Vec<OrderItem>), AppError> {
        let order: Order = sqlx::query_as::<_, OrderRow>("SELECT * FROM orders WHERE id = $1")
            .bind(id)
            .fetch_one(&self.pool)
            .await
            .map(Into::into)?;

        let items: Vec<OrderItem> =
            sqlx::query_as::<_, OrderItemRow>(
                "SELECT * FROM order_items WHERE order_id = $1",
            )
            .bind(id)
            .fetch_all(&self.pool)
            .await
            .map(|rows| rows.into_iter().map(Into::into).collect())?;

        Ok((order, items))
    }

    async fn find_order_only(&self, id: i32) -> Result<Order, AppError> {
        sqlx::query_as::<_, OrderRow>("SELECT * FROM orders WHERE id = $1")
            .bind(id)
            .fetch_one(&self.pool)
            .await
            .map(Into::into)
            .map_err(Into::into)
    }

    async fn create(
        &self,
        user_id: Option<i32>,
        items: Vec<OrderItemInput>,
    ) -> Result<Order, AppError> {
        let mut tx = self.pool.begin().await?;

        let order: Order = sqlx::query_as::<_, OrderRow>(
            "INSERT INTO orders (user_id, status, total_amount)
             VALUES ($1, 'pending', 0) RETURNING *",
        )
        .bind(user_id)
        .fetch_one(&mut *tx)
        .await
        .map(Into::into)?;

        let mut total = Decimal::ZERO;

        for item in &items {
            let (price, stock): (Decimal, i32) = sqlx::query_as(
                "SELECT unit_price, quantity FROM inventory WHERE id = $1 FOR UPDATE",
            )
            .bind(item.inventory_id)
            .fetch_one(&mut *tx)
            .await
            .map_err(|_| AppError::bad_request("inventory item not found"))?;

            if stock < item.quantity {
                return Err(AppError::bad_request(format!(
                    "insufficient stock for inventory item {}",
                    item.inventory_id
                )));
            }

            sqlx::query(
                "INSERT INTO order_items (order_id, inventory_id, quantity, price_at_purchase)
                 VALUES ($1, $2, $3, $4)",
            )
            .bind(order.id)
            .bind(item.inventory_id)
            .bind(item.quantity)
            .bind(price)
            .execute(&mut *tx)
            .await?;

            sqlx::query("UPDATE inventory SET quantity = quantity - $1 WHERE id = $2")
                .bind(item.quantity)
                .bind(item.inventory_id)
                .execute(&mut *tx)
                .await?;

            total += price * Decimal::from(item.quantity);
        }

        let order: Order = sqlx::query_as::<_, OrderRow>(
            "UPDATE orders SET total_amount = $1 WHERE id = $2 RETURNING *",
        )
        .bind(total)
        .bind(order.id)
        .fetch_one(&mut *tx)
        .await
        .map(Into::into)?;

        tx.commit().await?;
        Ok(order)
    }

    async fn update_status(&self, id: i32, status: String) -> Result<Order, AppError> {
        sqlx::query_as::<_, OrderRow>(
            "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
        )
        .bind(status)
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn delete(&self, id: i32) -> Result<(), AppError> {
        let rows = sqlx::query("DELETE FROM orders WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?
            .rows_affected();
        if rows == 0 {
            return Err(AppError::not_found("order not found"));
        }
        Ok(())
    }
}
