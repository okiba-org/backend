mod cfg;
mod db;
use crate::db::errors::MyError;
use actix_web::{
    post,
    web::{self},
    App, Error, HttpResponse, HttpServer,
};
use cfg::AppConfig;
use deadpool_postgres::{Client, Pool};
use dotenv::dotenv;
use rand::{distributions::Alphanumeric, Rng};
use serde_json::json;
use std::str::{self};
use tokio_postgres::NoTls;

fn generate_endpoint(length: u8) -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(length as usize)
        .map(char::from)
        .collect()
}

#[post("/paste")]
async fn paste(db_pool: web::Data<Pool>, body: String) -> Result<HttpResponse, Error> {
    let client: Client = db_pool.get().await.map_err(MyError::PoolError)?;

    let mut endpoint = generate_endpoint(5);
    // check if endpoint already exists
    loop {
        if db::paste_id_exists(&client, &endpoint).await? {
            endpoint = generate_endpoint(5)
        } else {
            break;
        }
    }

    db::add_paste(&client, &endpoint, body).await?;
    Ok(HttpResponse::Ok().json(json!({
        "paste_id": endpoint,
        "message": "code pasted successfully",
    })))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    const ADDR: (&str, u16) = ("127.0.0.1", 8080);
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let config = AppConfig::from_env().unwrap();
    log::info!("Connecting database");
    let pool = config.pg.create_pool(None, NoTls).unwrap();

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .service(paste)
    })
    .bind(ADDR)?
    .run();

    log::info!("Starting the server at http://{}:{}", ADDR.0, ADDR.1);

    server.await
}
