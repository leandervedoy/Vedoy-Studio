use axum::{http::{header,StatusCode},response::{Html,IntoResponse}};
pub async fn dashboard()->impl IntoResponse {
 ([(header::CACHE_CONTROL,"no-store"),(header::CONTENT_SECURITY_POLICY,"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'")],Html(include_str!("dashboard.html")))
}
