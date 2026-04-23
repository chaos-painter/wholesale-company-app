use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, FromRow)]
pub struct Role {
    pub id: i32,
    pub role_name: String,
}

#[derive(Deserialize)]
pub struct CreateRole {
    pub role_name: String,
}

#[derive(Deserialize)]
pub struct UpdateRole {
    pub role_name: Option<String>,
}
