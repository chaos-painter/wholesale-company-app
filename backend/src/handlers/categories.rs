use crate::error::AppError;
use crate::models::categories::{Category, CreateCategory, UpdateCategory};
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
        .route("/", get(list_categories).post(create_category))
        .route(
            "/{id}",
            get(get_category)
                .put(update_category)
                .delete(delete_category),
        )
}

pub async fn list_categories(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<Category>>, AppError> {
    let (limit, offset) = pagination.limit_offset();
    let categories = sqlx::query_as::<_, Category>(
        "SELECT id, category FROM categories ORDER BY id LIMIT $1 OFFSET $2",
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.db)
    .await?;
    Ok(Json(categories))
}

pub async fn get_category(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<Category>, AppError> {
    let cat = sqlx::query_as::<_, Category>("SELECT id, category FROM categories WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await?;
    Ok(Json(cat))
}

pub async fn create_category(
    State(state): State<AppState>,
    Json(payload): Json<CreateCategory>,
) -> Result<(StatusCode, Json<Category>), AppError> {
    let cat = sqlx::query_as::<_, Category>(
        "INSERT INTO categories (category) VALUES ($1) RETURNING id, category",
    )
    .bind(&payload.category)
    .fetch_one(&state.db)
    .await?;
    Ok((StatusCode::CREATED, Json(cat)))
}

pub async fn update_category(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateCategory>,
) -> Result<Json<Category>, AppError> {
    let cat = sqlx::query_as::<_, Category>(
        "UPDATE categories SET category = COALESCE($1, category) WHERE id = $2 RETURNING id, category"
    )
    .bind(payload.category)
    .bind(id)
    .fetch_one(&state.db)
    .await?;
    Ok(Json(cat))
}

pub async fn delete_category(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    let rows = sqlx::query("DELETE FROM categories WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?
        .rows_affected();
    if rows == 0 {
        return Err(AppError::not_found("category not found"));
    }
    Ok(StatusCode::NO_CONTENT)
}
