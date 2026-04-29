use async_trait::async_trait;
use sqlx::{FromRow, PgPool};

use crate::domain::role::Role;
use crate::error::AppError;
use crate::ports::RoleRepo;

#[derive(FromRow)]
struct RoleRow {
    id: i32,
    role_name: String,
}

impl From<RoleRow> for Role {
    fn from(r: RoleRow) -> Self {
        Self { id: r.id, role_name: r.role_name }
    }
}

pub struct PgRoleRepo {
    pool: PgPool,
}

impl PgRoleRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl RoleRepo for PgRoleRepo {
    async fn find_by_id(&self, id: i32) -> Result<Role, AppError> {
        sqlx::query_as::<_, RoleRow>(
            "SELECT id, role_name FROM roles WHERE id = $1",
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn find_by_name(&self, name: &str) -> Result<Role, AppError> {
        sqlx::query_as::<_, RoleRow>(
            "SELECT id, role_name FROM roles WHERE role_name = $1",
        )
        .bind(name)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn list(&self, limit: i64, offset: i64) -> Result<Vec<Role>, AppError> {
        sqlx::query_as::<_, RoleRow>(
            "SELECT id, role_name FROM roles ORDER BY id LIMIT $1 OFFSET $2",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await
        .map(|rows| rows.into_iter().map(Into::into).collect())
        .map_err(Into::into)
    }

    async fn create(&self, name: &str) -> Result<Role, AppError> {
        sqlx::query_as::<_, RoleRow>(
            "INSERT INTO roles (role_name) VALUES ($1) RETURNING id, role_name",
        )
        .bind(name)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn update(&self, id: i32, name: Option<String>) -> Result<Role, AppError> {
        sqlx::query_as::<_, RoleRow>(
            "UPDATE roles SET role_name = COALESCE($1, role_name)
             WHERE id = $2 RETURNING id, role_name",
        )
        .bind(name)
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn delete(&self, id: i32) -> Result<(), AppError> {
        let rows = sqlx::query("DELETE FROM roles WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?
            .rows_affected();
        if rows == 0 {
            return Err(AppError::not_found("role not found"));
        }
        Ok(())
    }
}
