# Email Setup Guide for Contact Form

## Current Issue
Your contact form is failing with Gmail SMTP authentication errors. Here's how to fix it:

## Option 1: Fix Gmail Authentication (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Enable 2-factor authentication if not already enabled

### Step 2: Generate App Password
1. In Google Account settings, go to Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and "Other (custom name)"
4. Enter "Dumpster Fire Coding Contact Form"
5. Copy the generated 16-character password

### Step 3: Update Your .env File
Add these variables to your `.env` file:

```env
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
MAIL_TO=your-email@gmail.com
```

**Important:** Use the 16-character app password, NOT your regular Gmail password.

## Option 2: Use Alternative Email Service

### SendGrid (Free tier available)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=your-verified-sender@yourdomain.com
MAIL_TO=your-email@gmail.com
```

### Mailgun (Free tier available)
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
SMTP_FROM=your-verified-sender@yourdomain.com
MAIL_TO=your-email@gmail.com
```

## Option 3: Disable Email (Development Mode)

If you want to disable email for now, the contact form will still work but just log submissions to the console instead of sending emails.

Simply don't set the SMTP environment variables, and the form will:
- Still accept submissions
- Log them to the server console
- Return success to the user
- Show "Contact form received (email not configured)" message

## Testing Your Setup

1. Restart your server after updating .env
2. Go to your contact page
3. Fill out and submit the form
4. Check the server console for success/error messages

## Common Issues

### "Username and Password not accepted"
- Make sure you're using an App Password, not your regular password
- Ensure 2-factor authentication is enabled
- Check that the email address is correct

### "Connection timeout"
- Check your internet connection
- Verify SMTP_HOST and SMTP_PORT are correct
- Try a different port (465 for SSL, 587 for TLS)

### "Authentication failed"
- Double-check your App Password
- Make sure the email address matches your Google account
- Verify 2-factor authentication is enabled

## Security Notes

- Never commit your .env file to version control
- Use App Passwords instead of your main account password
- Consider using environment-specific email services for production


