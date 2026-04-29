use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
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

#[derive(Debug, Clone, Serialize)]
pub struct InventoryItemView {
    pub id: i32,
    pub item_name: String,
    pub description: Option<String>,
    pub sku: Option<String>,
    pub cost_price: Option<Decimal>,
    pub unit_price: Decimal,
    pub quantity: i32,
    pub category_id: Option<i32>,
    pub warehouse_id: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl InventoryItem {
    pub fn into_view(self, show_admin_fields: bool) -> InventoryItemView {
        InventoryItemView {
            id: self.id,
            item_name: self.item_name,
            description: self.description,
            sku: self.sku,
            cost_price: if show_admin_fields { Some(self.cost_price) } else { None },
            unit_price: self.unit_price,
            quantity: self.quantity,
            category_id: self.category_id,
            warehouse_id: if show_admin_fields { self.warehouse_id } else { None },
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct InventoryFilters {
    pub category_id: Option<i32>,
    pub warehouse_id: Option<i32>,
    pub min_quantity: Option<i32>,
    pub search: Option<String>,
}

#[derive(Debug, Clone)]
pub struct CreateInventoryCmd {
    pub item_name: String,
    pub description: Option<String>,
    pub sku: Option<String>,
    pub cost_price: Decimal,
    pub unit_price: Decimal,
    pub quantity: i32,
    pub category_id: Option<i32>,
    pub warehouse_id: Option<i32>,
}

#[derive(Debug, Clone, Default)]
pub struct UpdateInventoryCmd {
    pub item_name: Option<String>,
    pub description: Option<String>,
    pub sku: Option<String>,
    pub cost_price: Option<Decimal>,
    pub unit_price: Option<Decimal>,
    pub quantity: Option<i32>,
    pub category_id: Option<i32>,
    pub warehouse_id: Option<i32>,
}
