use axum::{
    extract::{Request, State},
    http::{StatusCode, header},
    middleware::Next,
    response::Response,
};

use crate::{auth::jwt, error::AppError, state::AppState};

pub async fn authenticate(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let header = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| AppError::new("Missing authorization header", StatusCode::UNAUTHORIZED))?;

    let token = header
        .strip_prefix("Bearer ")
        .ok_or_else(|| AppError::new("Invalid authorization format", StatusCode::UNAUTHORIZED))?;

    let claims = jwt::validate_token(token, &state.jwt_secret)?;
    req.extensions_mut().insert(claims);
    Ok(next.run(req).await)
}
