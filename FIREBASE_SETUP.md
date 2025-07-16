# Firebase Firestore Setup Guide for Hotseat Network

## 🚀 Getting Started with Firebase

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "hotseat-network")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

### 2. Enable Firestore Database

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can add security rules later)
4. Select a location for your database (choose the closest to your users)
5. Click "Done"

### 3. Get Your Firebase Configuration

1. In the Firebase console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter an app nickname (e.g., "Hotseat Network Web")
6. Click "Register app"
7. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 4. Update Configuration

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase configuration
3. Save the file

### 5. Add Firebase SDK to Your HTML Files

Add these script tags to your HTML files (before your other scripts):

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js"></script>

<!-- Your Firebase config -->
<script src="firebase-config.js"></script>
```

### 6. Firestore Security Rules (Optional but Recommended)

In the Firestore console, go to "Rules" and update with these basic rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for now
    // In production, you should add proper authentication
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 📊 Database Structure

The Firestore database will have the following collections:

### 1. `sessions` Collection
Stores individual session data:
```javascript
{
  seat_id: 1,
  count: 5,
  session_duration_ms: 1800000,
  session_start_datetime: "2024-01-15T10:30:00Z",
  session_end_datetime: "2024-01-15T11:00:00Z",
  average_resistance: 16.39,
  person_type: "Adult",
  timestamp: serverTimestamp(),
  date: "2024-01-15"
}
```

### 2. `seat_stats` Collection
Stores current statistics for each seat:
```javascript
{
  seat_id: 1,
  total_count: 25,
  total_duration: 7200000,
  average_resistance: 15.5,
  last_session: "2024-01-15T11:00:00Z",
  last_updated: serverTimestamp()
}
```

### 3. `daily_usage` Collection
Stores heatmap data for each day:
```javascript
{
  date: "2024-01-15",
  seat_1: {
    hour_10: 3,
    hour_11: 5,
    hour_12: 2,
    // ... other hours
  },
  seat_2: {
    hour_10: 1,
    hour_11: 4,
    // ... other hours
  },
  // ... other seats
  last_updated: serverTimestamp()
}
```

### 4. `person_types` Collection
Stores daily person type counts:
```javascript
{
  date: "2024-01-15",
  Adult: 15,
  Child: 8,
  "No Person": 2,
  last_updated: serverTimestamp()
}
```

## 🔧 Integration with Existing Code

The Firebase integration is designed to work seamlessly with your existing MQTT data flow:

1. **Automatic Data Storage**: When MQTT messages are received, data is automatically saved to Firestore
2. **Real-time Updates**: Charts and displays update in real-time as data is stored
3. **Historical Data**: All session data is preserved for analytics and reporting
4. **Daily Reset**: Heatmap data resets daily while preserving historical records

## 📈 Benefits of Firestore Integration

- **Data Persistence**: All seat usage data is permanently stored
- **Analytics**: Historical data for trend analysis and reporting
- **Scalability**: Cloud-based database that scales automatically
- **Real-time**: Live updates across multiple devices
- **Backup**: Automatic data backup and recovery
- **Security**: Built-in security and access controls

## 🚨 Important Notes

1. **API Key Security**: The API key in the config is safe to expose in client-side code, but you should set up proper security rules
2. **Costs**: Firestore has a generous free tier, but monitor usage for large-scale deployments
3. **Offline Support**: Firestore works offline and syncs when connection is restored
4. **Data Limits**: Be aware of Firestore's document size limits (1MB per document)

## 🔍 Testing the Integration

After setup, you can test the integration by:

1. Opening your dashboard in the browser
2. Checking the browser console for Firebase connection messages
3. Sending test MQTT messages to see data being saved
4. Verifying data appears in the Firestore console

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration is correct
3. Ensure Firestore is enabled in your Firebase project
4. Check that security rules allow read/write access 