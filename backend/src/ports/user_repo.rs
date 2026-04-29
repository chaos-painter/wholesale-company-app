use async_trait::async_trait;
use crate::domain::user::{UpdateUserCmd, User};
use crate::error::AppError;

#[async_trait]
pub trait UserRepo: Send + Sync {
    async fn find_by_id(&self, id: i32) -> Result<User, AppError>;
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError>;
    async fn list(&self, limit: i64, offset: i64) -> Result<Vec<User>, AppError>;
    async fn create(
        &self,
        email: &str,
        password_hash: &str,
        real_name: Option<&str>,
        role_id: i32,
    ) -> Result<User, AppError>;
    async fn update(&self, id: i32, cmd: UpdateUserCmd) -> Result<User, AppError>;
    async fn delete(&self, id: i32) -> Result<(), AppError>;
}
