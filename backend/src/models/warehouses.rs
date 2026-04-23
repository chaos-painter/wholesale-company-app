use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, FromRow)]
pub struct Warehouse {
    pub id: i32,
    pub location_name: String,
    pub address: Option<String>,
    pub capacity: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct CreateWarehouse {
    pub location_name: String,
    pub address: Option<String>,
    pub capacity: Option<i32>,
}

#[derive(Deserialize)]
pub struct UpdateWarehouse {
    pub location_name: Option<String>,
    pub address: Option<String>,
    pub capacity: Option<i32>,
}
