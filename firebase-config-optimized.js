// Optimized Firebase configuration for Hotseat Network
// Includes data retention policies and storage optimization

const firebaseConfig = {
  apiKey: "AIzaSyBwhOI-4FuvZUUX9nJiOtKZZJGxh9LA_0o",
  authDomain: "hot-seat-network.firebaseapp.com",
  projectId: "hot-seat-network",
  storageBucket: "hot-seat-network.firebasestorage.app",
  messagingSenderId: "849028387128",
  appId: "1:849028387128:web:934504985e89e9ecf3b1cd",
  measurementId: "G-WXPSZZL2C4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const COLLECTION_NAME = 'seats';
const ARCHIVE_COLLECTION = 'seats_archive';

// Data retention settings
const RETENTION_SETTINGS = {
    DAILY_COUNTS_DAYS: 30,        // Keep last 30 days of daily counts
    SESSION_HISTORY_LIMIT: 20,    // Keep last 20 sessions
    ARCHIVE_AFTER_DAYS: 90        // Archive data older than 90 days
};

class OptimizedFirestoreService {
    
    // Update seat data with automatic cleanup
    static async updateSeatData(seatId, data, dataType) {
        try {
            const seatRef = db.collection(COLLECTION_NAME).doc(`seat_${seatId}`);
            const today = new Date().toISOString().split('T')[0];
            
            if (dataType === 'count') {
                // Update daily count with automatic cleanup
                const seatDoc = await seatRef.get();
                let dailyCounts = {};
                
                if (seatDoc.exists) {
                    dailyCounts = seatDoc.data().daily_counts || {};
                }
                
                // Add new count
                dailyCounts[today] = data.count;
                
                // Clean up old daily counts (keep only last 30 days)
                dailyCounts = this.cleanupDailyCounts(dailyCounts);
                
                await seatRef.set({
                    seat_id: seatId,
                    daily_counts: dailyCounts,
                    last_count_update: firebase.firestore.FieldValue.serverTimestamp(),
                    last_count: data.count
                }, { merge: true });
                
                console.log(`✅ Seat ${seatId} count updated: ${data.count}`);
                
            } else if (dataType === 'session') {
                // Update session data with automatic cleanup
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
                    last_session_update: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                // Add to session history with automatic cleanup
                await seatRef.set({
                    ...sessionData,
                    session_history: firebase.firestore.FieldValue.arrayUnion({
                        count: data.count,
                        session_start_datetime: data.session_start_datetime,
                        session_end_datetime: data.session_end_datetime,
                        session_duration_ms: data.session_duration_ms,
                        average_resistance: data.average_resistance,
                        person_type: data.person_type,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    })
                }, { merge: true });
                
                // Clean up session history
                await this.cleanupSessionHistory(seatId);
                
                console.log(`✅ Seat ${seatId} session data updated`);
            }
            
        } catch (error) {
            console.error(`❌ Error updating seat ${seatId} data:`, error);
            throw error;
        }
    }
    
    // Clean up daily counts - keep only last 30 days
    static cleanupDailyCounts(dailyCounts) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - RETENTION_SETTINGS.DAILY_COUNTS_DAYS);
        
        const cleanedCounts = {};
        Object.keys(dailyCounts).forEach(date => {
            if (new Date(date) >= cutoffDate) {
                cleanedCounts[date] = dailyCounts[date];
            }
        });
        
        return cleanedCounts;
    }
    
    // Clean up session history - keep only last 20 sessions
    static async cleanupSessionHistory(seatId) {
        try {
            const seatData = await this.getSeatData(seatId);
            if (seatData && seatData.session_history && seatData.session_history.length > RETENTION_SETTINGS.SESSION_HISTORY_LIMIT) {
                const recentSessions = seatData.session_history.slice(-RETENTION_SETTINGS.SESSION_HISTORY_LIMIT);
                await db.collection(COLLECTION_NAME).doc(`seat_${seatId}`).update({
                    session_history: recentSessions
                });
                console.log(`✅ Cleaned up session history for seat ${seatId}`);
            }
        } catch (error) {
            console.error(`❌ Error cleaning up session history for seat ${seatId}:`, error);
        }
    }
    
    // Archive old data to separate collection
    static async archiveOldData(seatId) {
        try {
            const seatData = await this.getSeatData(seatId);
            if (seatData && seatData.session_history) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - RETENTION_SETTINGS.ARCHIVE_AFTER_DAYS);
                
                const oldSessions = seatData.session_history.filter(session => {
                    return new Date(session.timestamp.toDate()) < cutoffDate;
                });
                
                if (oldSessions.length > 0) {
                    // Archive old sessions
                    await db.collection(ARCHIVE_COLLECTION).doc(`seat_${seatId}_${new Date().toISOString().split('T')[0]}`).set({
                        seat_id: seatId,
                        archived_sessions: oldSessions,
                        archive_date: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    console.log(`✅ Archived ${oldSessions.length} old sessions for seat ${seatId}`);
                }
            }
        } catch (error) {
            console.error(`❌ Error archiving old data for seat ${seatId}:`, error);
        }
    }
    
    // Get all seats data (same as before)
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
    
    // Get specific seat data (same as before)
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
    
    // Get today's counts for all seats (same as before)
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
    
    // Get current session data for all seats (same as before)
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
    
    // Run maintenance tasks (call this periodically)
    static async runMaintenance() {
        console.log('🔧 Running database maintenance...');
        
        try {
            for (let seatId = 1; seatId <= 5; seatId++) {
                await this.archiveOldData(seatId);
            }
            console.log('✅ Database maintenance completed');
        } catch (error) {
            console.error('❌ Error during database maintenance:', error);
        }
    }
}

// Export for use in other files
window.OptimizedFirestoreService = OptimizedFirestoreService;
window.RETENTION_SETTINGS = RETENTION_SETTINGS; 