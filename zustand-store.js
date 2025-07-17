/**
 * Hotseat Network Zustand Store
 * Lightweight state management using Zustand
 */

// Import Zustand from CDN (will be loaded in HTML)
// const { create } = window.zustand;

// Create the main store
const useHotseatStore = create((set, get) => ({
  // State
  seats: {},
  connections: {
    firestore: false,
    mqtt: false,
    demo: false
  },
  ui: {
    loading: false,
    error: null,
    lastUpdate: null
  },
  analytics: {
    totalSessions: 0,
    activeSeats: 0,
    averageSessionDuration: 0
  },

  // Actions
  updateSeat: (seatId, data) => set((state) => ({
    seats: {
      ...state.seats,
      [seatId]: {
        ...state.seats[seatId],
        ...data
      }
    },
    ui: {
      ...state.ui,
      lastUpdate: new Date().toISOString()
    }
  })),

  updateSeats: (seatsData) => set((state) => ({
    seats: {
      ...state.seats,
      ...seatsData
    },
    ui: {
      ...state.ui,
      lastUpdate: new Date().toISOString()
    }
  })),

  updateConnection: (connectionType, status) => set((state) => ({
    connections: {
      ...state.connections,
      [connectionType]: status
    }
  })),

  setLoading: (loading) => set((state) => ({
    ui: {
      ...state.ui,
      loading
    }
  })),

  setError: (error) => set((state) => ({
    ui: {
      ...state.ui,
      error
    }
  })),

  updateAnalytics: (analytics) => set((state) => ({
    analytics: {
      ...state.analytics,
      ...analytics
    }
  })),

  reset: () => set({
    seats: {},
    connections: {
      firestore: false,
      mqtt: false,
      demo: false
    },
    ui: {
      loading: false,
      error: null,
      lastUpdate: null
    },
    analytics: {
      totalSessions: 0,
      activeSeats: 0,
      averageSessionDuration: 0
    }
  }),

  // Computed selectors
  getSeat: (seatId) => get().seats[seatId] || null,
  
  getActiveSeats: () => {
    const state = get();
    return Object.values(state.seats).filter(seat => 
      seat.current_session && seat.current_session.count > 0
    );
  },

  getSeatCount: () => Object.keys(get().seats).length,

  getTotalSessions: () => {
    const state = get();
    return Object.values(state.seats).reduce((total, seat) => {
      return total + (seat.session_history ? seat.session_history.length : 0);
    }, 0);
  },

  // Computed analytics
  computeAnalytics: () => {
    const state = get();
    const activeSeats = state.getActiveSeats().length;
    const totalSessions = state.getTotalSessions();
    
    // Calculate average session duration
    let totalDuration = 0;
    let sessionCount = 0;
    
    Object.values(state.seats).forEach(seat => {
      if (seat.session_history) {
        seat.session_history.forEach(session => {
          if (session.session_duration_ms) {
            totalDuration += session.session_duration_ms;
            sessionCount++;
          }
        });
      }
    });
    
    const averageSessionDuration = sessionCount > 0 ? totalDuration / sessionCount : 0;
    
    state.updateAnalytics({
      activeSeats,
      totalSessions,
      averageSessionDuration
    });
  }
}));

// Create a hook for subscribing to specific parts of state
const useSeatData = (seatId) => {
  return useHotseatStore((state) => state.seats[seatId] || null);
};

const useConnectionStatus = () => {
  return useHotseatStore((state) => state.connections);
};

const useUIState = () => {
  return useHotseatStore((state) => state.ui);
};

const useAnalytics = () => {
  return useHotseatStore((state) => state.analytics);
};

const useActiveSeats = () => {
  return useHotseatStore((state) => state.getActiveSeats());
};

// Export for use in other files
window.useHotseatStore = useHotseatStore;
window.useSeatData = useSeatData;
window.useConnectionStatus = useConnectionStatus;
window.useUIState = useUIState;
window.useAnalytics = useAnalytics;
window.useActiveSeats = useActiveSeats;

console.log('🚀 Zustand store initialized'); 