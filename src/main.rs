mod cfg;
mod db;
use crate::db::errors::MyError;
use actix_extensible_rate_limit::{
    backend::{redis::RedisBackend, SimpleInputFunctionBuilder},
    RateLimiter,
};
use actix_web::{
    get, post,
    web::{self},
    App, Error, HttpResponse, HttpServer,
};
use cfg::ApplicationConfig;
use cfg::Config;
use deadpool_postgres::{Client, Pool};
use dotenv::dotenv;
use rand::{distributions::Alphanumeric, Rng};
use redis::aio::ConnectionManager;
use serde_json::json;
use std::time::Duration;
use tokio_postgres::NoTls;

fn generate_endpoint(length: u8) -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(length as usize)
        .map(char::from)
        .collect()
}

#[get("/paste/{paste_id}")]
async fn fetch_paste(
    db_pool: web::Data<Pool>,
    paste_id: web::Path<String>,
) -> Result<HttpResponse, Error> {
    let client: Client = db_pool.get().await.map_err(MyError::PoolError)?;
    if !db::paste_id_exists(&client, &paste_id).await? {
        return Ok(HttpResponse::NotFound().json(json!({
            "message": "paste with specified id does not exist"
        })));
    }

    let content = db::get_paste(&client, &paste_id).await?;
    Ok(HttpResponse::Ok().body(content))
}

#[post("/paste")]
async fn new_paste(
    db_pool: web::Data<Pool>,
    app_config: web::Data<ApplicationConfig>,
    body: String,
) -> Result<HttpResponse, Error> {
    let client: Client = db_pool.get().await.map_err(MyError::PoolError)?;

    let mut endpoint = generate_endpoint(app_config.paste_id_length);
    // check if endpoint already exists
    loop {
        if db::paste_id_exists(&client, &endpoint).await? {
            endpoint = generate_endpoint(app_config.paste_id_length)
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
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let config = Config::from_env().unwrap();
    log::info!("Connecting database");
    let pool = config.db.create_pool(None, NoTls).unwrap();

    let redis_client = redis::Client::open(config.app.redis_uri.clone())
        .expect("Couldn't connect to redis database");
    let redis_cm = ConnectionManager::new(redis_client).await.unwrap();
    let redis_backend = RedisBackend::builder(redis_cm).build();

    let server = HttpServer::new(move || {
        let input = SimpleInputFunctionBuilder::new(
            Duration::from_secs(config.app.rate_limit.time_seconds),
            config.app.rate_limit.request_count,
        )
        .real_ip_key()
        .build();
        let middleware = RateLimiter::builder(redis_backend.clone(), input)
            .add_headers()
            .build();

        App::new()
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(config.app.clone()))
            .wrap(middleware)
            .service(new_paste)
            .service(fetch_paste)
    })
    .bind((&*config.server.host, config.server.port))?
    .run();

    log::info!(
        "Starting the server at http://{}:{}",
        config.server.host,
        config.server.port
    );

    server.await
}
