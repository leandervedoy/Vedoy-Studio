use axum::{extract::{Path,State},http::{HeaderMap,StatusCode},routing::{get,post},Json,Router};
use serde::{Deserialize,Serialize};
use rusqlite::{params,Connection};
use std::{env,sync::{Arc,Mutex}};
use uuid::Uuid;

#[derive(Clone)]
struct AppState{db:Arc<Mutex<Connection>>,token:String}
#[derive(Serialize,Deserialize)]
struct Resource{id:String,tenant_id:String,name:String,kind:String,adapter:String,status:String}
#[derive(Deserialize)]
struct NewResource{name:String,kind:String,adapter:String}
#[derive(Deserialize)]
struct ActionRequest{action:String,approved:bool}
#[derive(Serialize)]
struct Job{id:String,resource_id:String,action:String,status:String,detail:String}
fn authorize(headers:&HeaderMap,state:&AppState)->Result<String,StatusCode>{
 let provided=headers.get("authorization").and_then(|v|v.to_str().ok()).unwrap_or("");
 if provided!=format!("Bearer {}",state.token){return Err(StatusCode::UNAUTHORIZED)}
 let tenant=headers.get("x-tenant-id").and_then(|v|v.to_str().ok()).unwrap_or("demo");
 if tenant.len()>80||tenant.is_empty()||!tenant.chars().all(|c|c.is_ascii_alphanumeric()||c=='-'||c=='_'){return Err(StatusCode::BAD_REQUEST)}
 Ok(tenant.to_owned())
}
fn supported(kind:&str,adapter:&str)->bool{
 matches!((kind,adapter),("web","vercel")|("device","rust-agent")|("server","proxmox"))
}
async fn health()->Json<serde_json::Value>{Json(serde_json::json!({"status":"ok","service":"vedoy-control","version":"0.1.0"}))}
async fn resources(State(s):State<AppState>,h:HeaderMap)->Result<Json<Vec<Resource>>,StatusCode>{
 let tenant=authorize(&h,&s)?;
 let db=s.db.lock().map_err(|_|StatusCode::INTERNAL_SERVER_ERROR)?;
 let mut stmt=db.prepare("SELECT id,tenant_id,name,kind,adapter,status FROM resources WHERE tenant_id=? ORDER BY name").map_err(|_|StatusCode::INTERNAL_SERVER_ERROR)?;
 let rows=stmt.query_map([tenant],|r|Ok(Resource{id:r.get(0)?,tenant_id:r.get(1)?,name:r.get(2)?,kind:r.get(3)?,adapter:r.get(4)?,status:r.get(5)?})).map_err(|_|StatusCode::INTERNAL_SERVER_ERROR)?;
 Ok(Json(rows.filter_map(Result::ok).collect()))
}
async fn add_resource(State(s):State<AppState>,h:HeaderMap,Json(p):Json<NewResource>)->Result<(StatusCode,Json<Resource>),StatusCode>{
 let tenant=authorize(&h,&s)?;
 if p.name.trim().is_empty()||p.name.len()>100||!supported(&p.kind,&p.adapter){return Err(StatusCode::BAD_REQUEST)}
 let r=Resource{id:Uuid::new_v4().to_string(),tenant_id:tenant,name:p.name,kind:p.kind,adapter:p.adapter,status:"unverified".into()};
 let db=s.db.lock().map_err(|_|StatusCode::INTERNAL_SERVER_ERROR)?;
 db.execute("INSERT INTO resources VALUES (?1,?2,?3,?4,?5,?6)",params![r.id,r.tenant_id,r.name,r.kind,r.adapter,r.status]).map_err(|_|StatusCode::INTERNAL_SERVER_ERROR)?;
 Ok((StatusCode::CREATED,Json(r)))
}
async fn actions(State(s):State<AppState>,Path(id):Path<String>,h:HeaderMap,Json(p):Json<ActionRequest>)->Result<(StatusCode,Json<Job>),StatusCode>{
 let tenant=authorize(&h,&s)?;
 if !["inspect","update","backup","restart"].contains(&p.action.as_str()){return Err(StatusCode::BAD_REQUEST)}
 let db=s.db.lock().map_err(|_|StatusCode::INTERNAL_SERVER_ERROR)?;
 let found=db.query_row("SELECT kind FROM resources WHERE id=?1 AND tenant_id=?2",params![id,tenant],|r|r.get::<_,String>(0));
 if found.is_err(){return Err(StatusCode::NOT_FOUND)}
 let job=Job{id:Uuid::new_v4().to_string(),resource_id:id,action:p.action,status:if p.approved{"simulated"}else{"awaiting_approval"}.into(),detail:"Demo mode: no remote commands executed".into()};
 db.execute("INSERT INTO jobs VALUES (?1,?2,?3,?4,?5,?6)",params![job.id,tenant,job.resource_id,job.action,job.status,job.detail]).map_err(|_|StatusCode::INTERNAL_SERVER_ERROR)?;
 Ok((StatusCode::ACCEPTED,Json(job)))
}
async fn jobs(State(s):State<AppState>,h:HeaderMap)->Result<Json<Vec<Job>>,StatusCode>{
 let tenant=authorize(&h,&s)?;
 let db=s.db.lock().map_err(|_|StatusCode::INTERNAL_SERVER_ERROR)?;
 let mut stmt=db.prepare("SELECT id,resource_id,action,status,detail FROM jobs WHERE tenant_id=? ORDER BY rowid DESC LIMIT 50").map_err(|_|StatusCode::INTERNAL_SERVER_ERROR)?;
 let rows=stmt.query_map([tenant],|r|Ok(Job{id:r.get(0)?,resource_id:r.get(1)?,action:r.get(2)?,status:r.get(3)?,detail:r.get(4)?})).map_err(|_|StatusCode::INTERNAL_SERVER_ERROR)?;
 Ok(Json(rows.filter_map(Result::ok).collect()))
}
#[tokio::main]
async fn main(){
 let token=env::var("VEDOY_CONTROL_TOKEN").expect("Set VEDOY_CONTROL_TOKEN to a strong secret");
 assert!(token.len()>=32,"Token must contain at least 32 characters");
 let path=env::var("DATABASE_PATH").unwrap_or_else(|_|"vedoy-control.sqlite".into());
 let db=Connection::open(path).expect("database");
 db.execute_batch("PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS resources(id TEXT PRIMARY KEY,tenant_id TEXT NOT NULL,name TEXT NOT NULL,kind TEXT NOT NULL,adapter TEXT NOT NULL,status TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS resources_tenant ON resources(tenant_id);
 CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,tenant_id TEXT NOT NULL,resource_id TEXT NOT NULL,action TEXT NOT NULL,status TEXT NOT NULL,detail TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS jobs_tenant ON jobs(tenant_id);").expect("schema");
 let state=AppState{db:Arc::new(Mutex::new(db)),token};
 let app=Router::new().route("/health",get(health)).route("/api/v1/resources",get(resources).post(add_resource)).route("/api/v1/resources/{id}/actions",post(actions)).route("/api/v1/jobs",get(jobs)).with_state(state);
 let addr=env::var("BIND_ADDRESS").unwrap_or_else(|_|"127.0.0.1:8080".into());
 let listener=tokio::net::TcpListener::bind(&addr).await.expect("bind");
 println!("Vedoy Control API listening on {addr}");
 axum::serve(listener,app).await.expect("server");
}
#[cfg(test)]
mod tests{
 use super::*;
 #[test]fn adapters_are_explicit(){assert!(supported("web","vercel"));assert!(supported("device","rust-agent"));assert!(supported("server","proxmox"));assert!(!supported("server","vercel"));}
}
