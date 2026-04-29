use async_trait::async_trait;
use sqlx::{FromRow, PgPool};

use crate::domain::category::Category;
use crate::error::AppError;
use crate::ports::CategoryRepo;

#[derive(FromRow)]
struct CategoryRow {
    id: i32,
    category: String,
}

impl From<CategoryRow> for Category {
    fn from(r: CategoryRow) -> Self {
        Self { id: r.id, category: r.category }
    }
}

pub struct PgCategoryRepo {
    pool: PgPool,
}

impl PgCategoryRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl CategoryRepo for PgCategoryRepo {
    async fn list(&self, limit: i64, offset: i64) -> Result<Vec<Category>, AppError> {
        sqlx::query_as::<_, CategoryRow>(
            "SELECT id, category FROM categories ORDER BY id LIMIT $1 OFFSET $2",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await
        .map(|rows| rows.into_iter().map(Into::into).collect())
        .map_err(Into::into)
    }

    async fn find_by_id(&self, id: i32) -> Result<Category, AppError> {
        sqlx::query_as::<_, CategoryRow>(
            "SELECT id, category FROM categories WHERE id = $1",
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn create(&self, name: &str) -> Result<Category, AppError> {
        sqlx::query_as::<_, CategoryRow>(
            "INSERT INTO categories (category) VALUES ($1) RETURNING id, category",
        )
        .bind(name)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn update(&self, id: i32, name: Option<String>) -> Result<Category, AppError> {
        sqlx::query_as::<_, CategoryRow>(
            "UPDATE categories SET category = COALESCE($1, category)
             WHERE id = $2 RETURNING id, category",
        )
        .bind(name)
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn delete(&self, id: i32) -> Result<(), AppError> {
        let rows = sqlx::query("DELETE FROM categories WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?
            .rows_affected();
        if rows == 0 {
            return Err(AppError::not_found("category not found"));
        }
        Ok(())
    }
}
