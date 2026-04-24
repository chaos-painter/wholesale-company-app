use crate::{
    auth::{jwt, password},
    error::AppError,
    models::auth::{LoginRequest, LoginResponse, RegisterRequest},
    models::users::User,
    state::AppState,
};
use axum::{Json, Router, extract::State, http::StatusCode, routing::post};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/login", post(login))
        .route("/register", post(register))
}

async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, AppError> {
    // 1. Look up user by email
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_one(&state.db)
        .await
        .map_err(|_| AppError::new("Invalid email or password", StatusCode::UNAUTHORIZED))?;

    // 2. Verify password hash
    if !password::verify_password(&payload.password, &user.password)? {
        return Err(AppError::new(
            "Invalid email or password",
            StatusCode::UNAUTHORIZED,
        ));
    }

    // 3. Get role name
    let role_name = sqlx::query_scalar::<_, String>("SELECT role_name FROM roles WHERE id = $1")
        .bind(user.role_id)
        .fetch_one(&state.db)
        .await
        .map_err(|_| AppError::internal("role not found"))?;

    // 4. Create JWT
    let token = jwt::create_token(
        user.id,
        &user.email,
        &role_name,
        &state.jwt_secret,
        state.jwt_expiry_hours,
    )?;

    Ok(Json(LoginResponse { token }))
}

async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<User>), AppError> {
    let existing = sqlx::query_scalar::<_, i32>("SELECT id FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.db)
        .await?;

    if existing.is_some() {
        return Err(AppError::bad_request("Email already in use"));
    }

    let customer_role_id =
        sqlx::query_scalar::<_, i32>("SELECT id FROM roles WHERE role_name = 'customer'")
            .fetch_one(&state.db)
            .await
            .map_err(|_| {
                AppError::internal("Default role not found - database misconfiguration")
            })?;

    let hashed = password::hash_password(&payload.password)?;

    // 4. Insert user
    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (email, password, real_name, role_id) VALUES ($1, $2, $3, $4) RETURNING *"
    )
    .bind(&payload.email)
    .bind(&hashed)
    .bind(&payload.real_name)
    .bind(customer_role_id)
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(user)))
}
