// Firebase configuration for Hotseat Network
// Note: In production, these keys should be stored securely and not exposed in client-side code

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwhOI-4FuvZUUX9nJiOtKZZJGxh9LA_0o",
  authDomain: "hot-seat-network.firebaseapp.com",
  projectId: "hot-seat-network",
  storageBucket: "hot-seat-network.firebasestorage.app",
  messagingSenderId: "849028387128",
  appId: "1:849028387128:web:934504985e89e9ecf3b1cd",
  measurementId: "G-WXPSZZL2C4"
};

// Initialize Firebase with error handling
let firebaseInitialized = false;
let db = null;

try {
    // Check if Firebase is already initialized
    if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully');
    } else if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        console.log('✅ Firebase already initialized');
    } else {
        throw new Error('Firebase SDK not loaded');
    }
    
    // Initialize Firestore
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        db = firebase.firestore();
        firebaseInitialized = true;
        console.log('✅ Firestore initialized successfully');
    } else {
        throw new Error('Firestore not available');
    }
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    firebaseInitialized = false;
}

// Simplified Firestore collection
const COLLECTION_NAME = 'seats';

// Firestore service functions with enhanced error handling
class FirestoreService {
    
    // Check if Firestore is available
    static isAvailable() {
        return firebaseInitialized && db !== null;
    }
    
    // Update seat data with both count and session information
    static async updateSeatData(seatId, data, dataType) {
        if (!this.isAvailable()) {
            console.warn('⚠️ Firestore not available, skipping data update');
            return;
        }
        
        try {
            const seatRef = db.collection(COLLECTION_NAME).doc(`seat_${seatId}`);
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            const currentHour = new Date().getHours();
            
            if (dataType === 'count') {
                // Update daily count data
                await seatRef.set({
                    seat_id: seatId,
                    daily_counts: {
                        [today]: data.count
                    },
                    last_count_update: firebase.firestore.FieldValue.serverTimestamp(),
                    last_count: data.count
                }, { merge: true });
                
                console.log(`✅ Seat ${seatId} count updated: ${data.count}`);
                
            } else if (dataType === 'session') {
                // Update session data and hourly usage for heatmap
                const sessionData = {
                    seat_id: seatId,
                    current_session: {
                        count: data.count,
                        session_start_datetime: data.session_start_datetime,
                        session_end_datetime: data.session_end_datetime,
                        session_duration_ms: data.session_duration_ms,
                        average_resistance: data.average_resistance,
                        person_type: data.person_type
                    },
                    last_session_update: firebase.firestore.FieldValue.serverTimestamp(),
                    session_history: firebase.firestore.FieldValue.arrayUnion({
                        count: data.count,
                        session_start_datetime: data.session_start_datetime,
                        session_end_datetime: data.session_end_datetime,
                        session_duration_ms: data.session_duration_ms,
                        average_resistance: data.average_resistance,
                        person_type: data.person_type,
                        timestamp: new Date().toISOString()
                    })
                };
                
                // Add hourly usage for heatmap
                const hourlyUsageData = {
                    [`hourly_usage.${today}.${currentHour}`]: firebase.firestore.FieldValue.increment(1)
                };
                
                await seatRef.set({
                    ...sessionData,
                    ...hourlyUsageData
                }, { merge: true });
                
                console.log(`✅ Seat ${seatId} session data and hourly usage updated`);
            }
            
        } catch (error) {
            console.error(`❌ Error updating seat ${seatId} data:`, error);
            // Don't throw error to prevent app crashes
        }
    }
    
    // Get all seats data
    static async getAllSeatsData() {
        if (!this.isAvailable()) {
            console.warn('⚠️ Firestore not available, returning empty data');
            return {};
        }
        
        try {
            const snapshot = await db.collection(COLLECTION_NAME).get();
            const seatsData = {};
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const seatId = data.seat_id;
                seatsData[seatId] = data;
            });
            
            return seatsData;
        } catch (error) {
            console.error('❌ Error getting all seats data:', error);
            return {};
        }
    }
    
    // Get specific seat data
    static async getSeatData(seatId) {
        if (!this.isAvailable()) {
            console.warn('⚠️ Firestore not available, returning null');
            return null;
        }
        
        try {
            const seatDoc = await db.collection(COLLECTION_NAME).doc(`seat_${seatId}`).get();
            
            if (seatDoc.exists) {
                return seatDoc.data();
            }
            return null;
        } catch (error) {
            console.error(`❌ Error getting seat ${seatId} data:`, error);
            return null;
        }
    }
    
    // Get today's counts for all seats
    static async getTodayCounts() {
        if (!this.isAvailable()) {
            console.warn('⚠️ Firestore not available, returning empty counts');
            return {};
        }
        
        try {
            const today = new Date().toISOString().split('T')[0];
            const snapshot = await db.collection(COLLECTION_NAME).get();
            const todayCounts = {};
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const seatId = data.seat_id;
                if (data.daily_counts && data.daily_counts[today]) {
                    todayCounts[seatId] = data.daily_counts[today];
                } else {
                    todayCounts[seatId] = 0;
                }
            });
            
            return todayCounts;
        } catch (error) {
            console.error('❌ Error getting today\'s counts:', error);
            return {};
        }
    }
    
    // Get session history for a seat (last 10 sessions)
    static async getSeatSessionHistory(seatId, limit = 10) {
        if (!this.isAvailable()) {
            console.warn('⚠️ Firestore not available, returning empty history');
            return [];
        }
        
        try {
            const seatData = await this.getSeatData(seatId);
            if (seatData && seatData.session_history) {
                return seatData.session_history.slice(-limit);
            }
            return [];
        } catch (error) {
            console.error(`❌ Error getting seat ${seatId} session history:`, error);
            return [];
        }
    }
    
    // Get current session data for all seats
    static async getCurrentSessions() {
        if (!this.isAvailable()) {
            console.warn('⚠️ Firestore not available, returning empty sessions');
            return {};
        }
        
        try {
            const snapshot = await db.collection(COLLECTION_NAME).get();
            const currentSessions = {};
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const seatId = data.seat_id;
                if (data.current_session) {
                    currentSessions[seatId] = data.current_session;
                }
            });
            
            return currentSessions;
        } catch (error) {
            console.error('❌ Error getting current sessions:', error);
            return {};
        }
    }
    
    // Get heatmap data for today (10:00 to 18:00)
    static async getTodayHeatmapData() {
        if (!this.isAvailable()) {
            console.warn('⚠️ Firestore not available, returning empty heatmap');
            return {};
        }
        
        try {
            const today = new Date().toISOString().split('T')[0];
            const snapshot = await db.collection(COLLECTION_NAME).get();
            const heatmapData = {};
            
            // Initialize heatmap structure
            for (let seatId = 1; seatId <= 5; seatId++) {
                heatmapData[seatId] = {};
                for (let hour = 10; hour <= 18; hour++) {
                    heatmapData[seatId][hour] = 0;
                }
            }
            
            // Fill in actual data from Firestore
            snapshot.forEach(doc => {
                const data = doc.data();
                const seatId = data.seat_id;
                
                if (data.hourly_usage && data.hourly_usage[today]) {
                    Object.keys(data.hourly_usage[today]).forEach(hour => {
                        const hourNum = parseInt(hour);
                        if (hourNum >= 10 && hourNum <= 18) {
                            heatmapData[seatId][hourNum] = data.hourly_usage[today][hour];
                        }
                    });
                }
            });
            
            return heatmapData;
        } catch (error) {
            console.error('❌ Error getting heatmap data:', error);
            return {};
        }
    }
    
    // Get heatmap data for a specific date
    static async getHeatmapDataForDate(date) {
        if (!this.isAvailable()) {
            console.warn('⚠️ Firestore not available, returning empty heatmap');
            return {};
        }
        
        try {
            const snapshot = await db.collection(COLLECTION_NAME).get();
            const heatmapData = {};
            
            // Initialize heatmap structure
            for (let seatId = 1; seatId <= 5; seatId++) {
                heatmapData[seatId] = {};
                for (let hour = 10; hour <= 18; hour++) {
                    heatmapData[seatId][hour] = 0;
                }
            }
            
            // Fill in actual data from Firestore
            snapshot.forEach(doc => {
                const data = doc.data();
                const seatId = data.seat_id;
                
                if (data.hourly_usage && data.hourly_usage[date]) {
                    Object.keys(data.hourly_usage[date]).forEach(hour => {
                        const hourNum = parseInt(hour);
                        if (hourNum >= 10 && hourNum <= 18) {
                            heatmapData[seatId][hourNum] = data.hourly_usage[date][hour];
                        }
                    });
                }
            });
            
            return heatmapData;
        } catch (error) {
            console.error('❌ Error getting heatmap data for date:', error);
            return {};
        }
    }
    
    // Clean up session history to prevent excessive storage usage
    static async cleanupSessionHistory(seatId) {
        if (!this.isAvailable()) {
            return;
        }
        
        try {
            const seatData = await this.getSeatData(seatId);
            if (seatData && seatData.session_history && seatData.session_history.length > 50) {
                // Keep only the last 50 sessions
                const recentSessions = seatData.session_history.slice(-50);
                await db.collection(COLLECTION_NAME).doc(`seat_${seatId}`).update({
                    session_history: recentSessions
                });
                console.log(`✅ Cleaned up session history for seat ${seatId}`);
            }
        } catch (error) {
            console.error(`❌ Error cleaning up session history for seat ${seatId}:`, error);
        }
    }
    
    // Get analytics data for a date range
    static async getAnalytics(startDate, endDate) {
        if (!this.isAvailable()) {
            console.warn('⚠️ Firestore not available, returning empty analytics');
            return {};
        }
        
        try {
            const snapshot = await db.collection(COLLECTION_NAME).get();
            const analytics = {
                totalSessions: 0,
                averageSessionDuration: 0,
                totalCounts: 0,
                seatUsage: {},
                dailyTrends: {}
            };
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const seatId = data.seat_id;
                
                if (data.session_history) {
                    analytics.totalSessions += data.session_history.length;
                    analytics.seatUsage[seatId] = data.session_history.length;
                }
                
                if (data.daily_counts) {
                    Object.values(data.daily_counts).forEach(count => {
                        analytics.totalCounts += count;
                    });
                }
            });
            
            return analytics;
        } catch (error) {
            console.error('❌ Error getting analytics:', error);
            return {};
        }
    }
}

// NEW: Live Data Service for loading data from Firestore instead of MQTT
class LiveDataService {
    constructor() {
        this.listeners = new Map();
        this.cache = new Map();
        this.isListening = false;
        this.updateCallbacks = [];
    }
    
    // Initialize real-time listeners for all seats
    async initializeLiveData() {
        if (!FirestoreService.isAvailable()) {
            console.warn('⚠️ Firestore not available, cannot initialize live data');
            return false;
        }
        
        try {
            console.log('🔄 Initializing live data from Firestore...');
            
            // Set up real-time listeners for each seat
            for (let seatId = 1; seatId <= 5; seatId++) {
                await this.setupSeatListener(seatId);
            }
            
            this.isListening = true;
            console.log('✅ Live data listeners initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Error initializing live data:', error);
            return false;
        }
    }
    
    // Set up real-time listener for a specific seat
    async setupSeatListener(seatId) {
        if (!FirestoreService.isAvailable()) {
            return;
        }
        
        try {
            const seatRef = db.collection(COLLECTION_NAME).doc(`seat_${seatId}`);
            
            // Create real-time listener
            const unsubscribe = seatRef.onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    this.handleSeatUpdate(seatId, data);
                } else {
                    console.log(`⚠️ No data found for seat ${seatId}`);
                }
            }, (error) => {
                console.error(`❌ Error listening to seat ${seatId}:`, error);
            });
            
            // Store the unsubscribe function
            this.listeners.set(seatId, unsubscribe);
            console.log(`✅ Live listener set up for seat ${seatId}`);
            
        } catch (error) {
            console.error(`❌ Error setting up listener for seat ${seatId}:`, error);
        }
    }
    
    // Handle real-time updates from Firestore
    handleSeatUpdate(seatId, data) {
        try {
            // Update cache
            this.cache.set(seatId, data);
            
            // Prepare data in the format expected by the UI
            const uiData = this.formatDataForUI(seatId, data);
            
            // Notify all registered callbacks
            this.updateCallbacks.forEach(callback => {
                try {
                    callback(seatId, uiData);
                } catch (error) {
                    console.error('❌ Error in update callback:', error);
                }
            });
            
            console.log(`📊 Live update for seat ${seatId}:`, uiData);
            
        } catch (error) {
            console.error(`❌ Error handling seat update for ${seatId}:`, error);
        }
    }
    
    // Format Firestore data for UI consumption
    formatDataForUI(seatId, data) {
        const currentSession = data.current_session || {};
        const today = new Date().toISOString().split('T')[0];
        const dailyCount = data.daily_counts?.[today] || 0;
        
        return {
            seat_id: seatId,
            count: dailyCount,
            session_start_datetime: currentSession.session_start_datetime || '',
            session_end_datetime: currentSession.session_end_datetime || '',
            session_duration_ms: currentSession.session_duration_ms || 0,
            average_resistance: currentSession.average_resistance || 0,
            person_type: currentSession.person_type || 'Unknown',
            last_update: data.last_session_update || data.last_count_update || new Date().toISOString()
        };
    }
    
    // Register callback for data updates
    onDataUpdate(callback) {
        this.updateCallbacks.push(callback);
        console.log('📝 Registered data update callback');
    }
    
    // Get current cached data for all seats
    getAllSeatsData() {
        const allData = {};
        for (let seatId = 1; seatId <= 5; seatId++) {
            const cachedData = this.cache.get(seatId);
            if (cachedData) {
                allData[seatId] = this.formatDataForUI(seatId, cachedData);
            }
        }
        return allData;
    }
    
    // Get current cached data for a specific seat
    getSeatData(seatId) {
        const cachedData = this.cache.get(seatId);
        if (cachedData) {
            return this.formatDataForUI(seatId, cachedData);
        }
        return null;
    }
    
    // Load initial data from Firestore (for first load)
    async loadInitialData() {
        if (!FirestoreService.isAvailable()) {
            console.warn('⚠️ Firestore not available, cannot load initial data');
            return {};
        }
        
        try {
            console.log('📥 Loading initial data from Firestore...');
            const allSeatsData = await FirestoreService.getAllSeatsData();
            
            // Cache the data
            Object.keys(allSeatsData).forEach(seatId => {
                this.cache.set(parseInt(seatId), allSeatsData[seatId]);
            });
            
            console.log('✅ Initial data loaded and cached');
            return this.getAllSeatsData();
            
        } catch (error) {
            console.error('❌ Error loading initial data:', error);
            return {};
        }
    }
    
    // Stop all listeners
    stopListening() {
        console.log('🛑 Stopping all live data listeners...');
        
        this.listeners.forEach((unsubscribe, seatId) => {
            try {
                unsubscribe();
                console.log(`✅ Stopped listener for seat ${seatId}`);
            } catch (error) {
                console.error(`❌ Error stopping listener for seat ${seatId}:`, error);
            }
        });
        
        this.listeners.clear();
        this.isListening = false;
        console.log('✅ All listeners stopped');
    }
    
    // Check if live data is available
    isAvailable() {
        return FirestoreService.isAvailable() && this.isListening;
    }
    
    // Get connection status
    getStatus() {
        return {
            firestoreAvailable: FirestoreService.isAvailable(),
            listening: this.isListening,
            cachedSeats: this.cache.size,
            activeListeners: this.listeners.size
        };
    }
}

// Export for use in other files
window.FirestoreService = FirestoreService;
window.COLLECTION_NAME = COLLECTION_NAME; 