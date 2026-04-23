use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, FromRow)]
pub struct Category {
    pub id: i32,
    pub category: String,
}

#[derive(Deserialize)]
pub struct CreateCategory {
    pub category: String,
}

#[derive(Deserialize)]
pub struct UpdateCategory {
    pub category: Option<String>,
}
