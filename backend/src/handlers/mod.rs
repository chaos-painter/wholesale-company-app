pub mod auth;
pub mod categories;
pub mod health;
pub mod inventory;
pub mod orders;
pub mod roles;
pub mod users;
pub mod warehouses;

use crate::middleware::auth::authenticate;
use crate::state::AppState;
use axum::{Router, middleware};

pub fn app_router(state: AppState) -> Router<()> {
    // 👈 return Router<()>
    let auth_layer = middleware::from_fn_with_state(state.clone(), authenticate);

    let public = Router::new()
        .nest("/health", health::router())
        .nest("/auth", auth::router())
        .nest("/categories", categories::public_routes())
        .nest("/inventory", inventory::public_routes());

    let authenticated = Router::new()
        .nest("/roles", roles::router())
        .nest("/warehouses", warehouses::router())
        .nest("/users/me", users::user_routes())
        .nest("/orders", orders::router())
        .nest("/categories", categories::protected_routes())
        .nest("/inventory", inventory::protected_routes())
        .nest("/users", users::admin_routes())
        .layer(auth_layer);

    public.merge(authenticated).with_state(state)
}
