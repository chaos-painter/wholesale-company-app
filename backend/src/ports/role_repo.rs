use async_trait::async_trait;
use crate::domain::role::Role;
use crate::error::AppError;

#[async_trait]
pub trait RoleRepo: Send + Sync {
    async fn find_by_id(&self, id: i32) -> Result<Role, AppError>;
    async fn find_by_name(&self, name: &str) -> Result<Role, AppError>;
    async fn list(&self, limit: i64, offset: i64) -> Result<Vec<Role>, AppError>;
    async fn create(&self, name: &str) -> Result<Role, AppError>;
    async fn update(&self, id: i32, name: Option<String>) -> Result<Role, AppError>;
    async fn delete(&self, id: i32) -> Result<(), AppError>;
}
