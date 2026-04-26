use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};

#[derive(Debug)]
pub struct AppError {
    pub message: String,
    pub status: StatusCode,
}

impl AppError {
    pub fn new(message: impl Into<String>, status: StatusCode) -> Self {
        Self {
            message: message.into(),
            status,
        }
    }
    pub fn not_found(msg: impl Into<String>) -> Self {
        Self::new(msg, StatusCode::NOT_FOUND)
    }
    pub fn bad_request(msg: impl Into<String>) -> Self {
        Self::new(msg, StatusCode::BAD_REQUEST)
    }
    pub fn internal(msg: impl Into<String>) -> Self {
        Self::new(msg, StatusCode::INTERNAL_SERVER_ERROR)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (self.status, Json(serde_json::json!({ "message": self.message }))).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(e: sqlx::Error) -> Self {
        match e {
            sqlx::Error::RowNotFound => AppError::not_found("resource not found"),
            _ => AppError::internal(format!("database error: {e}")),
        }
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::bad_request(format!("invalid JSON: {e}"))
    }
}
