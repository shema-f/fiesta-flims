// Fiesta Flix Backend Setup Guide
// Complete backend system with MySQL, Prisma, and Next.js

## 🏗️ Tech Stack
- Next.js 15 (API Routes for backend)
- Prisma ORM
- MySQL Database (PlanetScale, AWS RDS, or local MySQL)
- Cloud Storage (Backblaze B2 or AWS S3)
- Cloudflare CDN

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install -D prisma@5.19.0
   npm install @prisma/client@5.19.0 bcrypt jsonwebtoken
   ```

2. **Initialize Prisma:**
   ```bash
   npx prisma init --datasource-provider mysql
   ```

3. **Configure .env:**
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/fiesta_flix"
   JWT_SECRET="your-secret-key-here"
   ```

4. **Create schema.prisma (see below)**

5. **Run migration:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

## 📊 Database Schema (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  FAN
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String?
  image         String?
  role          UserRole  @default(FAN)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  movies        Movie[]
  fanClips      FanClip[]
  requests      MovieRequest[]
  likes         Like[]
  follows       Follow[]
  notifications Notification[]
  comments      Comment[]

  @@index([email])
}

model Movie {
  id          String   @id @default(cuid())
  title       String
  description String?
  narrator    String
  genre       String
  duration    Int
  fileUrl     String
  thumbnailUrl String?
  resolutions Json
  views       Int      @default(0)
  downloads   Int      @default(0)
  isFeatured  Boolean  @default(false)
  isActive    Boolean  @default(true)
  uploaderId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  uploader    User      @relation(fields: [uploaderId], references: [id], onDelete: Cascade)
  likes       Like[]
  requests    MovieRequest[]
  comments    Comment[]

  @@index([narrator])
  @@index([genre])
}

model FanClip {
  id          String   @id @default(cuid())
  title       String
  description String?
  videoUrl    String
  userId      String
  likesCount  Int      @default(0)
  isApproved  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  likes       Like[]
  comments    Comment[]
}

model MovieRequest {
  id          String   @id @default(cuid())
  movieTitle  String
  description String?
  userId      String
  votesCount  Int      @default(1)
  isFulfilled Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  movie       Movie?    @relation(fields: [movieId], references: [id])
  movieId     String?

  @@index([votesCount])
}

model Like {
  id        String   @id @default(cuid())
  userId    String
  targetId  String
  targetType String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, targetId, targetType])
}

model Follow {
  id           String   @id @default(cuid())
  followerId   String
  followingId  String
  followingType String
  createdAt    DateTime @default(now())

  follower     User     @relation(fields: [followerId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId, followingType])
  @@index([followingId])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  userId    String
  targetId  String
  targetType String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  type      String
  isRead    Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 🔐 API Routes Structure

Create these API routes in `src/app/api/`:

- `auth/[...nextauth]/route.ts` - Authentication
- `movies/route.ts` - List movies
- `movies/[id]/route.ts` - Single movie
- `movies/[id]/download/route.ts` - Download movie
- `movies/[id]/like/route.ts` - Like movie
- `interpreters/route.ts` - List interpreters
- `interpreters/[name]/follow/route.ts` - Follow interpreter
- `fan-clips/route.ts` - Fan clips
- `requests/route.ts` - Movie requests
- `admin/movies/route.ts` - Admin upload movie
- `admin/fan-clips/[id]/approve/route.ts` - Approve clip

## 🚀 Quick Start

1. Set up MySQL database
2. Configure .env
3. Run `npx prisma migrate dev`
4. Run `npm run dev`

## 📱 Features Implemented

✅ Movie management (CRUD)
✅ User authentication
✅ Fan page system
✅ Movie requests
✅ Interpreter follow system with notifications
✅ Likes & comments
✅ Admin dashboard
