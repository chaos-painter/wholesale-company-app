use axum::{
    Extension, Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::get,
};
use serde::Deserialize;

use crate::{
    auth::jwt::Claims,
    domain::warehouse::{CreateWarehouseCmd, UpdateWarehouseCmd, Warehouse},
    error::AppError,
    pagination::Pagination,
    state::AppState,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_warehouses).post(create_warehouse))
        .route("/{id}", get(get_warehouse).put(update_warehouse).delete(delete_warehouse))
}

fn require_manager(role: &str) -> Result<(), AppError> {
    if role != "admin" && role != "manager" {
        return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
    }
    Ok(())
}

async fn list_warehouses(
    State(state): State<AppState>,
    Extension(_claims): Extension<Claims>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<Warehouse>>, AppError> {
    let (limit, offset) = pagination.limit_offset();
    state.warehouses.list(limit, offset).await.map(Json)
}

async fn get_warehouse(
    State(state): State<AppState>,
    Extension(_claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<Json<Warehouse>, AppError> {
    state.warehouses.find_by_id(id).await.map(Json)
}

#[derive(Deserialize)]
struct CreateWarehouseRequest {
    location_name: String,
    address: Option<String>,
    capacity: Option<i32>,
}

async fn create_warehouse(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreateWarehouseRequest>,
) -> Result<(StatusCode, Json<Warehouse>), AppError> {
    require_manager(&claims.role)?;
    let cmd = CreateWarehouseCmd {
        location_name: payload.location_name,
        address: payload.address,
        capacity: payload.capacity,
    };
    state
        .warehouses
        .create(cmd)
        .await
        .map(|w| (StatusCode::CREATED, Json(w)))
}

#[derive(Deserialize)]
struct UpdateWarehouseRequest {
    location_name: Option<String>,
    address: Option<String>,
    capacity: Option<i32>,
}

async fn update_warehouse(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateWarehouseRequest>,
) -> Result<Json<Warehouse>, AppError> {
    require_manager(&claims.role)?;
    let cmd = UpdateWarehouseCmd {
        location_name: payload.location_name,
        address: payload.address,
        capacity: payload.capacity,
    };
    state.warehouses.update(id, cmd).await.map(Json)
}

async fn delete_warehouse(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    require_manager(&claims.role)?;
    state.warehouses.delete(id).await?;
    Ok(StatusCode::NO_CONTENT)
}
