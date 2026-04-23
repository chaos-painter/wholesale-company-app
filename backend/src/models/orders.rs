use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, FromRow)]
pub struct Order {
    pub id: i32,
    pub user_id: Option<i32>,
    pub status: String,
    pub total_amount: Option<Decimal>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, FromRow)]
pub struct OrderItem {
    pub id: i32,
    pub order_id: i32,
    pub inventory_id: i32,
    pub quantity: i32,
    pub price_at_purchase: Decimal,
}

#[derive(Deserialize)]
pub struct CreateOrder {
    pub user_id: Option<i32>,
    pub items: Vec<OrderItemRequest>,
}

#[derive(Deserialize)]
pub struct OrderItemRequest {
    pub inventory_id: i32,
    pub quantity: i32,
}

#[derive(Deserialize)]
pub struct UpdateOrderStatus {
    pub status: String,
}
