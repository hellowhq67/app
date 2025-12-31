-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents/training data
create table if not exists documents (
  id bigserial primary key,
  content text, -- The text content (e.g., question text, sample answer, or scoring criteria)
  metadata jsonb, -- Additional data (e.g., question_type, difficulty, tags)
  embedding vector(768) -- Gemini 1.5 Pro/Flash embedding dimension
);

-- specific table for user weak areas / mistakes to find patterns
create table if not exists user_weak_areas (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- references your users table (text based on your Schema)
  question_type text,
  weakness_description text,
  embedding vector(768),
  created_at timestamp with time zone default now()
);

-- Function to search for documents
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;

-- Function to find similar weak areas for a user
create or replace function match_user_weak_areas (
  user_id_param text,
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  weakness_description text,
  similarity float
)
language sql stable
as $$
  select
    user_weak_areas.id,
    user_weak_areas.weakness_description,
    1 - (user_weak_areas.embedding <=> query_embedding) as similarity
  from user_weak_areas
  where 
    user_weak_areas.user_id = user_id_param
    and 1 - (user_weak_areas.embedding <=> query_embedding) > match_threshold
  order by user_weak_areas.embedding <=> query_embedding
  limit match_count;
$$;
