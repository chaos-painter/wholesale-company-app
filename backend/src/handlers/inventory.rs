use crate::error::AppError;
use crate::models::inventory::{CreateInventory, InventoryFilters, InventoryItem, UpdateInventory};
use crate::pagination::Pagination;
use crate::state::AppState;
use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    routing::get,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_inventory).post(create_inventory_item))
        .route(
            "/{id}",
            get(get_inventory_item)
                .put(update_inventory_item)
                .delete(delete_inventory_item),
        )
}

pub async fn list_inventory(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
    Query(filters): Query<InventoryFilters>,
) -> Result<Json<Vec<InventoryItem>>, AppError> {
    let (limit, offset) = pagination.limit_offset();
    let mut query = String::from("SELECT * FROM inventory WHERE 1=1");
    let mut params: Vec<String> = Vec::new();
    let mut bind_idx = 1;

    if let Some(_cat_id) = filters.category_id {
        params.push(format!("category_id = ${bind_idx}"));
        bind_idx += 1;
    }
    if let Some(_wh_id) = filters.warehouse_id {
        params.push(format!("warehouse_id = ${bind_idx}"));
        bind_idx += 1;
    }
    if let Some(_min_qty) = filters.min_quantity {
        params.push(format!("quantity >= ${bind_idx}"));
        bind_idx += 1;
    }
    if let Some(_search) = &filters.search {
        params.push(format!("item_name ILIKE ${bind_idx}"));
        bind_idx += 1;
    }

    if !params.is_empty() {
        query.push_str(" AND ");
        query.push_str(&params.join(" AND "));
    }
    let offset_idx = bind_idx + 1; // new variable
    query.push_str(&format!(
        " ORDER BY id LIMIT ${bind_idx} OFFSET ${offset_idx}"
    ));
    let mut query_obj = sqlx::query_as::<_, InventoryItem>(&query);

    if let Some(cat_id) = filters.category_id {
        query_obj = query_obj.bind(cat_id);
    }
    if let Some(wh_id) = filters.warehouse_id {
        query_obj = query_obj.bind(wh_id);
    }
    if let Some(min_qty) = filters.min_quantity {
        query_obj = query_obj.bind(min_qty);
    }
    if let Some(search) = &filters.search {
        query_obj = query_obj.bind(format!("%{}%", search));
    }
    query_obj = query_obj.bind(limit).bind(offset);

    let items = query_obj.fetch_all(&state.db).await?;
    Ok(Json(items))
}

pub async fn get_inventory_item(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<InventoryItem>, AppError> {
    let item = sqlx::query_as::<_, InventoryItem>("SELECT * FROM inventory WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await?;
    Ok(Json(item))
}

pub async fn create_inventory_item(
    State(state): State<AppState>,
    Json(payload): Json<CreateInventory>,
) -> Result<(StatusCode, Json<InventoryItem>), AppError> {
    let item = sqlx::query_as::<_, InventoryItem>(
        "INSERT INTO inventory (item_name, description, sku, cost_price, unit_price, quantity, category_id, warehouse_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *"
    )
    .bind(&payload.item_name)
    .bind(&payload.description)
    .bind(&payload.sku)
    .bind(payload.cost_price)
    .bind(payload.unit_price)
    .bind(payload.quantity.unwrap_or(0))
    .bind(payload.category_id)
    .bind(payload.warehouse_id)
    .fetch_one(&state.db)
    .await?;
    Ok((StatusCode::CREATED, Json(item)))
}

pub async fn update_inventory_item(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateInventory>,
) -> Result<Json<InventoryItem>, AppError> {
    let item = sqlx::query_as::<_, InventoryItem>(
        "UPDATE inventory SET
         item_name = COALESCE($1, item_name),
         description = COALESCE($2, description),
         sku = COALESCE($3, sku),
         cost_price = COALESCE($4, cost_price),
         unit_price = COALESCE($5, unit_price),
         quantity = COALESCE($6, quantity),
         category_id = COALESCE($7, category_id),
         warehouse_id = COALESCE($8, warehouse_id),
         updated_at = NOW()
         WHERE id = $9 RETURNING *",
    )
    .bind(payload.item_name)
    .bind(payload.description)
    .bind(payload.sku)
    .bind(payload.cost_price)
    .bind(payload.unit_price)
    .bind(payload.quantity)
    .bind(payload.category_id)
    .bind(payload.warehouse_id)
    .bind(id)
    .fetch_one(&state.db)
    .await?;
    Ok(Json(item))
}

pub async fn delete_inventory_item(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, AppError> {
    let rows = sqlx::query("DELETE FROM inventory WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?
        .rows_affected();
    if rows == 0 {
        return Err(AppError::not_found("inventory item not found"));
    }
    Ok(StatusCode::NO_CONTENT)
}
