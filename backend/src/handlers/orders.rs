use crate::auth::jwt::Claims;
use crate::error::AppError;
use crate::models::orders::{CreateOrder, Order, OrderItem, UpdateOrderStatus};
use crate::pagination::Pagination;
use crate::state::AppState;
use axum::{
    Extension, Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::get,
};

// Router
pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_orders).post(create_order))
        .route(
            "/{id}",
            get(get_order).put(update_order_status).delete(delete_order),
        )
}

// Handlers
pub async fn list_orders(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<Order>>, AppError> {
    let (limit, offset) = pagination.limit_offset();

    let orders = if claims.role == "admin" || claims.role == "manager" {
        sqlx::query_as::<_, Order>("SELECT * FROM orders ORDER BY id DESC LIMIT $1 OFFSET $2")
            .bind(limit)
            .bind(offset)
            .fetch_all(&state.db)
            .await?
    } else {
        // customers see only their own orders
        sqlx::query_as::<_, Order>(
            "SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3",
        )
        .bind(claims.sub)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?
    };

    Ok(Json(orders))
}

pub async fn get_order(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<Json<(Order, Vec<OrderItem>)>, AppError> {
    let order = sqlx::query_as::<_, Order>("SELECT * FROM orders WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await?;

    if claims.role != "admin" && claims.role != "manager" {
        if order.user_id != Some(claims.sub) {
            return Err(AppError::not_found("order not found"));
        }
    }

    let items = sqlx::query_as::<_, OrderItem>("SELECT * FROM order_items WHERE order_id = $1")
        .bind(id)
        .fetch_all(&state.db)
        .await?;

    Ok(Json((order, items)))
}

pub async fn create_order(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(mut payload): Json<CreateOrder>,
) -> Result<(StatusCode, Json<Order>), AppError> {
    if claims.role == "customer" {
        payload.user_id = Some(claims.sub);
    } else {
        payload.user_id = payload.user_id.or(Some(claims.sub));
    }

    let mut tx = state.db.begin().await?;

    let order = sqlx::query_as::<_, Order>(
        "INSERT INTO orders (user_id, status, total_amount) VALUES ($1, 'pending', 0) RETURNING *",
    )
    .bind(payload.user_id)
    .fetch_one(&mut *tx)
    .await?;

    let mut total = rust_decimal::Decimal::new(0, 0);

    for item_req in &payload.items {
        let inventory = sqlx::query_as::<_, (rust_decimal::Decimal, i32)>(
            "SELECT unit_price, quantity FROM inventory WHERE id = $1 FOR UPDATE",
        )
        .bind(item_req.inventory_id)
        .fetch_one(&mut *tx)
        .await
        .map_err(|_| AppError::bad_request("inventory item not found"))?;

        let price = inventory.0;
        if inventory.1 < item_req.quantity {
            return Err(AppError::bad_request(format!(
                "insufficient stock for inventory item {}",
                item_req.inventory_id
            )));
        }

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

        sqlx::query("UPDATE inventory SET quantity = quantity - $1 WHERE id = $2")
            .bind(item_req.quantity)
            .bind(item_req.inventory_id)
            .execute(&mut *tx)
            .await?;

        total += price * rust_decimal::Decimal::from(item_req.quantity);
    }

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
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateOrderStatus>,
) -> Result<Json<Order>, AppError> {
    let order = sqlx::query_as::<_, Order>("SELECT * FROM orders WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await?;

    if claims.role != "admin" && claims.role != "manager" {
        if order.user_id != Some(claims.sub) {
            return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
        }
    }

    let updated = sqlx::query_as::<_, Order>(
        "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    )
    .bind(&payload.status)
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(updated))
}

pub async fn delete_order(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    let order = sqlx::query_as::<_, Order>("SELECT * FROM orders WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await?;

    if claims.role != "admin" && claims.role != "manager" {
        if order.user_id != Some(claims.sub) {
            return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
        }
    }

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
