use crate::error::AppError;
use crate::models::users::{CreateUser, UpdateUser, User};
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
        .route("/", get(list_users).post(create_user))
        .route("/{id}", get(get_user).put(update_user).delete(delete_user))
}

pub async fn list_users(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<User>>, AppError> {
    let (limit, offset) = pagination.limit_offset();
    let users = sqlx::query_as::<_, User>("SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2")
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?;
    Ok(Json(users))
}

pub async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<User>, AppError> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await?;
    Ok(Json(user))
}

pub async fn create_user(
    State(state): State<AppState>,
    Json(payload): Json<CreateUser>,
) -> Result<(StatusCode, Json<User>), AppError> {
    // TODO: hash password here (e.g., bcrypt::hash(payload.password, ...))
    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (email, password, real_name, role_id) VALUES ($1, $2, $3, $4) RETURNING *"
    )
    .bind(&payload.email)
    .bind(&payload.password) // plain text – unsafe
    .bind(&payload.real_name)
    .bind(payload.role_id)
    .fetch_one(&state.db)
    .await?;
    Ok((StatusCode::CREATED, Json(user)))
}

pub async fn update_user(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateUser>,
) -> Result<Json<User>, AppError> {
    // Note: if password is updated, hash it first
    let user = sqlx::query_as::<_, User>(
        "UPDATE users SET email = COALESCE($1, email),
         password = COALESCE($2, password),
         real_name = COALESCE($3, real_name),
         role_id = COALESCE($4, role_id),
         updated_at = NOW()
         WHERE id = $5 RETURNING *",
    )
    .bind(payload.email)
    .bind(payload.password) // hash if changed
    .bind(payload.real_name)
    .bind(payload.role_id)
    .bind(id)
    .fetch_one(&state.db)
    .await?;
    Ok(Json(user))
}

pub async fn delete_user(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    let rows = sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?
        .rows_affected();
    if rows == 0 {
        return Err(AppError::not_found("user not found"));
    }
    Ok(StatusCode::NO_CONTENT)
}
