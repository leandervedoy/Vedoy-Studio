alter table studio_notes add column if not exists notebook text not null default 'Arbeidsområde';
alter table studio_notes add column if not exists section text not null default 'Generelt';
alter table studio_notes add column if not exists tags jsonb not null default '[]'::jsonb;
create index if not exists studio_notes_org_notebook_idx on studio_notes (organization_id, notebook, section, updated_at desc);
