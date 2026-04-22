use axum::{ extract::{ Path, State }, http::StatusCode, routing::{ get, post }, Json, Router };
use serde::{ Deserialize, Serialize };
use sqlx::{ postgres::PgPoolOptions, FromRow, PgPool };
use std::env;



#[tokio::main]
async fn main() {
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new().connect(&db_url).await.expect("Failed to connect to DB");
    sqlx::migrate!().run(&pool).await.expect("Migrations failed");

    let app = Router::new()
        .route("/", get(root))
        .route("/users", post(create_user).get(list_users))
        .route("/users/{id}", get(get_user).put(update_user).delete(delete_user))
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    println!("🚀 Server running on port 8080");
    axum::serve(listener, app).await.unwrap();
}

//Endpoint Handlers
//test endpoint
async fn root() -> &'static str {
    "Welcome to the User Management API!"
}

