use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, FromRow)]
pub struct InventoryItem {
    pub id: i32,
    pub item_name: String,
    pub description: Option<String>,
    pub sku: Option<String>,
    pub cost_price: Decimal,
    pub unit_price: Decimal,
    pub quantity: i32,
    pub category_id: Option<i32>,
    pub warehouse_id: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct CreateInventory {
    pub item_name: String,
    pub description: Option<String>,
    pub sku: Option<String>,
    pub cost_price: Decimal,
    pub unit_price: Decimal,
    pub quantity: Option<i32>,
    pub category_id: Option<i32>,
    pub warehouse_id: Option<i32>,
}

#[derive(Deserialize)]
pub struct UpdateInventory {
    pub item_name: Option<String>,
    pub description: Option<String>,
    pub sku: Option<String>,
    pub cost_price: Option<Decimal>,
    pub unit_price: Option<Decimal>,
    pub quantity: Option<i32>,
    pub category_id: Option<i32>,
    pub warehouse_id: Option<i32>,
}

#[derive(Deserialize)]
pub struct InventoryFilters {
    pub category_id: Option<i32>,
    pub warehouse_id: Option<i32>,
    pub min_quantity: Option<i32>,
    pub search: Option<String>,
}
