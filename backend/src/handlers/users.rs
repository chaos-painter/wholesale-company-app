use crate::auth::jwt::Claims;
use crate::auth::password;
use crate::error::AppError;
use crate::models::users::{CreateUser, UpdateUser, User};
use crate::pagination::Pagination;
use crate::state::AppState;
use axum::{
    Extension, Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::get,
};

// Splits into:
// - admin_routes() for user CRUD (admin only)
// - user_routes() for authenticated user's own profile
pub fn admin_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_users).post(create_user))
        .route("/{id}", get(get_user).put(update_user).delete(delete_user))
}

pub fn user_routes() -> Router<AppState> {
    Router::new().route("/", get(get_my_profile))
}

// ---------- Admin handlers ----------
async fn list_users(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<Vec<User>>, AppError> {
    if claims.role != "admin" {
        return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
    }
    let (limit, offset) = pagination.limit_offset();
    let users = sqlx::query_as::<_, User>("SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2")
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?;
    Ok(Json(users))
}

async fn get_user(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<Json<User>, AppError> {
    if claims.role != "admin" {
        return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
    }
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await?;
    Ok(Json(user))
}

async fn create_user(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreateUser>,
) -> Result<(StatusCode, Json<User>), AppError> {
    if claims.role != "admin" {
        return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
    }
    let hashed = password::hash_password(&payload.password)?;
    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (email, password, real_name, role_id) VALUES ($1, $2, $3, $4) RETURNING *"
    )
    .bind(&payload.email)
    .bind(&hashed)
    .bind(&payload.real_name)
    .bind(payload.role_id)
    .fetch_one(&state.db)
    .await?;
    Ok((StatusCode::CREATED, Json(user)))
}

async fn update_user(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateUser>,
) -> Result<Json<User>, AppError> {
    if claims.role != "admin" {
        return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
    }
    // Hash new password if provided
    let hashed_password = match payload.password {
        Some(ref p) => Some(password::hash_password(p)?),
        None => None,
    };
    let user = sqlx::query_as::<_, User>(
        "UPDATE users SET email = COALESCE($1, email),
         password = COALESCE($2, password),
         real_name = COALESCE($3, real_name),
         role_id = COALESCE($4, role_id),
         updated_at = NOW()
         WHERE id = $5 RETURNING *",
    )
    .bind(payload.email)
    .bind(hashed_password)
    .bind(payload.real_name)
    .bind(payload.role_id)
    .bind(id)
    .fetch_one(&state.db)
    .await?;
    Ok(Json(user))
}

async fn delete_user(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    if claims.role != "admin" {
        return Err(AppError::new("Forbidden", StatusCode::FORBIDDEN));
    }
    // Prevent admin from deleting themselves? Optional.
    if id == claims.sub {
        return Err(AppError::bad_request("cannot delete your own account"));
    }
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

// ---------- Self‑profile handler ----------
async fn get_my_profile(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<User>, AppError> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(claims.sub)
        .fetch_one(&state.db)
        .await?;
    Ok(Json(user))
}
