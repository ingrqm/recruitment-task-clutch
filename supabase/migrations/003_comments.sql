-- ============================================================
-- Comments
-- ============================================================

create table comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  video_id text not null,
  content text not null,
  parent_id uuid references comments(id) on delete cascade,
  created_at timestamptz default now() not null,
  constraint comments_profiles_fk foreign key (user_id) references profiles(id) on delete cascade
);

create index idx_comments_parent_id on comments(parent_id);

alter table comments enable row level security;

create policy "Anyone can read comments"
  on comments for select using (true);

create policy "Authenticated users can comment"
  on comments for insert with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on comments for delete using (auth.uid() = user_id);

-- Comment count triggers
create or replace function increment_comment_count()
returns trigger as $$
begin
  insert into video_stats (video_id, comment_count)
  values (NEW.video_id, 1)
  on conflict (video_id)
  do update set comment_count = video_stats.comment_count + 1;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_comment_created
  after insert on comments
  for each row execute procedure increment_comment_count();

create or replace function decrement_comment_count()
returns trigger as $$
begin
  update video_stats
  set comment_count = greatest(video_stats.comment_count - 1, 0)
  where video_id = OLD.video_id;
  return OLD;
end;
$$ language plpgsql security definer;

create trigger on_comment_deleted
  after delete on comments
  for each row execute procedure decrement_comment_count();
