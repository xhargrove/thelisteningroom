-- One signup per email (stored lowercase from the app)
alter table public.emails
add constraint emails_email_unique unique (email);
