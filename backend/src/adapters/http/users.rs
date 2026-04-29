use axum::{
    Extension, Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::get,
};
use serde::Deserialize;

use crate::{
    auth::{jwt::Claims, password},
    domain::user::{UpdateUserCmd, User},
    error::AppError,
    pagination::Pagination,
    state::AppState,
};

pub fn admin_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_users).post(create_user))
        .route("/{id}", get(get_user).put(update_user).delete(delete_user))
}

pub fn profile_routes() -> Router<AppState> {
    Router::new().route("/", get(get_my_profile))
}

fn require_admin(role: &str) -> Result<(), AppError> {
    if role != "admin" {
        return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
    }
    Ok(())
}

async fn list_users(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<User>>, AppError> {
    require_admin(&claims.role)?;
    let (limit, offset) = pagination.limit_offset();
    state.users.list(limit, offset).await.map(Json)
}

async fn get_user(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<Json<User>, AppError> {
    require_admin(&claims.role)?;
    state.users.find_by_id(id).await.map(Json)
}

#[derive(Deserialize)]
struct CreateUserRequest {
    email: String,
    password: String,
    real_name: Option<String>,
    role_id: Option<i32>,
}

async fn create_user(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<User>), AppError> {
    require_admin(&claims.role)?;
    let hash = password::hash_password(&payload.password)?;
    state
        .users
        .create(
            &payload.email,
            &hash,
            payload.real_name.as_deref(),
            payload.role_id.unwrap_or(3),
        )
        .await
        .map(|u| (StatusCode::CREATED, Json(u)))
}

#[derive(Deserialize)]
struct UpdateUserRequest {
    email: Option<String>,
    password: Option<String>,
    real_name: Option<String>,
    role_id: Option<i32>,
}

async fn update_user(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateUserRequest>,
) -> Result<Json<User>, AppError> {
    require_admin(&claims.role)?;
    let password_hash = match payload.password {
        Some(ref p) => Some(password::hash_password(p)?),
        None => None,
    };
    let cmd = UpdateUserCmd {
        email: payload.email,
        password_hash,
        real_name: payload.real_name,
        role_id: payload.role_id,
    };
    state.users.update(id, cmd).await.map(Json)
}

async fn delete_user(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    require_admin(&claims.role)?;
    if id == claims.sub {
        return Err(AppError::bad_request("cannot delete your own account"));
    }
    state.users.delete(id).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn get_my_profile(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<User>, AppError> {
    state.users.find_by_id(claims.sub).await.map(Json)
}
