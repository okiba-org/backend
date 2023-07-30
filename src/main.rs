mod cfg;
use actix_web::{
    post,
    web::{self, Bytes},
    App, HttpServer,
};
use cfg::AppConfig;
use dotenv::dotenv;
use std::str::{self};
use tokio_postgres::NoTls;

#[post("/paste")]
async fn greet(bytes: Bytes) -> &'static str {
    let payload = str::from_utf8(&bytes).unwrap();
    "Hello World!"
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    const ADDR: (&str, u16) = ("127.0.0.1", 8080);
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let config = AppConfig::from_env().unwrap();
    let pool = config.pg.create_pool(None, NoTls).unwrap();

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .service(greet)
    })
    .bind(ADDR)?
    .run();

    log::info!("Starting the server at http://{}:{}", ADDR.0, ADDR.1);

    server.await
}
