# Fiesta Flix - Movie Data Import Guide

## Excel/CSV Column Format

Create an Excel or CSV file with these columns:

| Column Name | Type | Required? | Description | Example |
|-------------|------|-----------|-------------|---------|
| title | String | Yes | Movie title | "The Great Adventure" |
| description | String | No | Movie description | "An epic journey..." |
| narrator | String | Yes | Narrator/interpreter name | "Rocky Kimomo" |
| genre | String | Yes | Movie genre | "Action" |
| duration | Number | Yes | Duration in seconds | 7200 (for 2 hours) |
| releaseYear | Number | No | Release year | 2024 |
| fileUrl | String | Yes | URL to full movie video (Telegram, R2, B2) | "https://cdn.example.com/movie.mp4" |
| thumbnailUrl | String | No | Poster image URL (2:3 aspect ratio) | "https://images.unsplash.com/..." |
| backdrop | String | No | Widescreen backdrop URL (16:9 banner) | "https://images.unsplash.com/..." |
| trailer | String | No | YouTube trailer URL or MP4 clip | "https://www.youtube.com/watch?v=dQw4w9WgXcQ" |
| views | Number | No (default 0) | Number of views | 100 |
| downloads | Number | No (default 0) | Number of downloads | 50 |
| isFeatured | Boolean | No (default false) | Is featured? | TRUE/FALSE |
| isActive | Boolean | No (default true) | Is active? | TRUE/FALSE |
| uploaderEmail | String | Yes | Email of uploader (admin) | "admin@fiestaflix.com" |

---

## Example Excel Sheet

| title | description | narrator | genre | duration | releaseYear | fileUrl | thumbnailUrl | views | downloads | isFeatured | isActive | uploaderEmail |
|-------|-------------|----------|-------|----------|-------------|---------|--------------|-------|-----------|------------|----------|---------------|
| The Great Adventure | An epic journey of discovery | John Doe | Drama | 7200 | 2024 | https://example.com/video1.mp4 | https://example.com/thumb1.jpg | 0 | 0 | FALSE | TRUE | admin@fiestaflix.com |
| Comedy Night Live | Hilarious stand-up comedy | Jane Smith | Comedy | 5400 | 2023 | https://example.com/video2.mp4 | https://example.com/thumb2.jpg | 0 | 0 | TRUE | TRUE | admin@fiestaflix.com |

---

## How to Use

1. **Create your CSV file**
   - Use the example format above
   - Or copy `movies.example.csv` and edit it
   - Save it as `movies.csv` in your project root directory

2. **Make sure you have an uploader user**
   - The user with the email in `uploaderEmail` must exist in your database
   - Usually this is your admin user

3. **Install dependencies (if you haven't already)**
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Run the import script**
   ```bash
   npm run import:movies
   ```

---

## Notes

- **Duration**: Must be in seconds (e.g., 2 hours = 7200 seconds)
- **uploaderEmail**: Must match an existing user in your database
- **fileUrl**: Should be a direct URL to your video file (Backblaze B2, S3, etc.)
- **isFeatured/isActive**: Use "TRUE" or "FALSE" (not case-sensitive)

