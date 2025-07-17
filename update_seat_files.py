#!/usr/bin/env python3
"""
Update all seat HTML files to use the new Firestore architecture
and fix the missing FirestoreService.updateDailyUsage function error.
"""

import os
import re

def update_seat_file(filename):
    """Update a seat HTML file to use the new Firestore architecture."""
    print(f"🔄 Updating {filename}...")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix 1: Remove the problematic FirestoreService.updateDailyUsage call
    content = re.sub(
        r'// Save to Firestore\s+if \(firestoreEnabled\) \{\s+FirestoreService\.updateDailyUsage\([^)]+\);\s+\}',
        '// Firestore data is now handled by LiveDataService',
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    # Fix 2: Add LiveDataService variables
    if 'let liveDataService = null;' not in content:
        # Find the global variables section and add our new variables
        content = re.sub(
            r'(let currentDate = new Date\(\)\.toDateString\(\);[\s\n]+let firestoreEnabled = false;)',
            r'\1\n        let liveDataService = null;\n        let dataSource = \'firestore\'; // \'firestore\' or \'mqtt\' or \'demo\'',
            content
        )
    
    # Fix 3: Update initialization to use new data sources
    if 'initializeDataSources()' not in content:
        content = re.sub(
            r'(document\.addEventListener\(\'DOMContentLoaded\', function\(\) \{[\s\n]+)',
            r'\1            initializeDataSources();\n            ',
            content
        )
        
        # Remove old initialization calls
        content = re.sub(
            r'[\s\n]+initializeFirestore\(\);[\s\n]+initializeMQTT\(\);',
            '',
            content
        )
    
    # Fix 4: Add the new data source initialization functions
    if 'async function initializeDataSources()' not in content:
        # Find the Firestore Initialization comment and add our new functions before it
        firestore_init_pattern = r'(// Firestore Initialization)'
        new_functions = '''
        // Initialize data sources with priority: Firestore > MQTT > Demo
        async function initializeDataSources() {
            console.log('🚀 Initializing data sources...');
            
            // Try Firestore first (preferred method)
            if (await initializeFirestoreData()) {
                dataSource = 'firestore';
                console.log('✅ Using Firestore as primary data source');
                return;
            }
            
            // Fallback to MQTT
            if (await initializeMQTT()) {
                dataSource = 'mqtt';
                console.log('✅ Using MQTT as data source');
                return;
            }
            
            // Final fallback to demo data
            dataSource = 'demo';
            console.log('✅ Using demo data as fallback');
            simulateMQTTData();
        }
        
        // Initialize Firestore as primary data source
        async function initializeFirestoreData() {
            try {
                // Wait for Firebase to be available
                await waitForFirebase();
                
                if (typeof LiveDataService !== 'undefined') {
                    liveDataService = new LiveDataService();
                    
                    // Load initial data
                    const initialData = await liveDataService.loadInitialData();
                    if (Object.keys(initialData).length > 0) {
                        // Update UI with initial data
                        Object.keys(initialData).forEach(seatId => {
                            updateSeatData(seatId, initialData[seatId]);
                        });
                        
                        // Set up real-time listeners
                        const success = await liveDataService.initializeLiveData();
                        if (success) {
                            // Register callback for real-time updates
                            liveDataService.onDataUpdate((seatId, data) => {
                                updateSeatData(seatId.toString(), data);
                            });
                            
                            firestoreEnabled = true;
                            updateMQTTStatus(true, 'Firestore Live');
                            return true;
                        }
                    }
                }
                
                console.log('⚠️ Firestore not available, falling back to MQTT');
                return false;
                
            } catch (error) {
                console.error('❌ Error initializing Firestore data:', error);
                return false;
            }
        }
        
        // Wait for Firebase to be available
        function waitForFirebase() {
            return new Promise((resolve, reject) => {
                const maxAttempts = 50; // 5 seconds
                let attempts = 0;
                
                const checkFirebase = () => {
                    attempts++;
                    
                    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                        console.log('✅ Firebase is ready');
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        console.warn('⚠️ Firebase not ready after 5 seconds');
                        reject(new Error('Firebase timeout'));
                    } else {
                        setTimeout(checkFirebase, 100);
                    }
                };
                
                checkFirebase();
            });
        }
        
        // MQTT Connection (now as fallback)
        async function initializeMQTT() {
            try {
                // Initialize MQTT connection with automatic fallback to demo mode
                await connectToMQTT();
                return mqttClient && mqttClient.connected;
            } catch (error) {
                console.error('❌ MQTT initialization failed:', error);
                return false;
            }
        }
        
        // MQTT Connection function
        async function connectToMQTT() {
'''
        
        content = re.sub(firestore_init_pattern, new_functions + r'\1', content)
    
    # Fix 5: Update status indicator to show data source
    content = re.sub(
        r'statusEl\.textContent = `MQTT: \$\{message\}`;',
        'statusEl.textContent = `${dataSource.toUpperCase()}: ${message}`;',
        content
    )
    
    # Write the updated content back to the file
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {filename}")

def main():
    """Update all seat HTML files."""
    print("🔄 Updating seat HTML files to use new Firestore architecture...")
    
    # Update all seat files
    seat_files = ['seat1.html', 'seat2.html', 'seat3.html', 'seat4.html', 'seat5.html']
    
    for filename in seat_files:
        if os.path.exists(filename):
            update_seat_file(filename)
        else:
            print(f"⚠️ File {filename} not found, skipping...")
    
    print("🎉 All seat files updated successfully!")
    print("\n📋 Changes made:")
    print("✅ Removed problematic FirestoreService.updateDailyUsage calls")
    print("✅ Added LiveDataService integration")
    print("✅ Updated initialization to use Firestore as primary data source")
    print("✅ Added proper fallback mechanisms")
    print("✅ Updated status indicators to show data source")

if __name__ == "__main__":
    main() 