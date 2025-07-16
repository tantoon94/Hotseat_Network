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

// Firestore collections
const COLLECTIONS = {
    SESSIONS: 'sessions',
    SEAT_STATS: 'seat_stats',
    DAILY_USAGE: 'daily_usage',
    PERSON_TYPES: 'person_types'
};

// Firestore service functions
class FirestoreService {
    
    // Save session data
    static async saveSession(sessionData) {
        try {
            const sessionRef = await db.collection(COLLECTIONS.SESSIONS).add({
                ...sessionData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
            });
            console.log('✅ Session saved to Firestore:', sessionRef.id);
            return sessionRef.id;
        } catch (error) {
            console.error('❌ Error saving session to Firestore:', error);
            throw error;
        }
    }
    
    // Update seat statistics
    static async updateSeatStats(seatId, stats) {
        try {
            const seatRef = db.collection(COLLECTIONS.SEAT_STATS).doc(`seat_${seatId}`);
            await seatRef.set({
                seat_id: seatId,
                ...stats,
                last_updated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`✅ Seat ${seatId} stats updated in Firestore`);
        } catch (error) {
            console.error(`❌ Error updating seat ${seatId} stats:`, error);
            throw error;
        }
    }
    
    // Update daily usage heatmap data
    static async updateDailyUsage(seatId, hour, count) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const usageRef = db.collection(COLLECTIONS.DAILY_USAGE).doc(today);
            
            await usageRef.set({
                date: today,
                [`seat_${seatId}.hour_${hour}`]: count,
                last_updated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log(`✅ Daily usage updated for seat ${seatId} at hour ${hour}`);
        } catch (error) {
            console.error(`❌ Error updating daily usage:`, error);
            throw error;
        }
    }
    
    // Update person type counts
    static async updatePersonTypeCounts(counts) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const personRef = db.collection(COLLECTIONS.PERSON_TYPES).doc(today);
            
            await personRef.set({
                date: today,
                ...counts,
                last_updated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('✅ Person type counts updated in Firestore');
        } catch (error) {
            console.error('❌ Error updating person type counts:', error);
            throw error;
        }
    }
    
    // Get today's usage data
    static async getTodayUsage() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const usageDoc = await db.collection(COLLECTIONS.DAILY_USAGE).doc(today).get();
            
            if (usageDoc.exists) {
                return usageDoc.data();
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting today\'s usage:', error);
            throw error;
        }
    }
    
    // Get person type counts for today
    static async getPersonTypeCounts() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const personDoc = await db.collection(COLLECTIONS.PERSON_TYPES).doc(today).get();
            
            if (personDoc.exists) {
                return personDoc.data();
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting person type counts:', error);
            throw error;
        }
    }
    
    // Get seat statistics
    static async getSeatStats(seatId) {
        try {
            const seatDoc = await db.collection(COLLECTIONS.SEAT_STATS).doc(`seat_${seatId}`).get();
            
            if (seatDoc.exists) {
                return seatDoc.data();
            }
            return null;
        } catch (error) {
            console.error(`❌ Error getting seat ${seatId} stats:`, error);
            throw error;
        }
    }
    
    // Get recent sessions (last 24 hours)
    static async getRecentSessions(limit = 50) {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const sessionsSnapshot = await db.collection(COLLECTIONS.SESSIONS)
                .where('timestamp', '>=', yesterday)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            return sessionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('❌ Error getting recent sessions:', error);
            throw error;
        }
    }
    
    // Get analytics data for a date range
    static async getAnalytics(startDate, endDate) {
        try {
            const sessionsSnapshot = await db.collection(COLLECTIONS.SESSIONS)
                .where('date', '>=', startDate)
                .where('date', '<=', endDate)
                .get();
            
            return sessionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('❌ Error getting analytics:', error);
            throw error;
        }
    }
}

// Export for use in other files
window.FirestoreService = FirestoreService;
window.COLLECTIONS = COLLECTIONS; 