use axum::{
    Extension, Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::{get, post, put},
};
use serde::Deserialize;

use crate::{
    auth::jwt::Claims,
    domain::category::Category,
    error::AppError,
    pagination::Pagination,
    state::AppState,
};

pub fn public_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_categories))
        .route("/{id}", get(get_category))
}

pub fn protected_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_category))
        .route("/{id}", put(update_category).delete(delete_category))
}

async fn list_categories(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<Category>>, AppError> {
    let (limit, offset) = pagination.limit_offset();
    state.categories.list(limit, offset).await.map(Json)
}

async fn get_category(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<Category>, AppError> {
    state.categories.find_by_id(id).await.map(Json)
}

#[derive(Deserialize)]
struct CreateCategoryRequest {
    category: String,
}

async fn create_category(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreateCategoryRequest>,
) -> Result<(StatusCode, Json<Category>), AppError> {
    if claims.role != "admin" {
        return Err(AppError::new("Forbidden – admin access required", StatusCode::FORBIDDEN));
    }
    state
        .categories
        .create(&payload.category)
        .await
        .map(|c| (StatusCode::CREATED, Json(c)))
}

#[derive(Deserialize)]
struct UpdateCategoryRequest {
    category: Option<String>,
}

async fn update_category(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateCategoryRequest>,
) -> Result<Json<Category>, AppError> {
    if claims.role != "admin" {
        return Err(AppError::new("Forbidden – admin access required", StatusCode::FORBIDDEN));
    }
    state.categories.update(id, payload.category).await.map(Json)
}

async fn delete_category(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    if claims.role != "admin" {
        return Err(AppError::new("Forbidden – admin access required", StatusCode::FORBIDDEN));
    }
    state.categories.delete(id).await?;
    Ok(StatusCode::NO_CONTENT)
}
