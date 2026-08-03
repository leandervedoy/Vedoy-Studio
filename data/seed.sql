insert into projects (id, organization_id, name, slug, framework, status, production_url, region, last_deploy_at, monthly_requests)
values
  ('prj_studio', 'org_vedoy', 'Vedøy Studio', 'vedoy-studio', 'Next.js', 'healthy', 'studio.vedoy.com', 'Frankfurt', now() - interval '1 day', 18420),
  ('prj_collective', 'org_vedoy', 'Vedøy Collective', 'vedoy-collective', 'Shopify', 'healthy', 'vedoycollective.no', 'Global CDN', now() - interval '4 days', 9320),
  ('prj_assist', 'org_vedoy', 'Vedøy Assist', 'vedoy-assist', 'Next.js', 'building', 'assist.vedoy.com', 'Frankfurt', now() - interval '2 days', 4210)
on conflict (id) do nothing;

insert into domains (id, organization_id, name, status, auto_renew, expires_at, project_id, dns_provider)
values
  ('dom_vedoy', 'org_vedoy', 'vedoy.com', 'active', true, now() + interval '280 days', 'prj_studio', 'Vedøy DNS'),
  ('dom_collective', 'org_vedoy', 'vedoycollective.no', 'active', true, now() + interval '194 days', 'prj_collective', 'Cloudflare'),
  ('dom_assist', 'org_vedoy', 'vedoyassist.no', 'pending', true, now() + interval '365 days', 'prj_assist', 'Vedøy DNS')
on conflict (id) do nothing;

insert into customers (id, organization_id, name, email, phone, company, value_nok, last_activity_at, tags)
values
  ('cus_1', 'org_vedoy', 'Nordlys Kafé AS', 'hei@nordlyskafe.no', '+47 400 00 100', 'Nordlys Kafé AS', 6890, now() - interval '1 day', '["Bedrift","Growth"]'),
  ('cus_2', 'org_vedoy', 'Ingrid Solheim', 'ingrid@example.no', '+47 900 00 001', null, 1298, now() - interval '2 days', '["Privat","Trygg"]'),
  ('cus_3', 'org_vedoy', 'Kystform Studio', 'post@kystform.no', null, 'Kystform Studio', 11980, now() - interval '4 days', '["Bedrift","Nettside","Hosting"]')
on conflict (organization_id, email) do nothing;

insert into bookings (id, organization_id, service_id, service_name, starts_at, ends_at, customer_name, customer_email, customer_phone, notes, status)
values
  ('bk_1001', 'org_vedoy', 'remote-it', 'Digital IT-hjelp', now() + interval '1 day 10 hours', now() + interval '1 day 11 hours', 'Ingrid Solheim', 'ingrid@example.no', '+47 900 00 001', 'Trenger hjelp med e-post på ny PC.', 'confirmed'),
  ('bk_1002', 'org_vedoy', 'business-check', 'Digital bedriftssjekk', now() + interval '2 days 13 hours', now() + interval '2 days 15 hours', 'Nordlys Kafé AS', 'hei@nordlyskafe.no', null, 'Gjennomgang av nettside, booking og e-post.', 'pending')
on conflict (id) do nothing;

insert into support_tickets (id, organization_id, subject, message, priority, status)
values
  ('ticket_1', 'org_vedoy', 'Koble domenet til ny nettside', 'Ønsker hjelp med DNS og publisering.', 'normal', 'in-progress'),
  ('ticket_2', 'org_vedoy', 'Oppsett av bedriftse-post', 'Trenger tre adresser og hjelp på mobil.', 'high', 'open')
on conflict (id) do nothing;
