use backend::config::Config;
use backend::handlers::app_router;
use backend::state::AppState;
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

    println!("🚀 Migrations applied and server starting...");

    let state = AppState {
        db: pool,
        jwt_secret: config.jwt_secret,
        jwt_expiry_hours: config.jwt_expiry_hours,
    };

    let app = app_router(state).layer(CorsLayer::permissive());

    println!("🚀 Server running on http://0.0.0.0:3000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;

    Ok(())
}
