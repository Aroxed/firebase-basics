# Firebase Login App

A simple web application that demonstrates Firebase Authentication, Realtime Database, and Cloud Messaging integration.

## Features

- User authentication (login/logout)
- Login event tracking in Firebase Realtime Database
- Push notifications support
- Real-time updates for login events
- Clean and modern UI

## Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services in your Firebase project:
   - Authentication (Email/Password)
   - Realtime Database
   - Cloud Messaging
3. Get your Firebase configuration from Project Settings
4. Replace the placeholder values in `firebase-config.js` with your actual Firebase configuration
5. Set up Firebase Realtime Database rules to allow authenticated users to read/write:

```json
{
  "rules": {
    "loginEvents": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

## Running the App

1. Host the files on a web server (local or production)
2. Open the application in a web browser
3. Create a user account through Firebase Authentication
4. Log in with your credentials
5. Allow notifications when prompted

## Security Notes

- Never commit your Firebase configuration with actual API keys to version control
- Consider implementing additional security measures for production use
- Use environment variables or a secure configuration management system in production

## Browser Support

The application uses modern JavaScript features and requires a browser that supports:
- ES6+
- Service Workers (for push notifications)
- Web Push API 