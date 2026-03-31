-- ============================================================
-- Likes
-- ============================================================

create table likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  video_id text not null,
  created_at timestamptz default now() not null,
  unique(user_id, video_id),
  constraint likes_profiles_fk foreign key (user_id) references profiles(id) on delete cascade
);

alter table likes enable row level security;

create policy "Anyone can read likes"
  on likes for select using (true);

create policy "Authenticated users can like"
  on likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike own likes"
  on likes for delete using (auth.uid() = user_id);

-- ============================================================
-- Video stats (denormalized counters)
-- ============================================================

create table video_stats (
  video_id text primary key,
  like_count integer default 0 not null,
  comment_count integer default 0 not null
);

alter table video_stats enable row level security;

create policy "Anyone can read video_stats"
  on video_stats for select using (true);

-- Like count triggers
create or replace function increment_like_count()
returns trigger as $$
begin
  insert into video_stats (video_id, like_count)
  values (NEW.video_id, 1)
  on conflict (video_id)
  do update set like_count = video_stats.like_count + 1;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_like_created
  after insert on likes
  for each row execute procedure increment_like_count();

create or replace function decrement_like_count()
returns trigger as $$
begin
  update video_stats
  set like_count = greatest(video_stats.like_count - 1, 0)
  where video_id = OLD.video_id;
  return OLD;
end;
$$ language plpgsql security definer;

create trigger on_like_deleted
  after delete on likes
  for each row execute procedure decrement_like_count();
