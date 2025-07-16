# Firestore Data Structure & MQTT Compatibility Analysis

## 📊 Database Architecture Overview

```
Firestore Database: hot-seat-network
├── Collection: sessions
├── Collection: seat_stats  
├── Collection: daily_usage
└── Collection: person_types
```

## 🔄 MQTT to Firestore Data Flow

```
MQTT Message → JavaScript Processing → Firestore Storage → Analytics Dashboard
```

## 📋 MQTT Message Structure (Input)

### Topic: `student/ucbqmie/sitting_events`
```json
{
  "seat_id": 1,
  "count": 5,
  "session_duration_ms": 1800000,
  "session_start_datetime": "2024-01-15T10:30:00Z",
  "session_end_datetime": "2024-01-15T11:00:00Z",
  "average_resistance": 16.39,
  "person_type": "Adult"
}
```

### Topic: `student/ucbqmie/seat_counts`
```json
{
  "seat_id": 1,
  "count": 5
}
```

## 🗄️ Firestore Collections Structure

### 1. `sessions` Collection
**Purpose:** Store individual session data with full details

**Document Structure:**
```json
{
  "id": "auto-generated",
  "seat_id": 1,
  "count": 5,
  "session_duration_ms": 1800000,
  "session_start_datetime": "2024-01-15T10:30:00Z",
  "session_end_datetime": "2024-01-15T11:00:00Z",
  "average_resistance": 16.39,
  "person_type": "Adult",
  "timestamp": "2024-01-15T10:30:00.000Z", // Firestore server timestamp
  "date": "2024-01-15" // YYYY-MM-DD format for querying
}
```

**Indexes Required:**
- `date` (for date range queries)
- `timestamp` (for recent sessions)
- `seat_id` (for seat-specific queries)

### 2. `seat_stats` Collection
**Purpose:** Store current/latest statistics for each seat

**Document ID:** `seat_1`, `seat_2`, etc.

**Document Structure:**
```json
{
  "seat_id": 1,
  "total_count": 25,
  "total_duration": 7200000,
  "average_resistance": 15.5,
  "last_session": "2024-01-15T11:00:00Z",
  "last_updated": "2024-01-15T11:00:00.000Z" // Firestore server timestamp
}
```

### 3. `daily_usage` Collection
**Purpose:** Store heatmap data for daily usage patterns

**Document ID:** `2024-01-15` (date in YYYY-MM-DD format)

**Document Structure:**
```json
{
  "date": "2024-01-15",
  "seat_1": {
    "hour_10": 3,
    "hour_11": 5,
    "hour_12": 2,
    "hour_13": 1,
    "hour_14": 4,
    "hour_15": 6,
    "hour_16": 3,
    "hour_17": 2,
    "hour_18": 1
  },
  "seat_2": {
    "hour_10": 1,
    "hour_11": 4,
    "hour_12": 3,
    // ... other hours
  },
  // ... seats 3, 4, 5
  "last_updated": "2024-01-15T18:00:00.000Z"
}
```

### 4. `person_types` Collection
**Purpose:** Store daily person type counts

**Document ID:** `2024-01-15` (date in YYYY-MM-DD format)

**Document Structure:**
```json
{
  "date": "2024-01-15",
  "Adult": 15,
  "Child": 8,
  "No Person": 2,
  "last_updated": "2024-01-15T18:00:00.000Z"
}
```

## ✅ MQTT Compatibility Analysis

### ✅ **FULLY COMPATIBLE** - All MQTT fields are properly mapped:

| MQTT Field | Firestore Field | Status | Notes |
|------------|----------------|--------|-------|
| `seat_id` | `seat_id` | ✅ | Direct mapping |
| `count` | `count` | ✅ | Direct mapping |
| `session_duration_ms` | `session_duration_ms` | ✅ | Direct mapping |
| `session_start_datetime` | `session_start_datetime` | ✅ | Direct mapping |
| `session_end_datetime` | `session_end_datetime` | ✅ | Direct mapping |
| `average_resistance` | `average_resistance` | ✅ | Direct mapping |
| `person_type` | `person_type` | ✅ | Direct mapping |

### 🔄 **Data Processing Flow:**

1. **MQTT Message Received** → `updateSeatData()` function
2. **Session Data** → `saveSessionToFirestore()` → `sessions` collection
3. **Seat Statistics** → `updateSeatStats()` → `seat_stats` collection  
4. **Heatmap Data** → `updateHeatmapForSession()` → `daily_usage` collection
5. **Person Type Counts** → `updatePersonTypeCounts()` → `person_types` collection

## 📈 Analytics Queries Supported

### 1. **Daily Session Count**
```javascript
// Query: sessions collection where date = "2024-01-15"
db.collection('sessions')
  .where('date', '==', '2024-01-15')
  .get()
```

### 2. **Seat Usage Distribution**
```javascript
// Query: seat_stats collection
db.collection('seat_stats')
  .get()
```

### 3. **Person Type Trends**
```javascript
// Query: person_types collection where date >= startDate && date <= endDate
db.collection('person_types')
  .where('date', '>=', startDate)
  .where('date', '<=', endDate)
  .get()
```

### 4. **Average Session Duration by Seat**
```javascript
// Query: sessions collection with aggregation
db.collection('sessions')
  .where('date', '>=', startDate)
  .where('date', '<=', endDate)
  .get()
  // Then aggregate in JavaScript
```

## 🔧 Data Validation & Error Handling

### **Input Validation:**
- ✅ Seat ID range check (1-5)
- ✅ Required fields presence
- ✅ Data type validation
- ✅ Date format validation

### **Error Handling:**
- ✅ Network connection errors
- ✅ Firestore permission errors
- ✅ Data parsing errors
- ✅ Graceful fallback to local storage

## 📊 Performance Optimizations

### **Indexes Required:**
```javascript
// Composite indexes for efficient querying
sessions: date ASC, timestamp DESC
sessions: seat_id ASC, timestamp DESC
person_types: date ASC
daily_usage: date ASC
```

### **Query Optimization:**
- ✅ Date-based partitioning
- ✅ Limited result sets (50 records max)
- ✅ Efficient aggregation queries
- ✅ Real-time listeners for live updates

## 🧪 Testing Scenarios

### **Test Case 1: Single Session**
```json
// MQTT Input
{
  "seat_id": 1,
  "count": 1,
  "session_duration_ms": 1800000,
  "session_start_datetime": "2024-01-15T10:30:00Z",
  "session_end_datetime": "2024-01-15T11:00:00Z",
  "average_resistance": 16.39,
  "person_type": "Adult"
}

// Expected Firestore Output
// sessions collection: 1 new document
// seat_stats collection: seat_1 updated
// daily_usage collection: 2024-01-15 updated (hour_10, hour_11)
// person_types collection: 2024-01-15 updated (Adult: +1)
```

### **Test Case 2: Multiple Sessions**
- ✅ Concurrent session handling
- ✅ Data consistency across collections
- ✅ Real-time updates to all dashboards

## 🚀 Deployment Readiness

### **Firebase Configuration:**
- ✅ Project created: `hot-seat-network`
- ✅ Firestore enabled
- ✅ Security rules configured
- ✅ Authorized domains set

### **Data Migration:**
- ✅ No existing data to migrate
- ✅ Fresh start with new structure
- ✅ Backward compatibility maintained

## 📋 Summary

**✅ COMPATIBILITY STATUS: FULLY COMPATIBLE**

The Firestore data structure is **100% compatible** with your MQTT message format. All fields are properly mapped, and the system includes:

1. **Complete data preservation** - No data loss
2. **Efficient querying** - Optimized for analytics
3. **Real-time updates** - Live dashboard updates
4. **Scalable structure** - Handles multiple seats and sessions
5. **Error handling** - Graceful failure recovery

**Ready for production deployment! 🚀** 