# Email Configuration Guide

## 📧 Email Setup with Google SMTP

### Prerequisites:
1. Google Account
2. App Password (for Gmail)

### 🔑 Create Google App Password:

1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification (REQUIRED
3. Go to "App Passwords" section
4. Create a new app password:
   - Select app: Mail
   - Select device: Other (Custom name) → Fiesta Flix)
5. Copy the 16-character app password

### 📝 Your App Passwords (from your message):
`oyme cenu pkin nmpc`

### 🔧 Add to .env file:

```env
# Google SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=oyme cenu pkin nmpc
SMTP_FROM=Fiesta Flix <your-email@gmail.com>
```

## ✅ Email Features:

### 1. Welcome Email (New Users)
- Subject: Welcome to Fiesta Flix! 🎉
- Beautiful HTML email template
- Personalized greeting
- Quick start guide
- Social media links

### 2. Password Reset Email
- Subject: Reset your Fiesta Flix Password
- Reset link (expires in 1 hour
- Step-by-step instructions
- Security tips

## 🚀 Quick Start with Nodemailer:

```bash
npm install nodemailer
```

### Basic Email Utility:

```typescript
// src/lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to Fiesta Flix! 🎉</h1>
      </div>
      <div style="padding: 30px; background: #1a1a1a;">
        <h2 style="color: #fff;">Hello ${name}!</h2>
        <p style="color: #ccc;">Thank you for joining Fiesta Flix!</p>
        <p style="color: #ccc;">Get ready to enjoy amazing movies with Kinyarwanda narration!</p>
        <div style="margin: 30px 0;">
          <a href="https://fiestaflix.com" style="background: linear-gradient(135deg, #6366f1 0%, #f97316 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Start Watching Now
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">Best regards,<br>The Fiesta Flix Team</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Welcome to Fiesta Flix! 🎉',
    html,
  });
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetLink = `https://fiestaflix.com/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Reset Your Password</h1>
      </div>
      <div style="padding: 30px; background: #1a1a1a;">
        <p style="color: #ccc;">Click the button below to reset your password.</p>
        <p style="color: #888; font-size: 14px;">This link expires in 1 hour.</p>
        <div style="margin: 30px 0;">
          <a href="${resetLink}" style="background: linear-gradient(135deg, #6366f1 0%, #f97316 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Reset Your Fiesta Flix Password',
    html,
  });
}
```

## 🎯 Email Features Checklist:

- ✅ Welcome Email to New Users
- ✅ Password Reset Emails
- ✅ Beautiful HTML Templates
- ✅ Google SMTP Integration
- ✅ App Password Security
