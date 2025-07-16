// Firestore Storage Calculator for Hotseat Network
// This helps estimate storage costs and optimize the database structure

function calculateStorageCosts() {
    console.log('📊 Firestore Storage Cost Analysis');
    console.log('=====================================');
    
    // Current structure analysis
    const currentStructure = {
        seats: 5,
        dailyCountsPerYear: 365,
        sessionsPerDay: 50, // Assuming 50 sessions per seat per day
        sessionHistoryLimit: 50,
        bytesPerSession: 200, // Approximate bytes per session record
        bytesPerDailyCount: 50 // Approximate bytes per daily count entry
    };
    
    // Calculate storage for current structure
    const dailyCountsStorage = currentStructure.seats * currentStructure.dailyCountsPerYear * currentStructure.bytesPerDailyCount;
    const sessionHistoryStorage = currentStructure.seats * currentStructure.sessionHistoryLimit * currentStructure.bytesPerSession;
    const currentSessionStorage = currentStructure.seats * currentStructure.bytesPerSession;
    
    const totalStorageBytes = dailyCountsStorage + sessionHistoryStorage + currentSessionStorage;
    const totalStorageMB = totalStorageBytes / (1024 * 1024);
    
    console.log('📈 Current Structure Storage:');
    console.log(`- Daily counts (1 year): ${(dailyCountsStorage / 1024).toFixed(2)} KB`);
    console.log(`- Session history (50 sessions): ${(sessionHistoryStorage / 1024).toFixed(2)} KB`);
    console.log(`- Current sessions: ${(currentSessionStorage / 1024).toFixed(2)} KB`);
    console.log(`- Total: ${totalStorageMB.toFixed(2)} MB`);
    console.log('');
    
    // Calculate growth over time
    console.log('📈 Storage Growth Over Time:');
    for (let years = 1; years <= 5; years++) {
        const yearlyGrowth = currentStructure.seats * currentStructure.dailyCountsPerYear * currentStructure.bytesPerDailyCount * years;
        const totalYearlyMB = (yearlyGrowth + sessionHistoryStorage + currentSessionStorage) / (1024 * 1024);
        console.log(`${years} year${years > 1 ? 's' : ''}: ${totalYearlyMB.toFixed(2)} MB`);
    }
    console.log('');
    
    // Optimized structure suggestion
    console.log('💡 Optimized Structure Suggestion:');
    console.log('1. Keep only last 30 days of daily counts');
    console.log('2. Keep only last 20 sessions in history');
    console.log('3. Archive old data to separate collection');
    console.log('');
    
    const optimizedDailyCounts = currentStructure.seats * 30 * currentStructure.bytesPerDailyCount;
    const optimizedSessionHistory = currentStructure.seats * 20 * currentStructure.bytesPerSession;
    const optimizedTotalMB = (optimizedDailyCounts + optimizedSessionHistory + currentSessionStorage) / (1024 * 1024);
    
    console.log('📊 Optimized Structure Storage:');
    console.log(`- Daily counts (30 days): ${(optimizedDailyCounts / 1024).toFixed(2)} KB`);
    console.log(`- Session history (20 sessions): ${(optimizedSessionHistory / 1024).toFixed(2)} KB`);
    console.log(`- Current sessions: ${(currentSessionStorage / 1024).toFixed(2)} KB`);
    console.log(`- Total: ${optimizedTotalMB.toFixed(2)} MB`);
    console.log('');
    
    // Cost analysis
    console.log('💰 Firestore Cost Analysis:');
    console.log('Free Tier: 1GB storage, 50K reads/day, 20K writes/day');
    console.log(`Current usage: ${totalStorageMB.toFixed(2)} MB (${((totalStorageMB/1024)*100).toFixed(2)}% of free tier)`);
    console.log(`Optimized usage: ${optimizedTotalMB.toFixed(2)} MB (${((optimizedTotalMB/1024)*100).toFixed(2)}% of free tier)`);
    
    if (totalStorageMB > 1024) {
        console.log('⚠️ WARNING: Current structure may exceed free tier after ~1 year!');
    } else {
        console.log('✅ Current structure fits within free tier');
    }
}

// Run the analysis
calculateStorageCosts(); 