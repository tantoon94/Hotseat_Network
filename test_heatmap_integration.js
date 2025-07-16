// Test script for heatmap integration with new database structure
// Run this in the browser console to test heatmap functionality

async function testHeatmapIntegration() {
    console.log('🔥 Testing heatmap integration with new database structure...');
    
    try {
        // Test 1: Generate some sample heatmap data
        console.log('📊 Test 1: Generating sample heatmap data...');
        
        // Simulate multiple sessions for different hours
        const testSessions = [
            { seatId: 1, hour: 10, count: 5 },
            { seatId: 1, hour: 11, count: 8 },
            { seatId: 1, hour: 12, count: 12 },
            { seatId: 2, hour: 10, count: 3 },
            { seatId: 2, hour: 11, count: 6 },
            { seatId: 2, hour: 14, count: 9 },
            { seatId: 3, hour: 15, count: 7 },
            { seatId: 4, hour: 16, count: 11 },
            { seatId: 5, hour: 17, count: 4 }
        ];
        
        // Save sample data to Firestore
        for (const session of testSessions) {
            const sessionData = {
                count: session.count,
                session_start_datetime: `2025-07-16 ${session.hour.toString().padStart(2, '0')}:00:00`,
                session_end_datetime: `2025-07-16 ${session.hour.toString().padStart(2, '0')}:05:00`,
                session_duration_ms: 300000, // 5 minutes
                average_resistance: 18.5,
                person_type: 'Adult'
            };
            
            // Update the hour for this test
            const originalDate = new Date();
            originalDate.setHours(session.hour);
            
            // Save session data (this will also update hourly usage)
            await FirestoreService.updateSeatData(session.seatId, sessionData, 'session');
        }
        
        // Test 2: Retrieve heatmap data
        console.log('📈 Test 2: Retrieving heatmap data...');
        const heatmapData = await FirestoreService.getTodayHeatmapData();
        console.log('Today\'s heatmap data:', heatmapData);
        
        // Test 3: Display heatmap in a readable format
        console.log('🗺️ Test 3: Heatmap visualization:');
        console.log('Hour | Seat 1 | Seat 2 | Seat 3 | Seat 4 | Seat 5');
        console.log('-----|--------|--------|--------|--------|--------');
        
        for (let hour = 10; hour <= 18; hour++) {
            const row = [
                hour.toString().padStart(2, '0') + ':00',
                heatmapData[1]?.[hour] || 0,
                heatmapData[2]?.[hour] || 0,
                heatmapData[3]?.[hour] || 0,
                heatmapData[4]?.[hour] || 0,
                heatmapData[5]?.[hour] || 0
            ];
            console.log(row.map(cell => cell.toString().padStart(8)).join(' | '));
        }
        
        // Test 4: Test heatmap data for specific date
        console.log('📅 Test 4: Testing heatmap for specific date...');
        const today = new Date().toISOString().split('T')[0];
        const specificDateData = await FirestoreService.getHeatmapDataForDate(today);
        console.log('Specific date heatmap data:', specificDateData);
        
        // Test 5: Show how to use heatmap data in charts
        console.log('📊 Test 5: Preparing data for Chart.js heatmap...');
        const chartData = [];
        const labels = [];
        
        for (let hour = 10; hour <= 18; hour++) {
            labels.push(`${hour}:00`);
            for (let seatId = 1; seatId <= 5; seatId++) {
                chartData.push({
                    x: hour - 10, // 0-8 for Chart.js
                    y: seatId - 1, // 0-4 for Chart.js
                    v: heatmapData[seatId]?.[hour] || 0
                });
            }
        }
        
        console.log('Chart.js labels:', labels);
        console.log('Chart.js data:', chartData);
        
        console.log('✅ Heatmap integration test completed successfully!');
        console.log('');
        console.log('💡 How to use this data:');
        console.log('1. Use getTodayHeatmapData() to get current day data');
        console.log('2. Use getHeatmapDataForDate(date) for historical data');
        console.log('3. Data structure: {seatId: {hour: count}}');
        console.log('4. Hours range: 10-18 (10:00 to 18:00)');
        console.log('5. Seats range: 1-5');
        
    } catch (error) {
        console.error('❌ Heatmap integration test failed:', error);
    }
}

// Function to demonstrate real-time heatmap updates
async function demonstrateRealTimeHeatmap() {
    console.log('🔄 Demonstrating real-time heatmap updates...');
    
    try {
        // Simulate a new session
        const newSession = {
            count: 15,
            session_start_datetime: '2025-07-16 14:30:00',
            session_end_datetime: '2025-07-16 14:35:00',
            session_duration_ms: 300000,
            average_resistance: 19.2,
            person_type: 'Child'
        };
        
        // This will automatically update the heatmap for hour 14
        await FirestoreService.updateSeatData(1, newSession, 'session');
        
        // Get updated heatmap data
        const updatedHeatmap = await FirestoreService.getTodayHeatmapData();
        console.log('Updated heatmap data:', updatedHeatmap);
        
        console.log('✅ Real-time heatmap update demonstrated!');
        
    } catch (error) {
        console.error('❌ Real-time heatmap demonstration failed:', error);
    }
}

// Run the tests
testHeatmapIntegration().then(() => {
    // Wait a bit, then demonstrate real-time updates
    setTimeout(demonstrateRealTimeHeatmap, 2000);
}); 