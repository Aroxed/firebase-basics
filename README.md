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
   - Authentication (Email/Password and Google)
   - Realtime Database
   - Cloud Messaging
3. Get your Firebase configuration from Project Settings
4. Replace the placeholder values in `firebase-config.js` with your actual Firebase configuration
5. Set up Firebase Realtime Database rules to allow authenticated users to read/write. These are Realtime Database rules, not Firestore rules:

```json
{
  "rules": {
    "loginEvents": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["timestamp"]
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

Paste those rules in the Realtime Database Rules tab and publish them.

## Running the App

1. Run `npm start`
2. Open `http://localhost:8090` in a web browser
3. Create a user account through Firebase Authentication
4. Log in with your credentials
5. Allow notifications when prompted

For Google sign-in, use `localhost` or add your exact local host, such as `127.0.0.1`, in Firebase Console under Authentication > Settings > Authorized domains.

## Security Notes

- Never commit your Firebase configuration with actual API keys to version control
- Consider implementing additional security measures for production use
- Use environment variables or a secure configuration management system in production

## Browser Support

The application uses modern JavaScript features and requires a browser that supports:
- ES6+
- Service Workers (for push notifications)
- Web Push API 
