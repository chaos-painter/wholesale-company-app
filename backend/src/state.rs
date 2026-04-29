use std::sync::Arc;

use crate::ports::{CategoryRepo, InventoryRepo, OrderRepo, RoleRepo, UserRepo, WarehouseRepo};

#[derive(Clone)]
pub struct AppState {
    pub users: Arc<dyn UserRepo>,
    pub orders: Arc<dyn OrderRepo>,
    pub inventory: Arc<dyn InventoryRepo>,
    pub categories: Arc<dyn CategoryRepo>,
    pub warehouses: Arc<dyn WarehouseRepo>,
    pub roles: Arc<dyn RoleRepo>,
    pub jwt_secret: String,
    pub jwt_expiry_hours: i64,
}
