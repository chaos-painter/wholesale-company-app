use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{FromRow, PgPool};

use crate::domain::user::{UpdateUserCmd, User};
use crate::error::AppError;
use crate::ports::UserRepo;

#[derive(FromRow)]
struct UserRow {
    id: i32,
    email: String,
    password: String,
    real_name: Option<String>,
    role_id: Option<i32>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<UserRow> for User {
    fn from(r: UserRow) -> Self {
        Self {
            id: r.id,
            email: r.email,
            password: r.password,
            real_name: r.real_name,
            role_id: r.role_id,
            created_at: r.created_at,
            updated_at: r.updated_at,
        }
    }
}

pub struct PgUserRepo {
    pool: PgPool,
}

impl PgUserRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl UserRepo for PgUserRepo {
    async fn find_by_id(&self, id: i32) -> Result<User, AppError> {
        sqlx::query_as::<_, UserRow>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_one(&self.pool)
            .await
            .map(Into::into)
            .map_err(Into::into)
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError> {
        sqlx::query_as::<_, UserRow>("SELECT * FROM users WHERE email = $1")
            .bind(email)
            .fetch_optional(&self.pool)
            .await
            .map(|opt| opt.map(Into::into))
            .map_err(Into::into)
    }

    async fn list(&self, limit: i64, offset: i64) -> Result<Vec<User>, AppError> {
        sqlx::query_as::<_, UserRow>(
            "SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await
        .map(|rows| rows.into_iter().map(Into::into).collect())
        .map_err(Into::into)
    }

    async fn create(
        &self,
        email: &str,
        password_hash: &str,
        real_name: Option<&str>,
        role_id: i32,
    ) -> Result<User, AppError> {
        sqlx::query_as::<_, UserRow>(
            "INSERT INTO users (email, password, real_name, role_id)
             VALUES ($1, $2, $3, $4) RETURNING *",
        )
        .bind(email)
        .bind(password_hash)
        .bind(real_name)
        .bind(role_id)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn update(&self, id: i32, cmd: UpdateUserCmd) -> Result<User, AppError> {
        sqlx::query_as::<_, UserRow>(
            "UPDATE users SET
             email      = COALESCE($1, email),
             password   = COALESCE($2, password),
             real_name  = COALESCE($3, real_name),
             role_id    = COALESCE($4, role_id),
             updated_at = NOW()
             WHERE id = $5 RETURNING *",
        )
        .bind(cmd.email)
        .bind(cmd.password_hash)
        .bind(cmd.real_name)
        .bind(cmd.role_id)
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn delete(&self, id: i32) -> Result<(), AppError> {
        let rows = sqlx::query("DELETE FROM users WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?
            .rows_affected();
        if rows == 0 {
            return Err(AppError::not_found("user not found"));
        }
        Ok(())
    }
}
