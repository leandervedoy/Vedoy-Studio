export type NotesColor = "sand" | "lemon" | "mint" | "lavender" | "coral";
export interface NotesDocument { id:string; organizationId:string; title:string; content:string; color:NotesColor; pinned:boolean; notebook:string; section:string; tags:string[]; createdAt:string; updatedAt:string; }
export interface NotesVersion { id:string; noteId:string; title:string; content:string; color:NotesColor; notebook:string; section:string; tags:string[]; createdAt:string; }
export interface NotesAttachment { id:string; noteId:string; filename:string; contentType:string; sizeBytes:number; createdAt:string; }
export interface NotesShare { token:string; noteId:string; createdAt:string; }
