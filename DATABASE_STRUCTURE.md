# Hotseat Network - Simplified Firestore Database Structure

## Overview
The database has been restructured to be much simpler and more comprehensive. Instead of 4 separate collections, we now have **one collection** with **one document per seat**.

## Database Structure

### Collection: `seats`
- **One document per seat** (seat_1, seat_2, seat_3, seat_4, seat_5)
- Each document contains both count data and session data

### Document Structure for Each Seat

```javascript
{
  "seat_id": 1,
  
  // Daily Count Data (from seat_counts topic)
  "daily_counts": {
    "2025-07-16": 42,
    "2025-07-17": 38,
    // ... more dates
  },
  "last_count": 42,
  "last_count_update": timestamp,
  
  // Current Session Data (from sitting_events topic)
  "current_session": {
    "count": 42,
    "session_start_datetime": "2025-07-16 17:30:00",
    "session_end_datetime": "2025-07-16 17:35:00",
    "session_duration_ms": 300000,
    "average_resistance": 18.5,
    "person_type": "Adult"
  },
  "last_session_update": timestamp,
  
  // Session History (last 50 sessions)
  "session_history": [
    {
      "count": 42,
      "session_start_datetime": "2025-07-16 17:30:00",
      "session_end_datetime": "2025-07-16 17:35:00",
      "session_duration_ms": 300000,
      "average_resistance": 18.5,
      "person_type": "Adult",
      "timestamp": timestamp
    },
    // ... more sessions
  ]
}
```

## Data Flow

### 1. Seat Counts Topic (`student/ucbqmie/seat_counts`)
- **Data**: `{"seat_id": 1, "count": 42}`
- **Stored as**: Daily count in `daily_counts` object
- **Updated**: Every time a count message is received

### 2. Sitting Events Topic (`student/ucbqmie/sitting_events`)
- **Data**: Complete session information
- **Stored as**: 
  - Current session in `current_session`
  - Added to `session_history` array
- **Updated**: Every time a session event is received

## Firestore Service Functions

### Core Functions
- `updateSeatData(seatId, data, dataType)` - Save count or session data
- `getSeatData(seatId)` - Get complete data for a specific seat
- `getAllSeatsData()` - Get data for all seats
- `getTodayCounts()` - Get today's count for all seats
- `getCurrentSessions()` - Get current session for all seats
- `getSeatSessionHistory(seatId, limit)` - Get session history for a seat
- `cleanupSessionHistory(seatId)` - Keep only last 50 sessions

## Benefits of New Structure

### ✅ **Simplified**
- Only 1 collection instead of 4
- One document per seat instead of multiple documents
- Easier to understand and maintain

### ✅ **Comprehensive**
- All seat data in one place
- Both count and session data together
- Historical session data preserved

### ✅ **Efficient**
- Fewer database reads/writes
- Better data locality
- Easier queries

### ✅ **Scalable**
- Easy to add new seats
- Session history management
- Automatic cleanup of old data

## Usage Examples

### Save Count Data
```javascript
await FirestoreService.updateSeatData(1, { count: 42 }, 'count');
```

### Save Session Data
```javascript
await FirestoreService.updateSeatData(1, sessionData, 'session');
```

### Get Seat Data
```javascript
const seatData = await FirestoreService.getSeatData(1);
console.log(seatData.current_session); // Latest session
console.log(seatData.daily_counts); // Daily counts
```

### Get Today's Counts
```javascript
const todayCounts = await FirestoreService.getTodayCounts();
// Returns: { 1: 42, 2: 38, 3: 45, 4: 29, 5: 33 }
```

## Migration from Old Structure

The old structure had:
- `sessions` collection
- `seat_stats` collection  
- `daily_usage` collection
- `person_types` collection

The new structure consolidates all this into the `seats` collection, making it much simpler and more efficient. 