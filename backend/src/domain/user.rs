use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub email: String,
    #[serde(skip_serializing)]
    pub password: String,
    pub real_name: Option<String>,
    pub role_id: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Default)]
pub struct UpdateUserCmd {
    pub email: Option<String>,
    pub password_hash: Option<String>,
    pub real_name: Option<String>,
    pub role_id: Option<i32>,
}
