use async_trait::async_trait;
use crate::domain::warehouse::{CreateWarehouseCmd, UpdateWarehouseCmd, Warehouse};
use crate::error::AppError;

#[async_trait]
pub trait WarehouseRepo: Send + Sync {
    async fn list(&self, limit: i64, offset: i64) -> Result<Vec<Warehouse>, AppError>;
    async fn find_by_id(&self, id: i32) -> Result<Warehouse, AppError>;
    async fn create(&self, cmd: CreateWarehouseCmd) -> Result<Warehouse, AppError>;
    async fn update(&self, id: i32, cmd: UpdateWarehouseCmd) -> Result<Warehouse, AppError>;
    async fn delete(&self, id: i32) -> Result<(), AppError>;
}
