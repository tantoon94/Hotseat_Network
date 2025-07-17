# Hotseat Network - Live Dashboard

A real-time seat utilization monitoring system with AR capabilities, MQTT integration, and Firebase backend.

## 🚀 Features

- **Real-time Monitoring**: Live seat occupancy tracking via MQTT
- **AR Dashboard**: Augmented reality interface for seat data visualization
- **Analytics**: Historical data analysis and trends
- **Firebase Integration**: Cloud-based data storage and synchronization
- **Responsive Design**: Works on desktop and mobile devices
- **QR Code Integration**: Easy access via QR codes

## 🔧 Recent Bug Fixes

### Critical Issues Fixed:

1. **MQTT Connection Stability**
   - Added retry mechanism with configurable attempts
   - Improved error handling and fallback to demo mode
   - Fixed connection URL prioritization for secure connections

2. **Firebase Configuration Security**
   - Enhanced error handling for Firebase initialization
   - Added availability checks before operations
   - Prevented app crashes when Firebase is unavailable

3. **Resource Loading Issues**
   - Added error handlers for external script loading
   - Graceful degradation when resources fail to load
   - Better fallback mechanisms

4. **Demo Data Management**
   - Fixed conflicts between real and demo data
   - Added proper cleanup when switching to real data
   - Reduced Firestore write frequency in demo mode

5. **Configuration Management**
   - Created proper MQTT configuration file
   - Removed hardcoded credentials from main code
   - Added validation for configuration files

## 📋 Prerequisites

- Python 3.7+ (for QR code generation)
- Modern web browser with JavaScript enabled
- MQTT broker access (optional, demo mode available)
- Firebase project (optional, for data persistence)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tantoon94/Hotseat_Network.git
   cd Hotseat_Network
   ```

2. **Install Python dependencies**
   ```bash
   pip install qrcode pillow
   ```

3. **Configure MQTT (Optional)**
   - Copy `mqtt-config.example.json` to `mqtt-config.json`
   - Update with your MQTT broker credentials:
   ```json
   {
     "host": "your_mqtt_broker_host",
     "port": 1883,
     "username": "your_mqtt_username",
     "password": "your_mqtt_password",
     "clientId": "hotseat-dashboard",
     "protocol": "ws"
   }
   ```

4. **Configure Firebase (Optional)**
   - Update `firebase-config.js` with your Firebase project credentials
   - Ensure Firestore is enabled in your Firebase project

## 🚀 Usage

### Local Development

1. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Open in browser**
   ```
   http://localhost:8000
   ```

### Generate QR Codes

```bash
python generate_qr_codes.py
```

This will create QR codes for:
- Individual seat dashboards (Seat 1-5)
- Main dashboard
- Analytics dashboard
- AR dashboard

### GitHub Pages Deployment

The application is configured for GitHub Pages deployment at:
```
https://tantoon94.github.io/Hotseat_Network/
```

## 📊 Dashboard Features

### Main Dashboard
- Real-time seat occupancy display
- Live count updates
- Session duration tracking
- Person type detection
- Resistance monitoring

### AR Mode
- Point camera at seat QR codes
- View seat data in augmented reality
- Interactive 3D dashboard

### Analytics
- Historical data visualization
- Usage trends and patterns
- Heatmap of seat utilization
- Date range filtering

## 🔌 MQTT Topics

The system subscribes to these MQTT topics:
- `student/ucbqmie/sitting_events` - Session data
- `student/ucbqmie/seat_counts` - Count updates

## 🗄️ Database Structure

### Firestore Collections
- `seats` - Main seat data collection
- `seats_archive` - Archived historical data

### Data Fields
- `seat_id` - Seat identifier (1-5)
- `count` - Total occupancy count
- `session_duration_ms` - Session duration in milliseconds
- `average_resistance` - Average resistance reading
- `person_type` - Detected person type (Adult/Child)
- `session_history` - Array of past sessions
- `daily_counts` - Daily count tracking
- `hourly_usage` - Hourly utilization for heatmaps

## 🛡️ Security Considerations

- Firebase API keys are exposed in client-side code (not recommended for production)
- MQTT credentials are stored in configuration files
- Consider using environment variables for sensitive data in production

## 🐛 Troubleshooting

### MQTT Connection Issues
1. Check `mqtt-config.json` configuration
2. Verify broker accessibility
3. Check firewall settings
4. Application will fall back to demo mode automatically

### Firebase Issues
1. Verify Firebase project configuration
2. Check Firestore rules
3. Ensure billing is enabled (if required)
4. Application will work without Firebase (data won't persist)

### QR Code Generation Issues
1. Ensure Python dependencies are installed
2. Check write permissions for `qr_codes/` directory
3. Verify base URL configuration

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the console logs for error messages

## 🔄 Changelog

### Latest Updates
- Fixed MQTT connection stability issues
- Improved Firebase error handling
- Added resource loading error handlers
- Enhanced demo data management
- Created proper configuration files
- Added comprehensive error handling throughout the application
