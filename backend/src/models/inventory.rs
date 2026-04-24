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

#[derive(Serialize)]
pub struct InventoryItemResponse {
    pub id: i32,
    pub item_name: String,
    pub description: Option<String>,
    pub sku: Option<String>,
    pub cost_price: Option<rust_decimal::Decimal>, // hidden for non‑admins
    pub unit_price: rust_decimal::Decimal,
    pub quantity: i32,
    pub category_id: Option<i32>,
    pub warehouse_id: Option<i32>, // hidden for non‑admins
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl InventoryItemResponse {
    pub fn from_item(item: InventoryItem, is_admin: bool) -> Self {
        Self {
            id: item.id,
            item_name: item.item_name,
            description: item.description,
            sku: item.sku,
            cost_price: if is_admin {
                Some(item.cost_price)
            } else {
                None
            },
            unit_price: item.unit_price,
            quantity: item.quantity,
            category_id: item.category_id,
            warehouse_id: if is_admin { item.warehouse_id } else { None },
            created_at: item.created_at,
            updated_at: item.updated_at,
        }
    }
}
