use serde::{ Deserialize, Serialize };
use sqlx::{ postgres::PgPoolOptions, FromRow, PgPool };


#[derive(Deserialize)]
struct UserPayload {
    email: String,
    password: String,
    real_name: String,
}

#[derive(Serialize, FromRow)]
struct User {
    id: i32,
    email: String,
    password: String,
    real_name: String,
}


//GET ALL
async fn list_users(State(pool): State<PgPool>) -> Result<Json<Vec<User>>, StatusCode> {
    sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(&pool).await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

//CREATE USER
async fn create_user(
    State(pool): State<PgPool>,
    Json(payload): Json<UserPayload>
    ) -> Result<(StatusCode, Json<User>), StatusCode> {
    sqlx::query_as::<_, User>("INSERT INTO users (email, password, real_name) VALUES ($1, $2, $3) RETURNING *")
        .bind(payload.email)
        .bind(payload.password)
        .bind(payload.real_name)
        .fetch_one(&pool).await
        .map(|u| (StatusCode::CREATED, Json(u)))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

//GET USER BY ID
async fn get_user(
    State(pool): State<PgPool>,
    Path(id): Path<i32>
    ) -> Result<Json<User>, StatusCode> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(id)
        .fetch_one(&pool).await
        .map(Json)
        .map_err(|_| StatusCode::NOT_FOUND)
}

//UPDATE USER
async fn update_user(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
    Json(payload): Json<UserPayload>
    ) -> Result<Json<User>, StatusCode> {
    sqlx::query_as::<_, User>("UPDATE users SET name = $1, email = $2, real_name = $3 WHERE id = $4 RETURNING *")
        .bind(payload.email)
        .bind(payload.password)
        .bind(payload.real_name)
        .bind(id)
        .fetch_one(&pool).await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

//DELETE USER
async fn delete_user(
    State(pool): State<PgPool>,
    Path(id): Path<i32>
) -> Result<StatusCode, StatusCode> {
    let result = sqlx
        ::query("DELETE FROM users WHERE id = $1")
        .bind(id)
        .execute(&pool).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        Err(StatusCode::NOT_FOUND)
    } else {
        Ok(StatusCode::NO_CONTENT)
    }
}