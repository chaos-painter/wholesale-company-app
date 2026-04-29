use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{FromRow, PgPool};

use crate::domain::warehouse::{CreateWarehouseCmd, UpdateWarehouseCmd, Warehouse};
use crate::error::AppError;
use crate::ports::WarehouseRepo;

#[derive(FromRow)]
struct WarehouseRow {
    id: i32,
    location_name: String,
    address: Option<String>,
    capacity: Option<i32>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<WarehouseRow> for Warehouse {
    fn from(r: WarehouseRow) -> Self {
        Self {
            id: r.id,
            location_name: r.location_name,
            address: r.address,
            capacity: r.capacity,
            created_at: r.created_at,
            updated_at: r.updated_at,
        }
    }
}

pub struct PgWarehouseRepo {
    pool: PgPool,
}

impl PgWarehouseRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl WarehouseRepo for PgWarehouseRepo {
    async fn list(&self, limit: i64, offset: i64) -> Result<Vec<Warehouse>, AppError> {
        sqlx::query_as::<_, WarehouseRow>(
            "SELECT * FROM warehouses ORDER BY id LIMIT $1 OFFSET $2",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await
        .map(|rows| rows.into_iter().map(Into::into).collect())
        .map_err(Into::into)
    }

    async fn find_by_id(&self, id: i32) -> Result<Warehouse, AppError> {
        sqlx::query_as::<_, WarehouseRow>("SELECT * FROM warehouses WHERE id = $1")
            .bind(id)
            .fetch_one(&self.pool)
            .await
            .map(Into::into)
            .map_err(Into::into)
    }

    async fn create(&self, cmd: CreateWarehouseCmd) -> Result<Warehouse, AppError> {
        sqlx::query_as::<_, WarehouseRow>(
            "INSERT INTO warehouses (location_name, address, capacity)
             VALUES ($1, $2, $3) RETURNING *",
        )
        .bind(cmd.location_name)
        .bind(cmd.address)
        .bind(cmd.capacity)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn update(&self, id: i32, cmd: UpdateWarehouseCmd) -> Result<Warehouse, AppError> {
        sqlx::query_as::<_, WarehouseRow>(
            "UPDATE warehouses SET
             location_name = COALESCE($1, location_name),
             address       = COALESCE($2, address),
             capacity      = COALESCE($3, capacity),
             updated_at    = NOW()
             WHERE id = $4 RETURNING *",
        )
        .bind(cmd.location_name)
        .bind(cmd.address)
        .bind(cmd.capacity)
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map(Into::into)
        .map_err(Into::into)
    }

    async fn delete(&self, id: i32) -> Result<(), AppError> {
        let rows = sqlx::query("DELETE FROM warehouses WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?
            .rows_affected();
        if rows == 0 {
            return Err(AppError::not_found("warehouse not found"));
        }
        Ok(())
    }
}
