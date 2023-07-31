pub use config::ConfigError;
use config::{File, FileFormat};
use serde::Deserialize;

#[derive(Debug, Default, Deserialize, Clone)]
pub struct Config {
    pub db: deadpool_postgres::Config,
    pub server: ServerConfig,
    pub app: ApplicationConfig,
}

#[derive(Debug, Default, Deserialize, Clone)]
pub struct ServerConfig {
    pub port: u16,
    pub host: String,
}

#[derive(Debug, Default, Deserialize, Clone)]
pub struct ApplicationConfig {
    pub redis_uri: String,
    pub rate_limit: RateLimiterConfig,
    pub paste_id_length: u8,
}

#[derive(Debug, Default, Deserialize, Clone)]
pub struct RateLimiterConfig {
    pub time_seconds: u64,
    pub request_count: u64,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        let config = config::Config::builder()
            .add_source(File::new("configuration", FileFormat::Yaml))
            .build()?;
        config.try_deserialize()
    }
}
