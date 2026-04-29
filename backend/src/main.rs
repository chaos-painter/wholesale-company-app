use std::sync::Arc;

use backend::{
    adapters::{
        db::{
            PgCategoryRepo, PgInventoryRepo, PgOrderRepo, PgRoleRepo, PgUserRepo, PgWarehouseRepo,
        },
        http::app_router,
    },
    config::Config,
    state::AppState,
};
use sqlx::postgres::PgPoolOptions;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::from_env();

    let pool = PgPoolOptions::new()
        .max_connections(20)
        .connect(&config.database_url)
        .await?;

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    let state = AppState {
        users: Arc::new(PgUserRepo::new(pool.clone())),
        orders: Arc::new(PgOrderRepo::new(pool.clone())),
        inventory: Arc::new(PgInventoryRepo::new(pool.clone())),
        categories: Arc::new(PgCategoryRepo::new(pool.clone())),
        warehouses: Arc::new(PgWarehouseRepo::new(pool.clone())),
        roles: Arc::new(PgRoleRepo::new(pool.clone())),
        jwt_secret: config.jwt_secret,
        jwt_expiry_hours: config.jwt_expiry_hours,
    };

    println!("🚀 Server running on http://0.0.0.0:3000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app_router(state).layer(CorsLayer::permissive())).await?;

    Ok(())
}
