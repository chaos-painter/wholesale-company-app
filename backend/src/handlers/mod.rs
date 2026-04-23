pub mod categories;
pub mod inventory;
pub mod orders;
pub mod roles;
pub mod users;
pub mod warehouses;

use crate::state::AppState;
use axum::{Router, routing::get};

fn health_route() -> Router<AppState> {
    Router::new().route("/", get(|| async { "OK" }))
}

pub fn app_router() -> Router<AppState> {
    Router::new()
        .nest("/health", health_route())
        .nest("/roles", roles::router())
        .nest("/warehouses", warehouses::router())
        .nest("/users", users::router())
        .nest("/categories", categories::router())
        .nest("/inventory", inventory::router())
        .nest("/orders", orders::router())
}
