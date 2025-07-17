# Firestore Live Data Architecture Guide

## 🎯 **Overview**

The Hotseat Network now uses **Firestore as the primary data source** instead of direct MQTT connections. This provides better reliability, caching, and data persistence.

## 🏗️ **New Architecture**

```
MQTT Sensors → MQTT Bridge Service → Firestore → Web Application
     ↓              ↓                    ↓           ↓
  Real-time    Node.js Service    Real-time    Live Updates
   Data         (Backend)         Database      (Frontend)
```

### **Benefits:**
- ✅ **Better Reliability**: Data persists even if MQTT is down
- ✅ **Real-time Updates**: Firestore listeners provide instant updates
- ✅ **Caching**: Data is cached locally for better performance
- ✅ **Scalability**: Can handle multiple clients simultaneously
- ✅ **Offline Support**: Works even when MQTT is unavailable
- ✅ **Data History**: All historical data is preserved

## 🔧 **Components**

### 1. **MQTT Bridge Service** (`mqtt-to-firestore.js`)
- **Purpose**: Receives MQTT data and stores it in Firestore
- **Technology**: Node.js with MQTT and Firebase Admin SDK
- **Function**: Acts as a bridge between MQTT sensors and Firestore

### 2. **LiveDataService** (`firebase-config.js`)
- **Purpose**: Provides real-time data to the web application
- **Technology**: JavaScript with Firebase SDK
- **Function**: Manages Firestore listeners and data caching

### 3. **Web Application** (`index.html`)
- **Purpose**: Displays live data to users
- **Technology**: HTML/JavaScript with Firebase SDK
- **Function**: Consumes data from Firestore via LiveDataService

## 🚀 **Setup Instructions**

### Step 1: Set up the MQTT Bridge Service

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Create Firebase service account:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `firebase-service-account.json` in the project root

3. **Start the bridge service:**
   ```bash
   npm start
   ```

### Step 2: Configure Firestore Security Rules

Update your Firestore security rules to allow read access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to seats collection
    match /seats/{document} {
      allow read: if true;  // Public read access
      allow write: if false; // Only allow writes from admin SDK
    }
  }
}
```

### Step 3: Deploy the Web Application

The web application will automatically use Firestore when available:

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Implement Firestore live data architecture"
   git push origin main
   ```

2. **Verify deployment:**
   - Visit: `https://tantoon94.github.io/Hotseat_Network/`
   - Check the status indicator shows "FIRESTORE: Live"

## 📊 **Data Flow**

### **Real-time Data Flow:**
1. **MQTT Sensors** send data to MQTT broker
2. **MQTT Bridge Service** receives data and stores in Firestore
3. **Firestore** triggers real-time listeners
4. **LiveDataService** receives updates and caches data
5. **Web Application** displays live updates

### **Fallback Flow:**
1. **Firestore unavailable** → Falls back to direct MQTT
2. **MQTT unavailable** → Falls back to demo data
3. **All services down** → Shows cached data or demo mode

## 🔍 **Monitoring and Debugging**

### **Check Service Status:**

1. **MQTT Bridge Service:**
   ```bash
   # Check if service is running
   ps aux | grep mqtt-to-firestore
   
   # View logs
   tail -f mqtt-bridge.log
   ```

2. **Web Application:**
   - Open browser console
   - Look for status messages:
     - `✅ Using Firestore as primary data source`
     - `✅ Live data listeners initialized successfully`
     - `📊 Live update for seat X: {...}`

### **Data Source Indicators:**

The status indicator shows the current data source:
- **FIRESTORE: Live** - Using Firestore with real-time updates
- **MQTT: Connected** - Using direct MQTT connection
- **DEMO: Active** - Using demo data

## 🛠️ **Configuration Options**

### **Firestore Configuration:**
```javascript
// In firebase-config.js
const COLLECTION_NAME = 'seats';  // Firestore collection name
const RETENTION_SETTINGS = {
    DAILY_COUNTS_DAYS: 30,        // Keep 30 days of counts
    SESSION_HISTORY_LIMIT: 50,    // Keep 50 sessions per seat
    ARCHIVE_AFTER_DAYS: 90        // Archive after 90 days
};
```

### **MQTT Bridge Configuration:**
```javascript
// In mqtt-to-firestore.js
const MQTT_CONFIG = {
    host: 'mqtt.cetools.org',
    port: 8090,
    username: 'student',
    password: 'ce2021-mqtt-forget-whale'
};
```

## 🔄 **Data Synchronization**

### **Automatic Sync:**
- MQTT data is automatically stored in Firestore
- Web application receives real-time updates
- No manual synchronization required

### **Manual Sync:**
```javascript
// Force refresh from Firestore
await liveDataService.loadInitialData();

// Get current data
const data = liveDataService.getAllSeatsData();
```

## 📈 **Performance Optimization**

### **Caching Strategy:**
- **Local Cache**: Data cached in browser memory
- **Real-time Updates**: Only changed data is transmitted
- **Lazy Loading**: Historical data loaded on demand

### **Data Retention:**
- **Recent Data**: Kept in Firestore for quick access
- **Historical Data**: Archived after 90 days
- **Cleanup**: Automatic cleanup of old session history

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Firestore not connecting:**
   - Check Firebase configuration
   - Verify service account permissions
   - Check Firestore security rules

2. **MQTT Bridge not running:**
   - Check Node.js installation
   - Verify MQTT credentials
   - Check network connectivity

3. **No real-time updates:**
   - Check Firestore listeners
   - Verify data is being written to Firestore
   - Check browser console for errors

### **Debug Commands:**
```javascript
// Check Firestore status
console.log(FirestoreService.getStatus());

// Check LiveDataService status
console.log(liveDataService.getStatus());

// Force data refresh
await liveDataService.loadInitialData();
```

## 🔒 **Security Considerations**

### **Firebase Security:**
- Service account keys should be kept secure
- Firestore rules should restrict write access
- Consider using environment variables for sensitive data

### **MQTT Security:**
- Use secure WebSocket connections (WSS)
- Implement proper authentication
- Monitor for unauthorized access

## 📋 **Deployment Checklist**

- [ ] MQTT Bridge Service running
- [ ] Firebase service account configured
- [ ] Firestore security rules updated
- [ ] Web application deployed
- [ ] Real-time listeners working
- [ ] Fallback mechanisms tested
- [ ] Performance monitoring enabled

## 🎉 **Benefits Achieved**

1. **Reliability**: Data persists even during network issues
2. **Scalability**: Can handle multiple concurrent users
3. **Performance**: Cached data provides faster loading
4. **Maintainability**: Clean separation of concerns
5. **Monitoring**: Better visibility into data flow
6. **Offline Support**: Works with cached data when offline

The new Firestore-based architecture provides a robust, scalable solution for real-time seat monitoring! 🚀 