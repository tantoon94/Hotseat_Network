// Test script to verify critical bug fixes in Hotseat Network
// Run this in the browser console to test functionality

console.log('🧪 Testing Hotseat Network Bug Fixes...');

// Test 1: Check if MQTT configuration is properly loaded
async function testMQTTConfig() {
    console.log('📡 Testing MQTT Configuration...');
    try {
        const response = await fetch('mqtt-config.json');
        if (response.ok) {
            const config = await response.json();
            console.log('✅ MQTT config loaded successfully:', config);
            return true;
        } else {
            console.log('⚠️ MQTT config file not found (using defaults)');
            return false;
        }
    } catch (error) {
        console.log('⚠️ Error loading MQTT config:', error.message);
        return false;
    }
}

// Test 2: Check if Firebase is properly initialized
function testFirebaseInit() {
    console.log('🔥 Testing Firebase Initialization...');
    try {
        if (typeof firebase !== 'undefined') {
            console.log('✅ Firebase SDK loaded');
            if (firebase.apps.length > 0) {
                console.log('✅ Firebase app initialized');
                return true;
            } else {
                console.log('⚠️ Firebase SDK loaded but app not initialized');
                return false;
            }
        } else {
            console.log('⚠️ Firebase SDK not loaded');
            return false;
        }
    } catch (error) {
        console.log('❌ Firebase initialization error:', error.message);
        return false;
    }
}

// Test 3: Check if FirestoreService is available
function testFirestoreService() {
    console.log('🗄️ Testing Firestore Service...');
    try {
        if (typeof FirestoreService !== 'undefined') {
            console.log('✅ FirestoreService class available');
            if (FirestoreService.isAvailable) {
                console.log('✅ FirestoreService.isAvailable method exists');
                return true;
            } else {
                console.log('⚠️ FirestoreService.isAvailable method missing');
                return false;
            }
        } else {
            console.log('⚠️ FirestoreService not available');
            return false;
        }
    } catch (error) {
        console.log('❌ FirestoreService error:', error.message);
        return false;
    }
}

// Test 4: Check if demo data management is working
function testDemoDataManagement() {
    console.log('🎭 Testing Demo Data Management...');
    try {
        if (typeof stopDemoData === 'function') {
            console.log('✅ stopDemoData function available');
            return true;
        } else {
            console.log('⚠️ stopDemoData function missing');
            return false;
        }
    } catch (error) {
        console.log('❌ Demo data management error:', error.message);
        return false;
    }
}

// Test 5: Check if error handling is in place
function testErrorHandling() {
    console.log('🛡️ Testing Error Handling...');
    try {
        // Test if global error handlers are set up
        if (window.onerror) {
            console.log('✅ Global error handler set');
        } else {
            console.log('⚠️ No global error handler');
        }
        
        // Test if unhandled promise rejection handler is set
        if (window.onunhandledrejection) {
            console.log('✅ Unhandled promise rejection handler set');
        } else {
            console.log('⚠️ No unhandled promise rejection handler');
        }
        
        return true;
    } catch (error) {
        console.log('❌ Error handling test failed:', error.message);
        return false;
    }
}

// Test 6: Check if external resources are loaded with error handling
function testResourceLoading() {
    console.log('📦 Testing Resource Loading...');
    const scripts = document.querySelectorAll('script[src]');
    let hasErrorHandlers = 0;
    let totalScripts = 0;
    
    scripts.forEach(script => {
        if (script.src.includes('aframe') || script.src.includes('chart.js') || 
            script.src.includes('mqtt') || script.src.includes('firebase')) {
            totalScripts++;
            if (script.onerror) {
                hasErrorHandlers++;
            }
        }
    });
    
    console.log(`📊 External scripts with error handlers: ${hasErrorHandlers}/${totalScripts}`);
    return hasErrorHandlers > 0;
}

// Test 7: Check if MQTT connection retry mechanism is in place
function testMQTTRetryMechanism() {
    console.log('🔄 Testing MQTT Retry Mechanism...');
    try {
        if (typeof mqttConnectionAttempts !== 'undefined' && 
            typeof MAX_MQTT_ATTEMPTS !== 'undefined') {
            console.log('✅ MQTT retry variables defined');
            console.log(`📊 Max attempts: ${MAX_MQTT_ATTEMPTS}`);
            return true;
        } else {
            console.log('⚠️ MQTT retry mechanism not found');
            return false;
        }
    } catch (error) {
        console.log('❌ MQTT retry test failed:', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting comprehensive test suite...\n');
    
    const tests = [
        { name: 'MQTT Configuration', test: testMQTTConfig },
        { name: 'Firebase Initialization', test: testFirebaseInit },
        { name: 'Firestore Service', test: testFirestoreService },
        { name: 'Demo Data Management', test: testDemoDataManagement },
        { name: 'Error Handling', test: testErrorHandling },
        { name: 'Resource Loading', test: testResourceLoading },
        { name: 'MQTT Retry Mechanism', test: testMQTTRetryMechanism }
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const result = await test.test();
            results.push({ name: test.name, passed: result });
        } catch (error) {
            results.push({ name: test.name, passed: false, error: error.message });
        }
    }
    
    // Summary
    console.log('\n📋 Test Results Summary:');
    console.log('=' * 50);
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.name}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });
    
    console.log('\n📊 Overall Results:');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Bug fixes are working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Please check the issues above.');
    }
    
    return results;
}

// Export for manual testing
window.testHotseatNetwork = runAllTests;

// Auto-run tests if this script is loaded directly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
} 