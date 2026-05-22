# Fiesta Flix

Your ultimate destination for streaming and downloading movies in HD quality with Kinyarwanda narrations.

## Features

- 🎬 Movie streaming with YouTube integration
- 📥 Download with custom watermark
- 🎙️ Interpreter/narrator profiles
- 🎭 Movie/Series badges
- 📝 Movie request system
- 👥 Community features (likes, comments, follows)
- 🔐 Secure authentication with NextAuth.js

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **ORM**: Prisma 5
- **Database**: MySQL (PlanetScale recommended)
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **Storage**: Backblaze B2
- **CDN**: Cloudflare

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MySQL database (or PlanetScale account)
- Backblaze B2 account (for storage)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shema-f/fiesta-flims.git
cd fiesta-flims
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL database connection string |
| `NEXTAUTH_URL` | Your app URL (http://localhost:3000 for dev) |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js |
| `JWT_SECRET` | Secret key for JWT tokens |
| `BACKBLAZE_KEY_ID` | Backblaze B2 key ID |
| `BACKBLAZE_APPLICATION_KEY` | Backblaze B2 application key |
| `BACKBLAZE_BUCKET_NAME` | Backblaze B2 bucket name |
| `BACKBLAZE_REGION` | Backblaze B2 region |
| `BACKBLAZE_ENDPOINT` | Backblaze B2 endpoint |

## Importing Movie Data

1. Create a `movies.csv` file following the format in `MOVIE_DATA_IMPORT_GUIDE.md`
2. Run the import script:
```bash
npm run import:movies
```

## Deployment

The easiest way to deploy Fiesta Flix is on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.
