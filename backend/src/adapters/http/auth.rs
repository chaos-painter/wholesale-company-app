use axum::{Json, Router, extract::State, http::StatusCode, routing::post};
use serde::{Deserialize, Serialize};

use crate::{
    auth::{jwt, password},
    error::AppError,
    state::AppState,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/login", post(login))
        .route("/register", post(register))
}

#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Serialize)]
struct LoginResponse {
    token: String,
}

#[derive(Deserialize)]
struct RegisterRequest {
    email: String,
    password: String,
    real_name: Option<String>,
}

async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, AppError> {
    let user = state
        .users
        .find_by_email(&payload.email)
        .await?
        .ok_or_else(|| AppError::new("Invalid email or password", StatusCode::UNAUTHORIZED))?;

    if !password::verify_password(&payload.password, &user.password)? {
        return Err(AppError::new("Invalid email or password", StatusCode::UNAUTHORIZED));
    }

    let role = state.roles.find_by_id(user.role_id.unwrap_or(0)).await?;

    let token = jwt::create_token(
        user.id,
        &user.email,
        &role.role_name,
        &state.jwt_secret,
        state.jwt_expiry_hours,
    )?;

    Ok(Json(LoginResponse { token }))
}

async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<crate::domain::user::User>), AppError> {
    if state.users.find_by_email(&payload.email).await?.is_some() {
        return Err(AppError::bad_request("Email already in use"));
    }

    let customer_role = state
        .roles
        .find_by_name("customer")
        .await
        .map_err(|_| AppError::internal("Default role not found – database misconfiguration"))?;

    let hash = password::hash_password(&payload.password)?;
    let user = state
        .users
        .create(
            &payload.email,
            &hash,
            payload.real_name.as_deref(),
            customer_role.id,
        )
        .await?;

    Ok((StatusCode::CREATED, Json(user)))
}
