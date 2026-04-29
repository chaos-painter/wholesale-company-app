use axum::{
    Extension, Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::get,
};
use serde::Deserialize;

use crate::{
    auth::jwt::Claims,
    domain::role::Role,
    error::AppError,
    pagination::Pagination,
    state::AppState,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_roles).post(create_role))
        .route("/{id}", get(get_role).put(update_role).delete(delete_role))
}

async fn list_roles(
    State(state): State<AppState>,
    Extension(_claims): Extension<Claims>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<Role>>, AppError> {
    let (limit, offset) = pagination.limit_offset();
    state.roles.list(limit, offset).await.map(Json)
}

async fn get_role(
    State(state): State<AppState>,
    Extension(_claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<Json<Role>, AppError> {
    state.roles.find_by_id(id).await.map(Json)
}

#[derive(Deserialize)]
struct CreateRoleRequest {
    role_name: String,
}

async fn create_role(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreateRoleRequest>,
) -> Result<(StatusCode, Json<Role>), AppError> {
    if claims.role != "admin" {
        return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
    }
    state
        .roles
        .create(&payload.role_name)
        .await
        .map(|r| (StatusCode::CREATED, Json(r)))
}

#[derive(Deserialize)]
struct UpdateRoleRequest {
    role_name: Option<String>,
}

async fn update_role(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateRoleRequest>,
) -> Result<Json<Role>, AppError> {
    if claims.role != "admin" {
        return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
    }
    state.roles.update(id, payload.role_name).await.map(Json)
}

async fn delete_role(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    if claims.role != "admin" {
        return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
    }
    state.roles.delete(id).await?;
    Ok(StatusCode::NO_CONTENT)
}
