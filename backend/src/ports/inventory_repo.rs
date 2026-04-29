use async_trait::async_trait;
use crate::domain::inventory::{CreateInventoryCmd, InventoryFilters, InventoryItem, UpdateInventoryCmd};
use crate::error::AppError;

#[async_trait]
pub trait InventoryRepo: Send + Sync {
    async fn list(
        &self,
        filters: &InventoryFilters,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<InventoryItem>, AppError>;
    async fn find_by_id(&self, id: i32) -> Result<InventoryItem, AppError>;
    async fn create(&self, cmd: CreateInventoryCmd) -> Result<InventoryItem, AppError>;
    async fn update(&self, id: i32, cmd: UpdateInventoryCmd) -> Result<InventoryItem, AppError>;
    async fn delete(&self, id: i32) -> Result<(), AppError>;
}
