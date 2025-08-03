# Database Setup

Quick setup for the Courage app database.

## Setup

1. **Run schema.sql** in Supabase SQL editor
2. **Create storage bucket** `jam-recordings` (50MB limit, audio files)
3. **Add sample data** (optional)

## Files

- `schema.sql` - Database schema
- `storage_policies.sql` - Storage policies
- `index.ts` - Database operations
- `types.ts` - TypeScript types

## Sample Data

```sql
INSERT INTO topics (title, category, description, track_id, difficulty, estimated_time, tags, is_active) VALUES
(
    'Digital Transformation in Business',
    'Technology',
    'Discuss how digital transformation is reshaping traditional business models.',
    'jam',
    'intermediate',
    60,
    ARRAY['technology', 'business', 'digital'],
    true
);
```

## Troubleshooting

**Storage upload fails**: Disable RLS on `jam-recordings` bucket in Supabase dashboard.
