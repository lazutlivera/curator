# CuratorEx

A digital art exploration platform that combines artworks from the Rijksmuseum and Harvard Art Museums into a unified search experience.

## Features

- Search across two major museum collections simultaneously
- Filter artworks by type (paintings, drawings, sculptures, etc.)
- Sort by relevance, chronology, or artist
- Save favorite artworks to personal collections
- Google authentication for secure access
- Mobile-responsive design

## Tech Stack

- React (Vite)
- Tailwind CSS
- Supabase (Authentication & Database)
- APIs:
  - Rijksmuseum API
  - Harvard Art Museums API

## Setup

1. Clone the repository:
```bash
git clone https://github.com/lazutlivera/curator.git
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory by following `.env.example` file.
```

4. Set up Supabase:
   - Create a new project at supabase.com
   - Enable Google Authentication in Authentication > Providers
   - Add your Google OAuth credentials
   - Run the following SQL in your Supabase SQL editor:
```sql
-- Create collections table
create table collections (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  name text not null
);

-- Create collection_artworks table
create table collection_artworks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  collection_id uuid references collections on delete cascade not null,
  artwork_id text not null,
  artwork_data jsonb not null
);

-- Set up row level security
alter table collections enable row level security;
alter table collection_artworks enable row level security;

-- Create security policies
create policy "Users can create collections" on collections
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own collections" on collections
  for select using (auth.uid() = user_id);

create policy "Users can add artworks to their collections" on collection_artworks
  for insert with check (
    collection_id in (
      select id from collections where user_id = auth.uid()
    )
  );

create policy "Users can view artworks in their collections" on collection_artworks
  for select using (
    collection_id in (
      select id from collections where user_id = auth.uid()
    )
  );
```

5. Start the development server:
```bash
npm run dev
```

## API Keys

- Rijksmuseum API key: Register at [Rijksmuseum API](https://www.rijksmuseum.nl/en/research/conduct-research/data/api-for-developers)
- Harvard Art Museums API key: Register at [Harvard Museums API](https://harvardartmuseums.org/collections/api)

## Deployment

The project is configured for deployment on Netlify.
