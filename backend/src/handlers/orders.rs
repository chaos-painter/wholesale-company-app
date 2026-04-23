use crate::error::AppError;
use crate::models::orders::{CreateOrder, Order, OrderItem, UpdateOrderStatus};
use crate::pagination::Pagination;
use crate::state::AppState;
use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::{get, put},
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_orders).post(create_order))
        .route("/{id}", get(get_order).delete(delete_order))
        .route("/{id}/status", put(update_order_status))
}

pub async fn list_orders(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<Order>>, AppError> {
    let (limit, offset) = pagination.limit_offset();
    let orders =
        sqlx::query_as::<_, Order>("SELECT * FROM orders ORDER BY id DESC LIMIT $1 OFFSET $2")
            .bind(limit)
            .bind(offset)
            .fetch_all(&state.db)
            .await?;
    Ok(Json(orders))
}

pub async fn get_order(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<(Order, Vec<OrderItem>)>, AppError> {
    let order = sqlx::query_as::<_, Order>("SELECT * FROM orders WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await?;
    let items = sqlx::query_as::<_, OrderItem>("SELECT * FROM order_items WHERE order_id = $1")
        .bind(id)
        .fetch_all(&state.db)
        .await?;
    Ok(Json((order, items)))
}

pub async fn create_order(
    State(state): State<AppState>,
    Json(payload): Json<CreateOrder>,
) -> Result<(StatusCode, Json<Order>), AppError> {
    let mut tx = state.db.begin().await?;

    // insert the order header
    let order = sqlx::query_as::<_, Order>(
        "INSERT INTO orders (user_id, status, total_amount) VALUES ($1, 'pending', 0) RETURNING *",
    )
    .bind(payload.user_id)
    .fetch_one(&mut *tx)
    .await?;

    let mut total = rust_decimal::Decimal::new(0, 0);

    for item_req in &payload.items {
        // fetch current unit_price and check stock
        let inventory = sqlx::query_as::<_, (rust_decimal::Decimal, i32)>(
            "SELECT unit_price, quantity FROM inventory WHERE id = $1 FOR UPDATE",
        )
        .bind(item_req.inventory_id)
        .fetch_one(&mut *tx)
        .await
        .map_err(|_| AppError::bad_request("inventory item not found"))?;

        let price = inventory.0;
        let stock = inventory.1;

        if stock < item_req.quantity {
            return Err(AppError::bad_request(format!(
                "insufficient stock for inventory item {}",
                item_req.inventory_id
            )));
        }

        // insert order item
        sqlx::query(
            "INSERT INTO order_items (order_id, inventory_id, quantity, price_at_purchase)
             VALUES ($1, $2, $3, $4)",
        )
        .bind(order.id)
        .bind(item_req.inventory_id)
        .bind(item_req.quantity)
        .bind(price)
        .execute(&mut *tx)
        .await?;

        // decrease stock
        sqlx::query("UPDATE inventory SET quantity = quantity - $1 WHERE id = $2")
            .bind(item_req.quantity)
            .bind(item_req.inventory_id)
            .execute(&mut *tx)
            .await?;

        total += price * rust_decimal::Decimal::from(item_req.quantity);
    }

    // update order total
    let order =
        sqlx::query_as::<_, Order>("UPDATE orders SET total_amount = $1 WHERE id = $2 RETURNING *")
            .bind(total)
            .bind(order.id)
            .fetch_one(&mut *tx)
            .await?;

    tx.commit().await?;
    Ok((StatusCode::CREATED, Json(order)))
}

pub async fn update_order_status(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateOrderStatus>,
) -> Result<Json<Order>, AppError> {
    let order = sqlx::query_as::<_, Order>(
        "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    )
    .bind(&payload.status)
    .bind(id)
    .fetch_one(&state.db)
    .await?;
    Ok(Json(order))
}

pub async fn delete_order(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    // cascade delete removes order_items automatically
    let rows = sqlx::query("DELETE FROM orders WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?
        .rows_affected();
    if rows == 0 {
        return Err(AppError::not_found("order not found"));
    }
    Ok(StatusCode::NO_CONTENT)
}
