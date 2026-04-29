use async_trait::async_trait;
use crate::domain::order::{Order, OrderItem, OrderItemInput};
use crate::error::AppError;

#[async_trait]
pub trait OrderRepo: Send + Sync {
    async fn list_for_user(
        &self,
        user_id: i32,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Order>, AppError>;
    async fn list_all(&self, limit: i64, offset: i64) -> Result<Vec<Order>, AppError>;
    async fn find_by_id(&self, id: i32) -> Result<(Order, Vec<OrderItem>), AppError>;
    async fn find_order_only(&self, id: i32) -> Result<Order, AppError>;
    async fn create(
        &self,
        user_id: Option<i32>,
        items: Vec<OrderItemInput>,
    ) -> Result<Order, AppError>;
    async fn update_status(&self, id: i32, status: String) -> Result<Order, AppError>;
    async fn delete(&self, id: i32) -> Result<(), AppError>;
}
