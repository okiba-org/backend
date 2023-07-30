use deadpool_postgres::Client;

use self::errors::MyError;

mod models {
    use serde::{Deserialize, Serialize};
    use tokio_pg_mapper_derive::PostgresMapper;

    #[derive(Deserialize, PostgresMapper, Serialize)]
    #[pg_mapper(table = "pastes")]
    pub struct Paste {
        pub endpoint: String,
        pub content: String,
    }
}

pub mod errors {
    use actix_web::{HttpResponse, ResponseError};
    use deadpool_postgres::PoolError;
    use derive_more::{Display, From};
    use serde_json::json;
    use tokio_pg_mapper::Error as PGMError;
    use tokio_postgres::error::Error as PGError;

    #[derive(Display, From, Debug)]
    pub enum MyError {
        NotFound,
        PGError(PGError),
        PGMError(PGMError),
        PoolError(PoolError),
    }
    impl std::error::Error for MyError {}

    impl ResponseError for MyError {
        fn error_response(&self) -> HttpResponse {
            match *self {
                MyError::NotFound => HttpResponse::NotFound().json(json!({
                    "message": "record not found"
                })),
                MyError::PoolError(ref err) => HttpResponse::InternalServerError().json(json!({
                    "message": err.to_string()
                })),
                _ => HttpResponse::InternalServerError().json(json!({
                    "message": "internal server error"
                })),
            }
        }
    }
}

pub async fn paste_id_exists(client: &Client, paste_id: &String) -> Result<bool, MyError> {
    let stmt_ = format!("SELECT 1 FROM bin.pastes WHERE paste_id = $1 LIMIT 1");
    let stmt = client.prepare(&stmt_).await.unwrap();

    let rows = client.query(&stmt, &[&paste_id]).await?;
    Ok(!rows.is_empty())
}

pub async fn add_paste(client: &Client, endpoint: &String, content: String) -> Result<(), MyError> {
    let insert_stmt_ = format!("INSERT INTO bin.pastes(paste_id, content) VALUES($1, $2)");
    let insert_stmt = client.prepare(&insert_stmt_).await.unwrap();

    client.query(&insert_stmt, &[&endpoint, &content]).await?;
    Ok(())
}
