use axum::{
    Extension, Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::get,
};
use serde::Deserialize;

use crate::{
    auth::jwt::Claims,
    domain::order::{Order, OrderItem, OrderItemInput},
    error::AppError,
    pagination::Pagination,
    state::AppState,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_orders).post(create_order))
        .route("/{id}", get(get_order).put(update_order_status).delete(delete_order))
}

fn is_manager(role: &str) -> bool {
    role == "admin" || role == "manager"
}

async fn list_orders(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<Order>>, AppError> {
    let (limit, offset) = pagination.limit_offset();
    let orders = if is_manager(&claims.role) {
        state.orders.list_all(limit, offset).await?
    } else {
        state.orders.list_for_user(claims.sub, limit, offset).await?
    };
    Ok(Json(orders))
}

async fn get_order(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<Json<(Order, Vec<OrderItem>)>, AppError> {
    let (order, items) = state.orders.find_by_id(id).await?;
    if !is_manager(&claims.role) && order.user_id != Some(claims.sub) {
        return Err(AppError::not_found("order not found"));
    }
    Ok(Json((order, items)))
}

#[derive(Deserialize)]
struct CreateOrderRequest {
    user_id: Option<i32>,
    items: Vec<OrderItemInputDto>,
}

#[derive(Deserialize)]
struct OrderItemInputDto {
    inventory_id: i32,
    quantity: i32,
}

async fn create_order(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreateOrderRequest>,
) -> Result<(StatusCode, Json<Order>), AppError> {
    let user_id = if claims.role == "customer" {
        Some(claims.sub)
    } else {
        payload.user_id.or(Some(claims.sub))
    };

    let items = payload
        .items
        .into_iter()
        .map(|i| OrderItemInput { inventory_id: i.inventory_id, quantity: i.quantity })
        .collect();

    state
        .orders
        .create(user_id, items)
        .await
        .map(|o| (StatusCode::CREATED, Json(o)))
}

#[derive(Deserialize)]
struct UpdateStatusRequest {
    status: String,
}

async fn update_order_status(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateStatusRequest>,
) -> Result<Json<Order>, AppError> {
    let order = state.orders.find_order_only(id).await?;
    if !is_manager(&claims.role) && order.user_id != Some(claims.sub) {
        return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
    }
    state.orders.update_status(id, payload.status).await.map(Json)
}

async fn delete_order(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    let order = state.orders.find_order_only(id).await?;
    if !is_manager(&claims.role) && order.user_id != Some(claims.sub) {
        return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
    }
    state.orders.delete(id).await?;
    Ok(StatusCode::NO_CONTENT)
}
