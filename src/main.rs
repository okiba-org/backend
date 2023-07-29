use actix_web::{get, App, HttpServer};

#[get("/")]
async fn greet() -> &'static str {
    "Hello, World"
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    const ADDR: (&str, u16) = ("127.0.0.1", 8080);
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    log::info!("Starting the server at http://{}:{}", ADDR.0, ADDR.1);
    HttpServer::new(|| App::new().service(greet))
        .bind(ADDR)?
        .run()
        .await
}
