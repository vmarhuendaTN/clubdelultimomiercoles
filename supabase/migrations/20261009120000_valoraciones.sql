-- Valoraciones de lecturas: estrellas y opinión, una por persona y libro.
-- Lectura pública; escritura solo de la propia valoración (login con Google).
-- Aplicada en el proyecto club-ultimo-miercoles (voplbvbfuxgweyzarqzl).

create table public.valoraciones (
  id uuid primary key default gen_random_uuid(),
  book_slug text not null check (book_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(book_slug) <= 120),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  estrellas smallint not null check (estrellas between 1 and 5),
  opinion text check (opinion is null or length(opinion) <= 2000),
  autor_nombre text not null default '',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (book_slug, user_id)
);

comment on table public.valoraciones is 'Estrellas y opiniones de las lecturas. Lectura pública; escritura solo de la propia valoración.';
comment on column public.valoraciones.autor_nombre is 'Nombre público («Nombre I.»), calculado por el trigger desde la cuenta de Google. Nunca el email.';

create index valoraciones_book_slug_idx on public.valoraciones (book_slug);
create index valoraciones_user_id_idx on public.valoraciones (user_id);

-- Nombre público desde la cuenta de Google: «Victoria Marhuenda Isamat» → «Victoria M.»
create or replace function public.nombre_publico(uid uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  with m as (
    select coalesce(
             nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
             nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
             'Lector'
           ) as nombre
    from auth.users u
    where u.id = uid
  ), partes as (
    select regexp_split_to_array(nombre, '\s+') as p from m
  )
  select case
           when array_length(p, 1) > 1 then p[1] || ' ' || upper(left(p[2], 1)) || '.'
           else p[1]
         end
  from partes;
$$;

revoke all on function public.nombre_publico(uuid) from public, anon, authenticated;

-- Fija autor y nombre (no se pueden falsear desde el navegador) y la fecha de edición.
create or replace function public.valoraciones_antes_de_guardar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.user_id := auth.uid();
  if new.user_id is null then
    raise exception 'Hay que entrar con Google para valorar';
  end if;
  new.autor_nombre := public.nombre_publico(new.user_id);
  if tg_op = 'UPDATE' then
    new.book_slug := old.book_slug;
    new.creado_en := old.creado_en;
  else
    new.creado_en := now();
  end if;
  new.actualizado_en := now();
  new.opinion := nullif(trim(new.opinion), '');
  return new;
end;
$$;

revoke all on function public.valoraciones_antes_de_guardar() from public, anon, authenticated;

create trigger valoraciones_antes_de_guardar
before insert or update on public.valoraciones
for each row execute function public.valoraciones_antes_de_guardar();

alter table public.valoraciones enable row level security;

create policy "Cualquiera puede leer las valoraciones"
  on public.valoraciones for select
  to anon, authenticated
  using (true);

create policy "Cada persona crea su valoración"
  on public.valoraciones for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Cada persona edita su valoración"
  on public.valoraciones for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Cada persona borra su valoración"
  on public.valoraciones for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Anónimos: solo columnas públicas (sin user_id) y sin escritura
revoke all on public.valoraciones from anon;
grant select (id, book_slug, estrellas, opinion, autor_nombre, creado_en, actualizado_en) on public.valoraciones to anon;
grant select, insert, update, delete on public.valoraciones to authenticated;

create view public.valoraciones_resumen
with (security_invoker = true) as
select book_slug,
       round(avg(estrellas)::numeric, 1) as media,
       count(*)::int as total
from public.valoraciones
group by book_slug;

grant select on public.valoraciones_resumen to anon, authenticated;
