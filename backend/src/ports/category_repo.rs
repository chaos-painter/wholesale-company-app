use async_trait::async_trait;
use crate::domain::category::Category;
use crate::error::AppError;

#[async_trait]
pub trait CategoryRepo: Send + Sync {
    async fn list(&self, limit: i64, offset: i64) -> Result<Vec<Category>, AppError>;
    async fn find_by_id(&self, id: i32) -> Result<Category, AppError>;
    async fn create(&self, name: &str) -> Result<Category, AppError>;
    async fn update(&self, id: i32, name: Option<String>) -> Result<Category, AppError>;
    async fn delete(&self, id: i32) -> Result<(), AppError>;
}
