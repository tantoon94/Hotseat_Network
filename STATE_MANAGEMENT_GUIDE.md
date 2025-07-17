# Hotseat Network State Management Guide

## Overview

The Hotseat Network now uses a Redux-like state management system that provides centralized state management for real-time data from Firestore, MQTT, and demo sources. This system ensures predictable data flow, easy debugging, and maintainable code.

## Architecture

### Core Components

1. **HotseatStateManager** (`state-manager.js`)
   - Centralized store with immutable state updates
   - Action-based state modifications
   - Middleware support for logging and analytics
   - Development tools with time-travel debugging

2. **EnhancedLiveDataService** (`live-data-service.js`)
   - Integrates with the state manager
   - Handles multiple data sources (Firestore, MQTT, Demo)
   - Automatic fallback mechanisms
   - Real-time data synchronization

3. **State Structure**
   ```javascript
   {
     seats: {},           // All seat data
     connections: {       // Data source status
       firestore: false,
       mqtt: false,
       demo: false
     },
     ui: {               // UI state
       loading: false,
       error: null,
       lastUpdate: null
     },
     analytics: {        // Computed analytics
       totalSessions: 0,
       activeSeats: 0,
       averageSessionDuration: 0
     }
   }
   ```

## Setup

### 1. Include Required Scripts

Add these scripts to your HTML file in the correct order:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- State Management System -->
<script src="state-manager.js"></script>
<script src="live-data-service.js"></script>
```

### 2. Initialize the System

```javascript
// Initialize the enhanced state management system
async function initializeStateManagement() {
    try {
        console.log('🚀 Initializing Enhanced State Management System...');
        
        // Wait for Firebase config to load
        await loadFirebaseConfig();
        
        // Initialize the enhanced live data service
        await enhancedLiveDataService.initialize();
        
        // Subscribe to state changes
        const unsubscribe = enhancedLiveDataService.subscribe((state, action) => {
            console.log('🔄 State updated:', action.type, state);
            
            // Update UI based on state changes
            updateUIFromState(state);
            
            // Update connection status indicators
            updateConnectionStatus(state.connections);
        });
        
        console.log('✅ State Management System initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize State Management System:', error);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeStateManagement();
});
```

## Usage

### 1. Accessing State

```javascript
// Get current state
const state = enhancedLiveDataService.getState();

// Get specific seat data
const seatData = enhancedLiveDataService.getSeatData('seat1');

// Get all seats data
const allSeats = enhancedLiveDataService.getAllSeatsData();

// Get active seats
const activeSeats = enhancedLiveDataService.getActiveSeats();

// Get connection status
const connections = enhancedLiveDataService.getConnectionStatus();

// Get analytics
const analytics = enhancedLiveDataService.getAnalytics();
```

### 2. Subscribing to State Changes

```javascript
// Subscribe to all state changes
const unsubscribe = enhancedLiveDataService.subscribe((state, action) => {
    console.log('State changed:', action.type);
    
    // Update your UI based on state changes
    if (action.type === 'SEAT_UPDATE') {
        updateSeatDisplay(action.payload.seatId, action.payload.data);
    }
    
    if (action.type === 'CONNECTION_UPDATE') {
        updateConnectionIndicator(state.connections);
    }
});

// Unsubscribe when done
unsubscribe();
```

### 3. Dispatching Actions

```javascript
// Update seat data
enhancedLiveDataService.updateSeatData('seat1', {
    count: 5,
    session_duration_ms: 300000,
    average_resistance: 75.5,
    person_type: 'student'
});

// Reset all data
enhancedLiveDataService.reset();
```

### 4. Using Selectors

```javascript
const store = window.hotseatStore;

// Get specific seat
const seat1 = store.selectors.getSeat('seat1')(store.getState());

// Get all seats
const allSeats = store.selectors.getAllSeats(store.getState());

// Get active seats
const activeSeats = store.selectors.getActiveSeats(store.getState());

// Get connection status
const connections = store.selectors.getConnectionStatus(store.getState());

// Get analytics
const analytics = store.selectors.getAnalytics(store.getState());
```

## Data Flow

### 1. Real-time Data Flow

```
MQTT/Firestore → EnhancedLiveDataService → State Manager → UI Components
```

### 2. Action Flow

```
User Action → Action Creator → Dispatch → Middleware → Reducer → State Update → Subscribers → UI Update
```

### 3. Fallback Strategy

1. **Primary**: Firestore real-time listeners
2. **Secondary**: MQTT connection
3. **Fallback**: Demo data generation

## Development Tools

### 1. Dev Tools Panel

In development mode (localhost), a dev tools panel is automatically created:

- **Toggle**: Press `Ctrl+Shift+H`
- **Features**:
  - Real-time state display
  - Connection status indicators
  - Action history
  - Time-travel debugging

### 2. Console Logging

All actions are automatically logged to the console:

```javascript
🔄 Action: SEAT_UPDATE {seatId: "seat1", data: {...}}
🔄 Action: CONNECTION_UPDATE {firestore: true}
🔄 Action: ANALYTICS_UPDATE {activeSeats: 3, totalSessions: 15}
```

### 3. Time Travel Debugging

```javascript
// Get action history
const history = hotseatStore.getActionHistory();

// Travel back to a specific action
hotseatStore.timeTravel(5); // Go back to action index 5
```

## Middleware

### 1. Built-in Middleware

The system includes two built-in middleware:

**Logging Middleware**
```javascript
hotseatStore.use((action, state) => {
    console.log(`🔄 Action: ${action.type}`, action.payload);
    return action;
});
```

**Analytics Middleware**
```javascript
hotseatStore.use((action, state) => {
    if (action.type === 'SEAT_UPDATE' || action.type === 'SEATS_UPDATE') {
        const activeSeats = hotseatStore.selectors.getActiveSeats(state).length;
        const totalSessions = hotseatStore.selectors.getTotalSessions(state);
        
        hotseatStore.dispatch(hotseatStore.actions.updateAnalytics({
            activeSeats,
            totalSessions
        }));
    }
    return action;
});
```

### 2. Custom Middleware

```javascript
// Add custom middleware
hotseatStore.use((action, state) => {
    // Your custom logic here
    if (action.type === 'SEAT_UPDATE') {
        // Send analytics to external service
        sendAnalytics(action.payload);
    }
    return action;
});
```

## Best Practices

### 1. State Updates

- Always use action creators for state updates
- Never modify state directly
- Use selectors to access state

```javascript
// ✅ Good
enhancedLiveDataService.updateSeatData('seat1', data);

// ❌ Bad
hotseatStore.state.seats.seat1 = data;
```

### 2. Subscriptions

- Always unsubscribe when components are destroyed
- Use specific selectors instead of subscribing to all state changes

```javascript
// ✅ Good
const unsubscribe = enhancedLiveDataService.subscribe((state, action) => {
    if (action.type === 'SEAT_UPDATE' && action.payload.seatId === 'seat1') {
        updateSeat1Display(action.payload.data);
    }
});

// Cleanup
unsubscribe();
```

### 3. Error Handling

```javascript
// Subscribe to error state
enhancedLiveDataService.subscribe((state, action) => {
    if (state.ui.error) {
        showErrorMessage(state.ui.error);
    }
});
```

### 4. Performance

- Use specific selectors to avoid unnecessary re-renders
- Debounce frequent updates
- Clean up subscriptions

## Troubleshooting

### 1. Common Issues

**State not updating**
- Check if action is being dispatched
- Verify reducer is handling the action type
- Ensure subscribers are properly registered

**Connection issues**
- Check network connectivity
- Verify MQTT/Firestore configuration
- Look for console errors

**Performance issues**
- Check for memory leaks in subscriptions
- Verify middleware isn't causing infinite loops
- Monitor action frequency

### 2. Debug Commands

```javascript
// Check current state
console.log(enhancedLiveDataService.getState());

// Check action history
console.log(hotseatStore.getActionHistory());

// Check connection status
console.log(enhancedLiveDataService.getConnectionStatus());

// Force demo data
enhancedLiveDataService.generateDemoData();

// Reset state
enhancedLiveDataService.reset();
```

### 3. Development Mode

Enable development mode by running on localhost:

```javascript
// Dev tools will automatically appear
// Press Ctrl+Shift+H to toggle
```

## Migration from Old System

### 1. Replace Direct Data Access

**Old way:**
```javascript
// Direct access to global variables
updateSeatData(seatId, data);
```

**New way:**
```javascript
// Use state manager
enhancedLiveDataService.updateSeatData(seatId, data);
```

### 2. Replace Event Listeners

**Old way:**
```javascript
// Direct MQTT event handling
mqttClient.on('message', handleMessage);
```

**New way:**
```javascript
// Subscribe to state changes
enhancedLiveDataService.subscribe((state, action) => {
    if (action.type === 'SEAT_UPDATE') {
        handleSeatUpdate(action.payload);
    }
});
```

### 3. Replace Connection Checks

**Old way:**
```javascript
if (mqttClient && mqttClient.connected) {
    // Do something
}
```

**New way:**
```javascript
const connections = enhancedLiveDataService.getConnectionStatus();
if (connections.mqtt || connections.firestore) {
    // Do something
}
```

## Security Considerations

1. **Firebase Security Rules**: Ensure proper Firestore security rules
2. **MQTT Authentication**: Use secure MQTT credentials
3. **Data Validation**: Validate all incoming data
4. **Error Handling**: Don't expose sensitive information in errors

## Performance Monitoring

### 1. Action Frequency

Monitor action frequency to identify performance issues:

```javascript
let actionCount = 0;
hotseatStore.use((action, state) => {
    actionCount++;
    if (actionCount % 100 === 0) {
        console.log(`Processed ${actionCount} actions`);
    }
    return action;
});
```

### 2. Memory Usage

Monitor subscription count and cleanup:

```javascript
// Check subscription count
console.log('Active subscriptions:', hotseatStore.subscribers.length);
```

### 3. Connection Health

Monitor connection status and reconnection attempts:

```javascript
enhancedLiveDataService.subscribe((state, action) => {
    if (action.type === 'CONNECTION_UPDATE') {
        console.log('Connection status:', state.connections);
    }
});
```

## Conclusion

The new state management system provides a robust, scalable foundation for the Hotseat Network application. It ensures predictable data flow, easy debugging, and maintainable code while supporting multiple data sources with automatic fallback mechanisms.

For questions or issues, refer to the console logs and development tools for detailed debugging information. 