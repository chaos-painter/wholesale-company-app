use axum::{
    Extension, Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::{get, post, put},
};
use rust_decimal::Decimal;
use serde::Deserialize;

use crate::{
    auth::jwt::Claims,
    domain::inventory::{
        CreateInventoryCmd, InventoryFilters, InventoryItemView, UpdateInventoryCmd,
    },
    error::AppError,
    pagination::Pagination,
    state::AppState,
};

pub fn public_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_inventory))
        .route("/{id}", get(get_inventory_item))
}

pub fn protected_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_inventory_item))
        .route("/{id}", put(update_inventory_item).delete(delete_inventory_item))
}

fn is_admin(claims: &Option<Extension<Claims>>) -> bool {
    claims
        .as_ref()
        .map_or(false, |e| e.role == "admin" || e.role == "manager")
}

async fn list_inventory(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
    Query(filters): Query<InventoryFilters>,
    claims: Option<Extension<Claims>>,
) -> Result<Json<Vec<InventoryItemView>>, AppError> {
    let (limit, offset) = pagination.limit_offset();
    let admin = is_admin(&claims);
    let items = state.inventory.list(&filters, limit, offset).await?;
    Ok(Json(items.into_iter().map(|i| i.into_view(admin)).collect()))
}

async fn get_inventory_item(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    claims: Option<Extension<Claims>>,
) -> Result<Json<InventoryItemView>, AppError> {
    let admin = is_admin(&claims);
    let item = state.inventory.find_by_id(id).await?;
    Ok(Json(item.into_view(admin)))
}

#[derive(Deserialize)]
struct CreateInventoryRequest {
    item_name: String,
    description: Option<String>,
    sku: Option<String>,
    cost_price: Decimal,
    unit_price: Decimal,
    quantity: Option<i32>,
    category_id: Option<i32>,
    warehouse_id: Option<i32>,
}

async fn create_inventory_item(
    State(state): State<AppState>,
    Json(payload): Json<CreateInventoryRequest>,
) -> Result<(StatusCode, Json<InventoryItemView>), AppError> {
    let cmd = CreateInventoryCmd {
        item_name: payload.item_name,
        description: payload.description,
        sku: payload.sku,
        cost_price: payload.cost_price,
        unit_price: payload.unit_price,
        quantity: payload.quantity.unwrap_or(0),
        category_id: payload.category_id,
        warehouse_id: payload.warehouse_id,
    };
    let item = state.inventory.create(cmd).await?;
    Ok((StatusCode::CREATED, Json(item.into_view(true))))
}

#[derive(Deserialize)]
struct UpdateInventoryRequest {
    item_name: Option<String>,
    description: Option<String>,
    sku: Option<String>,
    cost_price: Option<Decimal>,
    unit_price: Option<Decimal>,
    quantity: Option<i32>,
    category_id: Option<i32>,
    warehouse_id: Option<i32>,
}

async fn update_inventory_item(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateInventoryRequest>,
) -> Result<Json<InventoryItemView>, AppError> {
    let cmd = UpdateInventoryCmd {
        item_name: payload.item_name,
        description: payload.description,
        sku: payload.sku,
        cost_price: payload.cost_price,
        unit_price: payload.unit_price,
        quantity: payload.quantity,
        category_id: payload.category_id,
        warehouse_id: payload.warehouse_id,
    };
    let item = state.inventory.update(id, cmd).await?;
    Ok(Json(item.into_view(true)))
}

async fn delete_inventory_item(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    state.inventory.delete(id).await?;
    Ok(StatusCode::NO_CONTENT)
}
