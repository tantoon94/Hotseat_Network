// MQTT to Firestore Bridge Service
// This service receives MQTT data and stores it in Firestore
// Run this as a separate service: node mqtt-to-firestore.js

const mqtt = require('mqtt');
const admin = require('firebase-admin');

// MQTT Configuration
const MQTT_CONFIG = {
    host: 'mqtt.cetools.org',
    port: 8090,
    username: 'student',
    password: 'ce2021-mqtt-forget-whale',
    clientId: 'mqtt-to-firestore-bridge-' + Math.random().toString(16).substr(2, 8)
};

// Firebase Admin SDK Configuration
const serviceAccount = require('./firebase-service-account.json'); // You'll need to create this

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'hot-seat-network'
});

const db = admin.firestore();
const COLLECTION_NAME = 'seats';

console.log('🚀 Starting MQTT to Firestore Bridge Service...');

// Connect to MQTT broker
function connectToMQTT() {
    const connectUrls = [
        `ws://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}/mqtt`,
        `wss://${MQTT_CONFIG.host}:8090/mqtt`
    ];

    console.log('🔌 Attempting to connect to MQTT broker...');
    console.log('📍 Host:', MQTT_CONFIG.host, 'Port:', MQTT_CONFIG.port);

    const client = mqtt.connect(connectUrls[0], {
        clientId: MQTT_CONFIG.clientId,
        username: MQTT_CONFIG.username,
        password: MQTT_CONFIG.password,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        keepalive: 60
    });

    client.on('connect', function() {
        console.log('✅ Successfully connected to MQTT broker');
        
        // Subscribe to MQTT topics
        client.subscribe('student/ucbqmie/sitting_events', function(err) {
            if (err) {
                console.error('❌ Error subscribing to sitting_events:', err);
            } else {
                console.log('✅ Subscribed to student/ucbqmie/sitting_events');
            }
        });
        
        client.subscribe('student/ucbqmie/seat_counts', function(err) {
            if (err) {
                console.error('❌ Error subscribing to seat_counts:', err);
            } else {
                console.log('✅ Subscribed to student/ucbqmie/seat_counts');
            }
        });
    });

    client.on('message', async function(topic, message) {
        try {
            const data = JSON.parse(message.toString());
            console.log('📨 Received MQTT data from topic:', topic, data);
            
            if (topic === 'student/ucbqmie/sitting_events') {
                await handleSittingEvents(data);
            } else if (topic === 'student/ucbqmie/seat_counts') {
                await handleSeatCounts(data);
            }
        } catch (error) {
            console.error('❌ Error processing MQTT message:', error);
        }
    });

    client.on('error', function(error) {
        console.error('❌ MQTT Error:', error);
    });

    client.on('close', function() {
        console.log('🔌 MQTT connection closed');
    });

    client.on('reconnect', function() {
        console.log('🔄 Attempting to reconnect to MQTT broker...');
    });

    client.on('offline', function() {
        console.log('📴 MQTT client went offline');
    });

    return client;
}

// Handle sitting events data
async function handleSittingEvents(data) {
    try {
        if (data && data.seat_id && data.seat_id >= 1 && data.seat_id <= 5) {
            const seatId = data.seat_id;
            const seatRef = db.collection(COLLECTION_NAME).doc(`seat_${seatId}`);
            const today = new Date().toISOString().split('T')[0];
            const currentHour = new Date().getHours();
            
            // Update session data
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
                last_session_update: admin.firestore.FieldValue.serverTimestamp(),
                session_history: admin.firestore.FieldValue.arrayUnion({
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
                [`hourly_usage.${today}.${currentHour}`]: admin.firestore.FieldValue.increment(1)
            };
            
            await seatRef.set({
                ...sessionData,
                ...hourlyUsageData
            }, { merge: true });
            
            console.log(`✅ Seat ${seatId} session data saved to Firestore`);
        }
    } catch (error) {
        console.error('❌ Error saving sitting events to Firestore:', error);
    }
}

// Handle seat counts data
async function handleSeatCounts(data) {
    try {
        if (data && data.seat_id && data.count !== undefined) {
            const seatId = data.seat_id;
            if (seatId >= 1 && seatId <= 5) {
                const seatRef = db.collection(COLLECTION_NAME).doc(`seat_${seatId}`);
                const today = new Date().toISOString().split('T')[0];
                
                await seatRef.set({
                    seat_id: seatId,
                    daily_counts: {
                        [today]: data.count
                    },
                    last_count_update: admin.firestore.FieldValue.serverTimestamp(),
                    last_count: data.count
                }, { merge: true });
                
                console.log(`✅ Seat ${seatId} count updated: ${data.count}`);
            }
        }
    } catch (error) {
        console.error('❌ Error saving seat counts to Firestore:', error);
    }
}

// Clean up session history periodically
async function cleanupSessionHistory() {
    try {
        console.log('🧹 Starting session history cleanup...');
        
        for (let seatId = 1; seatId <= 5; seatId++) {
            const seatRef = db.collection(COLLECTION_NAME).doc(`seat_${seatId}`);
            const seatDoc = await seatRef.get();
            
            if (seatDoc.exists) {
                const data = seatDoc.data();
                if (data.session_history && data.session_history.length > 50) {
                    const recentSessions = data.session_history.slice(-50);
                    await seatRef.update({
                        session_history: recentSessions
                    });
                    console.log(`✅ Cleaned up session history for seat ${seatId}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}

// Start the service
function startService() {
    console.log('🎯 Starting MQTT to Firestore Bridge Service...');
    
    // Connect to MQTT
    const mqttClient = connectToMQTT();
    
    // Set up periodic cleanup (every hour)
    setInterval(cleanupSessionHistory, 60 * 60 * 1000);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down MQTT to Firestore Bridge Service...');
        mqttClient.end();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down MQTT to Firestore Bridge Service...');
        mqttClient.end();
        process.exit(0);
    });
}

// Start the service if this file is run directly
if (require.main === module) {
    startService();
}

module.exports = {
    connectToMQTT,
    handleSittingEvents,
    handleSeatCounts,
    cleanupSessionHistory
}; 