use crate::error::AppError;
use crate::models::roles::{CreateRole, Role, UpdateRole};
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
        .route("/", get(list_roles).post(create_role))
        .route("/{id}", get(get_role).put(update_role).delete(delete_role))
}

pub async fn list_roles(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<Role>>, AppError> {
    let (limit, offset) = pagination.limit_offset();
    let roles =
        sqlx::query_as::<_, Role>("SELECT id, role_name FROM roles ORDER BY id LIMIT $1 OFFSET $2")
            .bind(limit)
            .bind(offset)
            .fetch_all(&state.db)
            .await?;
    Ok(Json(roles))
}

pub async fn get_role(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<Role>, AppError> {
    let role = sqlx::query_as::<_, Role>("SELECT id, role_name FROM roles WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await?;
    Ok(Json(role))
}

pub async fn create_role(
    State(state): State<AppState>,
    Json(payload): Json<CreateRole>,
) -> Result<(StatusCode, Json<Role>), AppError> {
    let role = sqlx::query_as::<_, Role>(
        "INSERT INTO roles (role_name) VALUES ($1) RETURNING id, role_name",
    )
    .bind(&payload.role_name)
    .fetch_one(&state.db)
    .await?;
    Ok((StatusCode::CREATED, Json(role)))
}

pub async fn update_role(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateRole>,
) -> Result<Json<Role>, AppError> {
    let role = sqlx::query_as::<_, Role>(
        "UPDATE roles SET role_name = COALESCE($1, role_name) WHERE id = $2 RETURNING id, role_name"
    )
    .bind(payload.role_name)
    .bind(id)
    .fetch_one(&state.db)
    .await?;
    Ok(Json(role))
}

pub async fn delete_role(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    let rows = sqlx::query("DELETE FROM roles WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?
        .rows_affected();
    if rows == 0 {
        return Err(AppError::not_found("role not found"));
    }
    Ok(StatusCode::NO_CONTENT)
}
