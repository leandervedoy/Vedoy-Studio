//! Vedoy CLI: safe one-command Git stage, commit and push.
//! Run from inside a Git working tree: cargo run --bin vedoy -- push
use std::{env,process::{Command,exit}};
fn git(args:&[&str])->Result<String,String>{
 let o=Command::new("git").args(args).output().map_err(|e|e.to_string())?;
 if !o.status.success(){return Err(String::from_utf8_lossy(&o.stderr).to_string())}
 Ok(String::from_utf8_lossy(&o.stdout).trim().to_string())
}
fn run(args:&[&str])->String{git(args).unwrap_or_else(|e|{eprintln!("git {} failed: {e}",args.join(" "));exit(1)})}
fn main(){
 let args:Vec<String>=env::args().skip(1).collect();
 if args.first().map(String::as_str)!=Some("push"){eprintln!("Usage: vedoy push [--dry-run] [-m MESSAGE]");exit(2)}
 let dry=args.iter().any(|a|a=="--dry-run");
 let message=if let Some(i)=args.iter().position(|a|a=="-m"){args.get(i+1).cloned().unwrap_or_else(||{eprintln!("Missing commit message");exit(2)})}else{"chore: update project".to_owned()};
 if message.trim().is_empty(){eprintln!("Empty commit message");exit(2)}
 run(&["rev-parse","--show-toplevel"]);
 let branch=run(&["symbolic-ref","--quiet","--short","HEAD"]);
 if branch=="main"||branch=="master"{eprintln!("Protected branch: use a feature branch for vedoy push");exit(1)}
 let status=run(&["status","--porcelain=v1","--untracked-files=all"]);
 if status.is_empty(){println!("No changes to stage.");return}
 println!("Changes:\n{status}");
 if status.lines().any(|l|{let p=l.get(3..).unwrap_or("").to_ascii_lowercase();p.ends_with(".env")||p.contains(".env.")||p.ends_with(".pem")||p.ends_with(".key")||p.contains("id_rsa")}){eprintln!("Sensitive-looking files detected. Review and stage manually.");exit(1)}
 if dry{println!("DRY RUN: would stage all, commit and push branch {branch}.");return}
 run(&["add","--all"]);
 let staged=run(&["diff","--cached","--name-only"]);
 if staged.is_empty(){println!("No staged changes.");return}
 // Abort if an existing conflict is unresolved; Git commit will also enforce this.
 run(&["diff","--cached","--check"]);
 run(&["commit","-m",&message]);
 let upstream=git(&["rev-parse","--abbrev-ref","--symbolic-full-name","@{upstream}"]);
 if upstream.is_ok(){run(&["push"])}else{run(&["push","--set-upstream","origin",&branch])};
 println!("Pushed branch {branch}. Merge into protected branches through review and CI.");
}
