use crate::error::AppError;
use crate::models::warehouses::{CreateWarehouse, UpdateWarehouse, Warehouse};
use crate::pagination::Pagination;
use crate::state::AppState;
use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::get,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_warehouses).post(create_warehouse))
        .route(
            "/{id}",
            get(get_warehouse)
                .put(update_warehouse)
                .delete(delete_warehouse),
        )
}

pub async fn list_warehouses(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<Warehouse>>, AppError> {
    let (limit, offset) = pagination.limit_offset();
    let warehouses =
        sqlx::query_as::<_, Warehouse>("SELECT * FROM warehouses ORDER BY id LIMIT $1 OFFSET $2")
            .bind(limit)
            .bind(offset)
            .fetch_all(&state.db)
            .await?;
    Ok(Json(warehouses))
}

pub async fn get_warehouse(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<Warehouse>, AppError> {
    let warehouse = sqlx::query_as::<_, Warehouse>("SELECT * FROM warehouses WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await?;
    Ok(Json(warehouse))
}

pub async fn create_warehouse(
    State(state): State<AppState>,
    Json(payload): Json<CreateWarehouse>,
) -> Result<(StatusCode, Json<Warehouse>), AppError> {
    let warehouse = sqlx::query_as::<_, Warehouse>(
        "INSERT INTO warehouses (location_name, address, capacity) VALUES ($1, $2, $3) RETURNING *",
    )
    .bind(&payload.location_name)
    .bind(&payload.address)
    .bind(payload.capacity)
    .fetch_one(&state.db)
    .await?;
    Ok((StatusCode::CREATED, Json(warehouse)))
}

pub async fn update_warehouse(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateWarehouse>,
) -> Result<Json<Warehouse>, AppError> {
    let warehouse = sqlx::query_as::<_, Warehouse>(
        "UPDATE warehouses SET location_name = COALESCE($1, location_name),
         address = COALESCE($2, address),
         capacity = COALESCE($3, capacity),
         updated_at = NOW()
         WHERE id = $4 RETURNING *",
    )
    .bind(payload.location_name)
    .bind(payload.address)
    .bind(payload.capacity)
    .bind(id)
    .fetch_one(&state.db)
    .await?;
    Ok(Json(warehouse))
}

pub async fn delete_warehouse(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    let rows = sqlx::query("DELETE FROM warehouses WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?
        .rows_affected();
    if rows == 0 {
        return Err(AppError::not_found("warehouse not found"));
    }
    Ok(StatusCode::NO_CONTENT)
}
