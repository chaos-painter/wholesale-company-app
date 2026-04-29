use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Warehouse {
    pub id: i32,
    pub location_name: String,
    pub address: Option<String>,
    pub capacity: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct CreateWarehouseCmd {
    pub location_name: String,
    pub address: Option<String>,
    pub capacity: Option<i32>,
}

#[derive(Debug, Clone, Default)]
pub struct UpdateWarehouseCmd {
    pub location_name: Option<String>,
    pub address: Option<String>,
    pub capacity: Option<i32>,
}
