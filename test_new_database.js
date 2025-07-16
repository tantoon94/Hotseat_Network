// Test script for the new simplified Firestore database structure
// Run this in the browser console to test the new database functions

async function testNewDatabase() {
    console.log('🧪 Testing new simplified database structure...');
    
    try {
        // Test 1: Save count data
        console.log('📊 Test 1: Saving count data...');
        await FirestoreService.updateSeatData(1, { count: 42 }, 'count');
        
        // Test 2: Save session data
        console.log('🪑 Test 2: Saving session data...');
        const sessionData = {
            count: 42,
            session_start_datetime: '2025-07-16 17:30:00',
            session_end_datetime: '2025-07-16 17:35:00',
            session_duration_ms: 300000, // 5 minutes
            average_resistance: 18.5,
            person_type: 'Adult'
        };
        await FirestoreService.updateSeatData(1, sessionData, 'session');
        
        // Test 3: Get seat data
        console.log('📋 Test 3: Retrieving seat data...');
        const seatData = await FirestoreService.getSeatData(1);
        console.log('Seat 1 data:', seatData);
        
        // Test 4: Get today's counts
        console.log('📈 Test 4: Getting today\'s counts...');
        const todayCounts = await FirestoreService.getTodayCounts();
        console.log('Today\'s counts:', todayCounts);
        
        // Test 5: Get current sessions
        console.log('🪑 Test 5: Getting current sessions...');
        const currentSessions = await FirestoreService.getCurrentSessions();
        console.log('Current sessions:', currentSessions);
        
        console.log('✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testNewDatabase(); 