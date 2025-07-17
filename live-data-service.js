/**
 * Enhanced Live Data Service with Zustand
 * Integrates with Zustand store for centralized state management
 */

class EnhancedLiveDataService {
    constructor() {
        this.store = window.useHotseatStore;
        this.firestoreService = window.FirestoreService;
        this.mqttClient = null;
        this.mqttConfig = null;
        this.seatListeners = new Map();
        this.demoDataInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        // Load MQTT configuration
        this.loadMQTTConfig();
        
        console.log('🚀 Enhanced Live Data Service with Zustand initialized');
    }
    
    /**
     * Load MQTT configuration
     */
    async loadMQTTConfig() {
        try {
            const response = await fetch('mqtt-config.json');
            if (response.ok) {
                this.mqttConfig = await response.json();
                console.log('✅ MQTT config loaded');
            } else {
                throw new Error('MQTT config not found');
            }
        } catch (error) {
            console.warn('⚠️ Using default MQTT config:', error);
            this.mqttConfig = {
                host: 'broker.emqx.io',
                port: 8084,
                path: '/mqtt',
                clientId: 'hotseat-web-' + Math.random().toString(16).substr(2, 8),
                username: '',
                password: '',
                useSSL: true
            };
        }
    }
    
    /**
     * Initialize all data sources
     */
    async initialize() {
        this.store.getState().setLoading(true);
        
        try {
            // Initialize Firestore
            await this.initializeFirestore();
            
            // Initialize MQTT
            await this.initializeMQTT();
            
            // Initialize demo data as fallback
            this.initializeDemoData();
            
            // Load initial data
            await this.loadInitialData();
            
            this.store.getState().setLoading(false);
            console.log('✅ Enhanced Live Data Service fully initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Live Data Service:', error);
            this.store.getState().setError(error.message);
            this.store.getState().setLoading(false);
        }
    }
    
    /**
     * Initialize Firestore connection
     */
    async initializeFirestore() {
        if (!this.firestoreService || !this.firestoreService.isAvailable()) {
            console.warn('⚠️ Firestore not available');
            this.store.getState().updateConnection('firestore', false);
            return;
        }
        
        try {
            // Test Firestore connection
            const testData = await this.firestoreService.getAllSeatsData();
            this.store.getState().updateConnection('firestore', true);
            console.log('✅ Firestore connected');
            
            // Set up real-time listeners for all seats
            await this.setupFirestoreListeners();
            
        } catch (error) {
            console.error('❌ Firestore initialization failed:', error);
            this.store.getState().updateConnection('firestore', false);
        }
    }
    
    /**
     * Set up Firestore real-time listeners
     */
    async setupFirestoreListeners() {
        if (!this.firestoreService || !this.firestoreService.isAvailable()) {
            return;
        }
        
        try {
            // Listen to all seats collection
            const db = firebase.firestore();
            const seatsRef = db.collection('seats');
            
            seatsRef.onSnapshot((snapshot) => {
                const seatsData = {};
                
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const seatId = data.seat_id;
                    seatsData[seatId] = data;
                });
                
                // Update state with new data
                this.store.getState().updateSeats(seatsData);
                
                // Compute analytics after data update
                this.store.getState().computeAnalytics();
                
            }, (error) => {
                console.error('❌ Firestore listener error:', error);
                this.store.getState().updateConnection('firestore', false);
            });
            
        } catch (error) {
            console.error('❌ Failed to setup Firestore listeners:', error);
        }
    }
    
    /**
     * Initialize MQTT connection
     */
    async initializeMQTT() {
        if (!this.mqttConfig || typeof mqtt === 'undefined') {
            console.warn('⚠️ MQTT not available');
            this.store.getState().updateConnection('mqtt', false);
            return;
        }
        
        try {
            const connectUrl = `${this.mqttConfig.useSSL ? 'wss' : 'ws'}://${this.mqttConfig.host}:${this.mqttConfig.port}${this.mqttConfig.path}`;
            
            this.mqttClient = mqtt.connect(connectUrl, {
                clientId: this.mqttConfig.clientId,
                username: this.mqttConfig.username,
                password: this.mqttConfig.password,
                clean: true,
                reconnectPeriod: 5000,
                connectTimeout: 30000,
                rejectUnauthorized: false
            });
            
            this.mqttClient.on('connect', () => {
                console.log('✅ MQTT connected');
                this.store.getState().updateConnection('mqtt', true);
                this.reconnectAttempts = 0;
                
                // Subscribe to seat topics
                this.subscribeToSeatTopics();
            });
            
            this.mqttClient.on('message', (topic, message) => {
                this.handleMQTTMessage(topic, message);
            });
            
            this.mqttClient.on('error', (error) => {
                console.error('❌ MQTT error:', error);
                this.store.getState().updateConnection('mqtt', false);
            });
            
            this.mqttClient.on('close', () => {
                console.log('⚠️ MQTT connection closed');
                this.store.getState().updateConnection('mqtt', false);
                this.handleMQTTReconnect();
            });
            
        } catch (error) {
            console.error('❌ MQTT initialization failed:', error);
            this.store.getState().updateConnection('mqtt', false);
        }
    }
    
    /**
     * Subscribe to MQTT seat topics
     */
    subscribeToSeatTopics() {
        if (!this.mqttClient) return;
        
        // Subscribe to all seat topics
        for (let i = 1; i <= 5; i++) {
            const topic = `hotseat/seat${i}/data`;
            this.mqttClient.subscribe(topic, (err) => {
                if (err) {
                    console.error(`❌ Failed to subscribe to ${topic}:`, err);
                } else {
                    console.log(`✅ Subscribed to ${topic}`);
                }
            });
        }
    }
    
    /**
     * Handle incoming MQTT messages
     */
    handleMQTTMessage(topic, message) {
        try {
            const data = JSON.parse(message.toString());
            const seatId = topic.split('/')[1]; // Extract seat ID from topic
            
            // Update state with MQTT data
            this.store.getState().updateSeat(seatId, data);
            
            // Compute analytics after data update
            this.store.getState().computeAnalytics();
            
            // Also update Firestore if available
            if (this.firestoreService && this.firestoreService.isAvailable()) {
                this.firestoreService.updateSeatData(seatId, data, 'count');
            }
            
        } catch (error) {
            console.error('❌ Error parsing MQTT message:', error);
        }
    }
    
    /**
     * Handle MQTT reconnection
     */
    handleMQTTReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting MQTT reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                this.initializeMQTT();
            }, 5000 * this.reconnectAttempts); // Exponential backoff
        } else {
            console.error('❌ Max MQTT reconnection attempts reached');
        }
    }
    
    /**
     * Initialize demo data as fallback
     */
    initializeDemoData() {
        // Clear existing interval
        if (this.demoDataInterval) {
            clearInterval(this.demoDataInterval);
        }
        
        // Only start demo data if no other connections are available
        const checkConnections = () => {
            const connections = this.store.getState().connections;
            const hasRealData = connections.firestore || connections.mqtt;
            
            if (!hasRealData) {
                this.store.getState().updateConnection('demo', true);
                this.generateDemoData();
            } else {
                this.store.getState().updateConnection('demo', false);
            }
        };
        
        // Check connections every 10 seconds
        this.demoDataInterval = setInterval(checkConnections, 10000);
        checkConnections(); // Initial check
    }
    
    /**
     * Generate demo data
     */
    generateDemoData() {
        const demoSeats = {};
        
        for (let i = 1; i <= 5; i++) {
            const isOccupied = Math.random() > 0.7; // 30% chance of being occupied
            const count = isOccupied ? Math.floor(Math.random() * 10) + 1 : 0;
            
            demoSeats[`seat${i}`] = {
                seat_id: `seat${i}`,
                current_session: {
                    count: count,
                    session_start_datetime: isOccupied ? new Date(Date.now() - Math.random() * 300000).toISOString() : null,
                    session_end_datetime: null,
                    session_duration_ms: isOccupied ? Math.random() * 300000 : 0,
                    average_resistance: isOccupied ? Math.random() * 100 : 0,
                    person_type: isOccupied ? ['student', 'faculty', 'visitor'][Math.floor(Math.random() * 3)] : null
                },
                daily_counts: {
                    [new Date().toISOString().split('T')[0]]: count
                },
                last_count_update: new Date().toISOString(),
                last_count: count
            };
        }
        
        // Update state with demo data
        this.store.getState().updateSeats(demoSeats);
        
        // Compute analytics after data update
        this.store.getState().computeAnalytics();
    }
    
    /**
     * Load initial data from all sources
     */
    async loadInitialData() {
        try {
            // Try Firestore first
            if (this.firestoreService && this.firestoreService.isAvailable()) {
                const firestoreData = await this.firestoreService.getAllSeatsData();
                if (Object.keys(firestoreData).length > 0) {
                    this.store.getState().updateSeats(firestoreData);
                    this.store.getState().computeAnalytics();
                    console.log('✅ Initial data loaded from Firestore');
                    return;
                }
            }
            
            // Fallback to demo data
            this.generateDemoData();
            console.log('✅ Initial demo data generated');
            
        } catch (error) {
            console.error('❌ Failed to load initial data:', error);
            this.generateDemoData();
        }
    }
    
    /**
     * Get current state
     */
    getState() {
        return this.store.getState();
    }
    
    /**
     * Subscribe to state changes
     */
    subscribe(callback) {
        return this.store.subscribe(callback);
    }
    
    /**
     * Get specific seat data
     */
    getSeatData(seatId) {
        return this.store.getState().getSeat(seatId);
    }
    
    /**
     * Get all seats data
     */
    getAllSeatsData() {
        return this.store.getState().seats;
    }
    
    /**
     * Get active seats
     */
    getActiveSeats() {
        return this.store.getState().getActiveSeats();
    }
    
    /**
     * Get connection status
     */
    getConnectionStatus() {
        return this.store.getState().connections;
    }
    
    /**
     * Get analytics
     */
    getAnalytics() {
        return this.store.getState().analytics;
    }
    
    /**
     * Update seat data manually
     */
    updateSeatData(seatId, data) {
        this.store.getState().updateSeat(seatId, data);
        
        // Compute analytics after data update
        this.store.getState().computeAnalytics();
        
        // Also update Firestore if available
        if (this.firestoreService && this.firestoreService.isAvailable()) {
            this.firestoreService.updateSeatData(seatId, data, 'count');
        }
    }
    
    /**
     * Reset all data
     */
    reset() {
        this.store.getState().reset();
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        // Clear demo data interval
        if (this.demoDataInterval) {
            clearInterval(this.demoDataInterval);
        }
        
        // Disconnect MQTT
        if (this.mqttClient) {
            this.mqttClient.end();
        }
        
        // Clear Firestore listeners
        this.seatListeners.forEach((unsubscribe) => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.seatListeners.clear();
        
        console.log('🧹 Enhanced Live Data Service cleaned up');
    }
}

// Create global instance
const enhancedLiveDataService = new EnhancedLiveDataService();

// Export for use in other files
window.enhancedLiveDataService = enhancedLiveDataService; 