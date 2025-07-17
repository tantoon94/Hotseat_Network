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

// Export for use in other files
window.FirestoreService = FirestoreService;
window.COLLECTION_NAME = COLLECTION_NAME; 