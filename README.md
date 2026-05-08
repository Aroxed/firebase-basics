# Firebase Login App

A simple web application that demonstrates Firebase Authentication and Realtime Database login history.

## Features

- User authentication with email/password and Google
- Login event tracking in Firebase Realtime Database
- Real-time updates for login events
- Optional Firebase Cloud Messaging token request
- Clean and modern UI

## Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services in your Firebase project:
   - Authentication (Email/Password and Google)
   - Realtime Database
   - Cloud Messaging, only if you want to experiment with notification tokens
3. Get your Firebase web app configuration from Project Settings
4. Put that configuration in `firebase-config.js`, including `databaseURL`
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

For Google sign-in, use `localhost` or add your exact local host, such as `127.0.0.1`, in Firebase Console under Authentication > Settings > Authorized domains.

Cloud Messaging token requests are optional. Full background push notifications require adding a Firebase messaging service worker, which this app does not currently include.

## Security Notes

- Firebase web config is public-facing by design, but keep Realtime Database rules restrictive
- Restrict authorized domains in Firebase Authentication for production
- Consider implementing additional security measures for production use

## Browser Support

The core app requires a browser that supports modern JavaScript. Optional Firebase Cloud Messaging experiments also require:

- Service Workers
- Web Push API 
