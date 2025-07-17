# Hotseat Network Zustand Guide

## Overview

The Hotseat Network now uses **Zustand** for state management - a lightweight, modern alternative to Redux that provides a simple and intuitive API for managing application state.

## Why Zustand?

✅ **Simple API** - No providers, actions, or reducers needed
✅ **Lightweight** - Only 2.9kB gzipped
✅ **TypeScript Support** - Built-in TypeScript support
✅ **No Boilerplate** - Minimal setup required
✅ **React-like Hooks** - Familiar API for React developers
✅ **Performance** - Automatic batching and optimization

## Architecture

### Store Structure

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

### Core Files

1. **`zustand-store.js`** - Main Zustand store with actions and selectors
2. **`live-data-service.js`** - Service that integrates with the store
3. **`index.HTML`** - Updated to use Zustand hooks

## Setup

### 1. Include Zustand

Add Zustand to your HTML file:

```html
<!-- Zustand State Management -->
<script src="https://unpkg.com/zustand@4.4.7/umd/zustand.production.min.js"></script>
<script src="zustand-store.js"></script>
<script src="live-data-service.js"></script>
```

### 2. Initialize the Store

```javascript
// Initialize the Zustand state management system
async function initializeStateManagement() {
    try {
        console.log('🚀 Initializing Zustand State Management System...');
        
        // Wait for Firebase config to load
        await loadFirebaseConfig();
        
        // Initialize the enhanced live data service
        await enhancedLiveDataService.initialize();
        
        // Subscribe to state changes using Zustand
        const unsubscribe = useHotseatStore.subscribe((state) => {
            console.log('🔄 Zustand state updated:', state);
            
            // Update UI based on state changes
            updateUIFromState(state);
            
            // Update connection status indicators
            updateConnectionStatus(state.connections);
        });
        
        console.log('✅ Zustand State Management System initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize Zustand State Management System:', error);
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
const state = useHotseatStore.getState();

// Get specific seat data
const seatData = useHotseatStore.getState().getSeat('seat1');

// Get all seats data
const allSeats = useHotseatStore.getState().seats;

// Get active seats
const activeSeats = useHotseatStore.getState().getActiveSeats();

// Get connection status
const connections = useHotseatStore.getState().connections;

// Get analytics
const analytics = useHotseatStore.getState().analytics;
```

### 2. Updating State

```javascript
// Update a single seat
useHotseatStore.getState().updateSeat('seat1', {
    count: 5,
    session_duration_ms: 300000,
    average_resistance: 75.5,
    person_type: 'student'
});

// Update multiple seats
useHotseatStore.getState().updateSeats({
    seat1: { count: 3, person_type: 'student' },
    seat2: { count: 7, person_type: 'faculty' }
});

// Update connection status
useHotseatStore.getState().updateConnection('firestore', true);

// Set loading state
useHotseatStore.getState().setLoading(true);

// Set error
useHotseatStore.getState().setError('Connection failed');

// Update analytics
useHotseatStore.getState().updateAnalytics({
    activeSeats: 3,
    totalSessions: 15
});

// Reset all state
useHotseatStore.getState().reset();
```

### 3. Subscribing to Changes

```javascript
// Subscribe to all state changes
const unsubscribe = useHotseatStore.subscribe((state) => {
    console.log('State changed:', state);
    
    // Update your UI based on state changes
    if (state.ui.loading) {
        showLoadingSpinner();
    }
    
    if (state.ui.error) {
        showErrorMessage(state.ui.error);
    }
    
    // Update seat displays
    Object.entries(state.seats).forEach(([seatId, seatData]) => {
        updateSeatDisplay(seatId, seatData);
    });
});

// Unsubscribe when done
unsubscribe();
```

### 4. Using Custom Hooks

The store provides several custom hooks for specific use cases:

```javascript
// Get specific seat data
const seat1Data = useSeatData('seat1');

// Get connection status
const connections = useConnectionStatus();

// Get UI state
const uiState = useUIState();

// Get analytics
const analytics = useAnalytics();

// Get active seats
const activeSeats = useActiveSeats();
```

### 5. Computed Analytics

The store automatically computes analytics when data changes:

```javascript
// Manually trigger analytics computation
useHotseatStore.getState().computeAnalytics();

// Get computed analytics
const analytics = useHotseatStore.getState().analytics;
console.log('Active seats:', analytics.activeSeats);
console.log('Total sessions:', analytics.totalSessions);
console.log('Average session duration:', analytics.averageSessionDuration);
```

## Data Flow

### 1. Real-time Data Flow

```
MQTT/Firestore → EnhancedLiveDataService → Zustand Store → UI Components
```

### 2. State Update Flow

```
Data Source → Service → Store Action → State Update → Subscribers → UI Update
```

### 3. Fallback Strategy

1. **Primary**: Firestore real-time listeners
2. **Secondary**: MQTT connection
3. **Fallback**: Demo data generation

## Best Practices

### 1. State Updates

- Always use store actions for state updates
- Never modify state directly
- Use computed selectors for derived state

```javascript
// ✅ Good
useHotseatStore.getState().updateSeat('seat1', data);

// ❌ Bad
useHotseatStore.getState().seats.seat1 = data;
```

### 2. Subscriptions

- Always unsubscribe when components are destroyed
- Use specific selectors to avoid unnecessary re-renders

```javascript
// ✅ Good - Subscribe to specific data
const unsubscribe = useHotseatStore.subscribe((state) => {
    if (state.seats.seat1) {
        updateSeat1Display(state.seats.seat1);
    }
});

// Cleanup
unsubscribe();
```

### 3. Performance Optimization

```javascript
// Use shallow comparison for objects
const unsubscribe = useHotseatStore.subscribe(
    (state) => state.seats,
    (seats) => {
        // Only called when seats object changes
        updateSeatsDisplay(seats);
    }
);
```

### 4. Error Handling

```javascript
// Subscribe to error state
useHotseatStore.subscribe((state) => {
    if (state.ui.error) {
        showErrorMessage(state.ui.error);
    }
});
```

## Integration with Live Data Service

The `EnhancedLiveDataService` automatically integrates with the Zustand store:

```javascript
// Service automatically updates store
enhancedLiveDataService.updateSeatData('seat1', data);

// Service provides convenient methods
const allSeats = enhancedLiveDataService.getAllSeatsData();
const connections = enhancedLiveDataService.getConnectionStatus();
const analytics = enhancedLiveDataService.getAnalytics();
```

## Debugging

### 1. Console Logging

```javascript
// Log all state changes
useHotseatStore.subscribe((state) => {
    console.log('🔄 State updated:', state);
});

// Log specific actions
const originalUpdateSeat = useHotseatStore.getState().updateSeat;
useHotseatStore.setState((state) => ({
    ...state,
    updateSeat: (seatId, data) => {
        console.log('📝 Updating seat:', seatId, data);
        return originalUpdateSeat(seatId, data);
    }
}));
```

### 2. State Inspection

```javascript
// Inspect current state
console.log('Current state:', useHotseatStore.getState());

// Inspect specific parts
console.log('Seats:', useHotseatStore.getState().seats);
console.log('Connections:', useHotseatStore.getState().connections);
console.log('Analytics:', useHotseatStore.getState().analytics);
```

### 3. DevTools Integration

For development, you can integrate with Redux DevTools:

```javascript
import { devtools } from 'zustand/middleware';

const useHotseatStore = create(
    devtools(
        (set, get) => ({
            // Your store implementation
        }),
        { name: 'Hotseat Store' }
    )
);
```

## Migration from Custom State Manager

### 1. Replace Store Access

**Old way:**
```javascript
const state = hotseatStore.getState();
hotseatStore.dispatch(hotseatStore.actions.updateSeat(seatId, data));
```

**New way:**
```javascript
const state = useHotseatStore.getState();
useHotseatStore.getState().updateSeat(seatId, data);
```

### 2. Replace Subscriptions

**Old way:**
```javascript
const unsubscribe = hotseatStore.subscribe((state, action) => {
    console.log('Action:', action.type);
});
```

**New way:**
```javascript
const unsubscribe = useHotseatStore.subscribe((state) => {
    console.log('State updated:', state);
});
```

### 3. Replace Selectors

**Old way:**
```javascript
const seat1 = hotseatStore.selectors.getSeat('seat1')(state);
```

**New way:**
```javascript
const seat1 = useHotseatStore.getState().getSeat('seat1');
```

## Advanced Patterns

### 1. Async Actions

```javascript
const useHotseatStore = create((set, get) => ({
    // ... other state and actions
    
    fetchSeatData: async (seatId) => {
        set({ ui: { ...get().ui, loading: true } });
        
        try {
            const data = await fetch(`/api/seats/${seatId}`);
            const seatData = await data.json();
            
            get().updateSeat(seatId, seatData);
        } catch (error) {
            set({ ui: { ...get().ui, error: error.message } });
        } finally {
            set({ ui: { ...get().ui, loading: false } });
        }
    }
}));
```

### 2. Computed State

```javascript
const useHotseatStore = create((set, get) => ({
    // ... other state and actions
    
    getSeatStats: () => {
        const state = get();
        const seats = Object.values(state.seats);
        
        return {
            totalSeats: seats.length,
            occupiedSeats: seats.filter(s => s.current_session?.count > 0).length,
            averageResistance: seats.reduce((sum, s) => sum + (s.average_resistance || 0), 0) / seats.length
        };
    }
}));
```

### 3. State Persistence

```javascript
import { persist } from 'zustand/middleware';

const useHotseatStore = create(
    persist(
        (set, get) => ({
            // Your store implementation
        }),
        {
            name: 'hotseat-storage',
            partialize: (state) => ({ 
                seats: state.seats,
                analytics: state.analytics 
            })
        }
    )
);
```

## Performance Tips

1. **Use Shallow Comparison**: Subscribe to specific parts of state
2. **Batch Updates**: Group related state updates
3. **Memoize Selectors**: Use computed selectors for expensive calculations
4. **Cleanup Subscriptions**: Always unsubscribe to prevent memory leaks

## Conclusion

Zustand provides a simple, powerful, and performant state management solution for the Hotseat Network application. Its minimal API and excellent performance make it an ideal choice for managing complex application state with real-time data.

The integration with the live data service ensures seamless data flow from multiple sources while maintaining a clean and predictable state management pattern. 