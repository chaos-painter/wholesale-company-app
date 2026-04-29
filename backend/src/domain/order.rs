use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    pub id: i32,
    pub user_id: Option<i32>,
    pub status: String,
    pub total_amount: Option<Decimal>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderItem {
    pub id: i32,
    pub order_id: i32,
    pub inventory_id: i32,
    pub quantity: i32,
    pub price_at_purchase: Decimal,
}

#[derive(Debug, Clone)]
pub struct OrderItemInput {
    pub inventory_id: i32,
    pub quantity: i32,
}
