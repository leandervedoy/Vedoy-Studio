//! Non-destructive Git merge preflight. Does not move refs, checkout files or push.
use std::{env,path::PathBuf,process::Command};
fn git(repo:&PathBuf,args:&[&str])->Result<(bool,String),String>{
 let out=Command::new("git").arg("-C").arg(repo).args(args).output().map_err(|e|e.to_string())?;
 let stdout=String::from_utf8_lossy(&out.stdout).to_string();
 let stderr=String::from_utf8_lossy(&out.stderr).to_string();
 Ok((out.status.success(),format!("{stdout}{stderr}")))
}
fn main(){
 let args:Vec<String>=env::args().collect();
 if args.len()!=4{eprintln!("Usage: merge_guard <repo_path> <target_ref> <source_ref>");std::process::exit(2)}
 let repo=PathBuf::from(&args[1]);
 let target=&args[2];let source=&args[3];
 for r in [target,source]{
  let (ok,output)=git(&repo,&["rev-parse","--verify","--end-of-options",&format!("{r}^{{commit}}")]).unwrap_or_else(|e|{eprintln!("{e}");std::process::exit(2)});
  if !ok{eprintln!("Invalid ref {r}: {output}");std::process::exit(2)}
 }
 let (ok,output)=git(&repo,&["merge-tree","--write-tree",target,source]).unwrap_or_else(|e|{eprintln!("{e}");std::process::exit(2)});
 if ok{
  let tree=output.lines().next().unwrap_or("");
  println!("MERGE_CANDIDATE_READY tree={tree}");
  println!("No branch changed. Create an integration commit on a protected staging branch after CI approval.");
 }else{
  println!("MERGE_CONFLICT: no refs or working files changed.\n{output}");
  println!("Open a review request. AI may propose a patch, never apply it automatically.");
  std::process::exit(1);
 }
}
