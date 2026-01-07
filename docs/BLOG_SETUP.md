# Blog AI Search Setup Guide

## Quick Start

### Step 1: Add Environment Variables

Update your `.env.local` file with the MXBAI credentials:

```env
# MXBAI Configuration for Blog AI Search
MXBAI_API_KEY=mxb_1vLkstmmwmLYRChv24kljXj7MyNe
MXBAI_STORE_ID=5563a996-5cb7-4101-a7e9-cd00126a594
```

### Step 2: Start the Development Server

```bash
pnpm dev
```

### Step 3: Test the Blog

Navigate to `http://localhost:3000/blog` and:
1. ✅ Verify the navbar appears at the top
2. ✅ Try searching for articles using the AI search bar
3. ✅ Click on results to view full articles
4. ✅ Check search history appears on empty search

## Features

### 🔍 AI-Powered Search
- Semantic search using MXBAI embeddings
- Real-time results with relevance scoring
- Intelligent fallback to keyword search

### 📱 Responsive Design
- Mobile-optimized navbar with hamburger menu
- Responsive search dropdown
- Works on all device sizes

### 🎯 User Experience
- Search history tracking (stored in browser)
- Debounced search (300ms) for performance
- Visual relevance indicators
- One-click navigation to articles

### 📊 Blog Preview Cards
- Rich article previews in search results
- Image galleries with hover effects
- Tag display with "more" indicator
- Meta information (author, date)

## Components Overview

### BlogNavbar
Location: `components/blog/BlogNavbar.tsx`
- Fixed navigation bar
- Links to blog, home, and practice areas
- Mobile hamburger menu

### BlogSearchAdvanced
Location: `components/blog/BlogSearchAdvanced.tsx`
- Advanced search with results preview
- Search history tracking
- Responsive grid layout for results

### BlogPreview
Location: `components/blog/BlogPreview.tsx`
- Rich preview card for search results
- Hover effects and CTAs
- Tag and metadata display

### API Route
Location: `app/api/blog/search/route.ts`
- `POST /api/blog/search`
- Handles embedding generation
- Returns ranked results

## Configuration

### MXBAI API Settings

The search API uses MXBAI for semantic embeddings:

- **Model**: `mxbai-embed-large`
- **Min Relevance**: 0.3 (threshold for displaying results)
- **Max Results**: 10 (top ranked articles)
- **Debounce**: 300ms (delay before search)

### Customization

#### Change Minimum Relevance Score

Edit `app/api/blog/search/route.ts` line ~90:

```typescript
.filter(item => item.score > 0.3) // Change 0.3 to your threshold
```

#### Change Max Results

Edit line ~92:

```typescript
.slice(0, 10) // Change 10 to your max
```

#### Update Search Debounce

Edit `components/blog/BlogSearchAdvanced.tsx` line ~66:

```typescript
const handler = setTimeout(() => {
    // ...
}, 300); // Change 300 to desired milliseconds
```

## API Usage

### Request

```bash
POST /api/blog/search
Content-Type: application/json

{
  "query": "PTE speaking strategies"
}
```

### Response

```json
{
  "results": [
    {
      "slug": "pte-speaking-strategies",
      "title": "Master PTE Speaking",
      "description": "Proven strategies for high scores",
      "author": "Expert Author",
      "date": "2024-01-15",
      "tags": ["speaking", "pte", "tips"],
      "image": "https://...",
      "seoKeywords": ["speaking", "pte"],
      "content": "<html>...",
      "relevanceScore": 0.95
    }
  ]
}
```

## Testing

### Manual Testing

1. **Search Functionality**
   - Type in search bar
   - Verify results appear
   - Check relevance scores

2. **Navigation**
   - Click article links
   - Use navbar links
   - Test mobile menu

3. **Search History**
   - Open dev tools → Application → LocalStorage
   - Look for `blogSearchHistory` key
   - Should contain recent searches

### Automated Testing

```bash
# Test the API endpoint directly
curl -X POST http://localhost:3000/api/blog/search \
  -H "Content-Type: application/json" \
  -d '{"query":"PTE speaking"}'
```

## Troubleshooting

### Search Not Working

1. **Check Environment Variables**
   ```bash
   echo $MXBAI_API_KEY
   echo $MXBAI_STORE_ID
   ```

2. **Check API Status**
   - Open browser console (F12)
   - Go to Network tab
   - Search for something
   - Check if `/api/blog/search` request succeeds

3. **Verify MXBAI Connection**
   ```bash
   curl -X POST https://api.mxbai.com/v1/embeddings \
     -H "Authorization: Bearer mxb_1vLkstmmwmLYRChv24kljXj7MyNe" \
     -H "Content-Type: application/json" \
     -d '{"input":"test","model":"mxbai-embed-large"}'
   ```

### No Results

- Try shorter, more specific search terms
- Check if blog posts exist in `data/blogs/`
- Verify relevance threshold isn't too high
- Check browser console for errors

### Slow Performance

- Clear search history: Open DevTools → Application → LocalStorage → Delete `blogSearchHistory`
- Reduce number of blog posts if testing with many
- Check internet connection

## Performance Optimization

The search implementation includes several optimizations:

1. **Debounced Search** - 300ms delay prevents excessive API calls
2. **Result Filtering** - Minimum relevance threshold filters noise
3. **Result Limiting** - Returns only top 10 results
4. **Client-side Caching** - Browser stores search history
5. **Click-outside Detection** - Closes dropdown to save memory

## Security

⚠️ **Important**: The MXBAI API key is currently in the code. For production:

1. **Move to Server-Side Only**
   ```typescript
   // Only use environment variable on server
   const apiKey = process.env.MXBAI_API_KEY;
   ```

2. **Implement Rate Limiting**
   - Add request validation
   - Implement user-based quotas
   - Cache embeddings

3. **Monitor Usage**
   - Track API calls
   - Set up alerts for unusual activity
   - Monitor costs

## Future Enhancements

- [ ] Server-side embedding caching
- [ ] Advanced filters (date, author, tags)
- [ ] Search analytics
- [ ] Suggested searches
- [ ] Related articles widget
- [ ] Save favorite searches
- [ ] Share search results

## Support & Documentation

- Blog Structure: See `BLOG_IMPROVEMENTS.md`
- Component Props: Check component files directly
- Blog Data Format: See `lib/blog.ts`

## Resources

- [MXBAI Documentation](https://mxbai.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- [React Hooks Documentation](https://react.dev/reference/react/hooks)
