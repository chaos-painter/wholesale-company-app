use async_trait::async_trait;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use sqlx::{FromRow, PgPool};

use crate::domain::inventory::{
    CreateInventoryCmd, InventoryFilters, InventoryItem, UpdateInventoryCmd,
};
use crate::error::AppError;
use crate::ports::InventoryRepo;

#[derive(FromRow)]
struct InventoryRow {
    id: i32,
    item_name: String,
    description: Option<String>,
    sku: Option<String>,
    cost_price: Decimal,
    unit_price: Decimal,
    quantity: i32,
    category_id: Option<i32>,
    warehouse_id: Option<i32>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<InventoryRow> for InventoryItem {
    fn from(r: InventoryRow) -> Self {
        Self {
            id: r.id,
            item_name: r.item_name,
            description: r.description,
            sku: r.sku,
            cost_price: r.cost_price,
            unit_price: r.unit_price,
            quantity: r.quantity,
            category_id: r.category_id,
            warehouse_id: r.warehouse_id,
            created_at: r.created_at,
            updated_at: r.updated_at,
        }
    }
}

pub struct PgInventoryRepo {
    pool: PgPool,
}

impl PgInventoryRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl InventoryRepo for PgInventoryRepo {
    async fn list(
        &self,
        filters: &InventoryFilters,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<InventoryItem>, AppError> {
        let mut sql = String::from("SELECT * FROM inventory WHERE 1=1");
        let mut conditions: Vec<String> = Vec::new();
        let mut idx = 1usize;

        if filters.category_id.is_some() {
            conditions.push(format!("category_id = ${idx}"));
            idx += 1;
        }
        if filters.warehouse_id.is_some() {
            conditions.push(format!("warehouse_id = ${idx}"));
            idx += 1;
        }
        if filters.min_quantity.is_some() {
            conditions.push(format!("quantity >= ${idx}"));
            idx += 1;
        }
        if filters.search.is_some() {
            conditions.push(format!("item_name ILIKE ${idx}"));
            idx += 1;
        }

        if !conditions.is_empty() {
            sql.push_str(" AND ");
            sql.push_str(&conditions.join(" AND "));
        }
        sql.push_str(&format!(" ORDER BY id LIMIT ${idx} OFFSET ${}", idx + 1));

        let mut q = sqlx::query_as::<_, InventoryRow>(&sql);
        if let Some(v) = filters.category_id { q = q.bind(v); }
        if let Some(v) = filters.warehouse_id { q = q.bind(v); }
        if let Some(v) = filters.min_quantity { q = q.bind(v); }
        if let Some(ref v) = filters.search { q = q.bind(format!("%{v}%")); }
        q = q.bind(limit).bind(offset);

        q.fetch_all(&self.pool)
            .await
            .map(|rows| rows.into_iter().map(Into::into).collect())
            .map_err(Into::into)
    }

    async fn find_by_id(&self, id: i32) -> Result<InventoryItem, AppError> {
        sqlx::query_as::<_, InventoryRow>("SELECT * FROM inventory WHERE id = $1")
            .bind(id)
            .fetch_one(&self.pool)
            .await
            .map(Into::into)
            .map_err(Into::into)
    }

    async fn create(&self, cmd: CreateInventoryCmd) -> Result<InventoryItem, AppError> {
        sqlx::query_as::<_, InventoryRow>(
            "INSERT INTO inventory
             (item_name, description, sku, cost_price, unit_price, quantity, category_id, warehouse_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        )
        .bind(cmd.item_name)
        .bind(cmd.description)
        .bind(cmd.sku)
        .bind(cmd.cost_price)
        .bind(cmd.unit_price)
        .bind(cmd.quantity)
        .bind(cmd.category_id)
        .bind(cmd.warehouse_id)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn update(&self, id: i32, cmd: UpdateInventoryCmd) -> Result<InventoryItem, AppError> {
        sqlx::query_as::<_, InventoryRow>(
            "UPDATE inventory SET
             item_name    = COALESCE($1, item_name),
             description  = COALESCE($2, description),
             sku          = COALESCE($3, sku),
             cost_price   = COALESCE($4, cost_price),
             unit_price   = COALESCE($5, unit_price),
             quantity     = COALESCE($6, quantity),
             category_id  = COALESCE($7, category_id),
             warehouse_id = COALESCE($8, warehouse_id),
             updated_at   = NOW()
             WHERE id = $9 RETURNING *",
        )
        .bind(cmd.item_name)
        .bind(cmd.description)
        .bind(cmd.sku)
        .bind(cmd.cost_price)
        .bind(cmd.unit_price)
        .bind(cmd.quantity)
        .bind(cmd.category_id)
        .bind(cmd.warehouse_id)
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn delete(&self, id: i32) -> Result<(), AppError> {
        let rows = sqlx::query("DELETE FROM inventory WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?
            .rows_affected();
        if rows == 0 {
            return Err(AppError::not_found("inventory item not found"));
        }
        Ok(())
    }
}
