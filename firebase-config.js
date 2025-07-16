// Firebase configuration for Hotseat Network

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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Simplified Firestore collection
const COLLECTION_NAME = 'seats';

// Firestore service functions
class FirestoreService {
    
    // Update seat data with both count and session information
    static async updateSeatData(seatId, data, dataType) {
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
            throw error;
        }
    }
    
    // Get all seats data
    static async getAllSeatsData() {
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
            throw error;
        }
    }
    
    // Get specific seat data
    static async getSeatData(seatId) {
        try {
            const seatDoc = await db.collection(COLLECTION_NAME).doc(`seat_${seatId}`).get();
            
            if (seatDoc.exists) {
                return seatDoc.data();
            }
            return null;
        } catch (error) {
            console.error(`❌ Error getting seat ${seatId} data:`, error);
            throw error;
        }
    }
    
    // Get today's counts for all seats
    static async getTodayCounts() {
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
            throw error;
        }
    }
    
    // Get session history for a seat (last 10 sessions)
    static async getSeatSessionHistory(seatId, limit = 10) {
        try {
            const seatData = await this.getSeatData(seatId);
            if (seatData && seatData.session_history) {
                return seatData.session_history.slice(-limit);
            }
            return [];
        } catch (error) {
            console.error(`❌ Error getting seat ${seatId} session history:`, error);
            throw error;
        }
    }
    
    // Get current session data for all seats
    static async getCurrentSessions() {
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
            throw error;
        }
    }
    
    // Get heatmap data for today (10:00 to 18:00)
    static async getTodayHeatmapData() {
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
            throw error;
        }
    }
    
    // Get heatmap data for a specific date
    static async getHeatmapDataForDate(date) {
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
            throw error;
        }
    }
    
    // Clear old session history (keep only last 50 sessions)
    static async cleanupSessionHistory(seatId) {
        try {
            const seatData = await this.getSeatData(seatId);
            if (seatData && seatData.session_history && seatData.session_history.length > 50) {
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
    
    // Get analytics data for date range
    static async getAnalytics(startDate, endDate) {
        try {
            console.log(`📊 Fetching analytics data from ${startDate} to ${endDate}`);
            
            const snapshot = await db.collection(COLLECTION_NAME).get();
            const allSessions = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const seatId = data.seat_id;
                
                // Process session history if it exists
                if (data.session_history && Array.isArray(data.session_history)) {
                    data.session_history.forEach(session => {
                        // Extract date from session timestamp
                        let sessionDate;
                        if (session.timestamp) {
                            sessionDate = new Date(session.timestamp).toISOString().split('T')[0];
                        } else if (session.session_start_datetime) {
                            sessionDate = new Date(session.session_start_datetime).toISOString().split('T')[0];
                        } else {
                            // Fallback to today if no timestamp
                            sessionDate = new Date().toISOString().split('T')[0];
                        }
                        
                        // Check if session is within date range
                        if (sessionDate >= startDate && sessionDate <= endDate) {
                            allSessions.push({
                                ...session,
                                seat_id: seatId,
                                date: sessionDate
                            });
                        }
                    });
                }
            });
            
            console.log(`✅ Found ${allSessions.length} sessions in date range`);
            return allSessions;
            
        } catch (error) {
            console.error('❌ Error getting analytics data:', error);
            throw error;
        }
    }
}

// Export for use in other files
window.FirestoreService = FirestoreService;
window.COLLECTION_NAME = COLLECTION_NAME; 