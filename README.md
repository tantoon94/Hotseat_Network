# Hotseat Network - Real-Time Seat Analytics Dashboard

A comprehensive real-time dashboard for monitoring seat utilization with AR (Augmented Reality) capabilities, Firebase integration, and advanced analytics. This system provides live data visualization, historical analytics, and individual seat monitoring through QR code scanning.

## 🌟 Features

- **Real-time MQTT Integration**: Live data updates from seat sensors
- **Firebase Firestore Database**: Persistent data storage and analytics
- **AR Mode**: Scan QR codes to view seat-specific dashboards in augmented reality
- **Interactive Charts**: Visual analytics with live-updating charts
- **Heatmap Visualization**: Daily seat usage patterns
- **Individual Seat Pages**: Detailed statistics for each seat
- **Analytics Dashboard**: Historical data analysis and trends
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## 🚀 Live Demo

**Main Dashboard:** [https://tantoon94.github.io/Hotseat_Network/](https://tantoon94.github.io/Hotseat_Network/)

**Individual Seats:**
- [Seat 1](https://tantoon94.github.io/Hotseat_Network/seat1.html)
- [Seat 2](https://tantoon94.github.io/Hotseat_Network/seat2.html)
- [Seat 3](https://tantoon94.github.io/Hotseat_Network/seat3.html)
- [Seat 4](https://tantoon94.github.io/Hotseat_Network/seat4.html)
- [Seat 5](https://tantoon94.github.io/Hotseat_Network/seat5.html)

**Analytics:** [https://tantoon94.github.io/Hotseat_Network/analytics.html](https://tantoon94.github.io/Hotseat_Network/analytics.html)

## 📊 Dashboard Features

### Main Dashboard
- Real-time seat utilization overview
- Live count comparison across all seats
- Quick access to individual seat details
- AR mode activation
- Analytics dashboard link

### Individual Seat Pages
- Detailed statistics for each seat
- Person type distribution (donut chart)
- Session duration and resistance data
- Daily usage heatmap
- Comparison with other seats

### Analytics Dashboard
- Historical data analysis
- Date range selection
- Multiple chart types (line, bar, doughnut)
- Summary statistics
- Trend analysis

## 🛠️ Setup Instructions

### 1. Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore database
3. Update `firebase-config.js` with your Firebase credentials
4. Add your domain to Firebase authorized domains

### 2. MQTT Configuration

Edit the `mqtt-config.json` file with your MQTT broker credentials:

```json
{
  "host": "mqtt.cetools.org",
  "port": 8090,
  "username": "student",
  "password": "ce2021-mqtt-forget-whale"
}
```

### 3. Generate QR Codes

Run the QR code generator to create seat-specific QR codes:

```bash
python generate_qr_codes.py
```

This will create QR codes in the `qr_codes/` directory:
- `seat_1_qr.png` through `seat_5_qr.png` for individual seats
- `main_dashboard_qr.png` for the main dashboard
- `analytics_qr.png` for the analytics dashboard

### 4. MQTT Data Format

Your MQTT broker should publish data in the following JSON format:

**Topic:** `student/ucbqmie/sitting_events`
```json
{
  "seat_id": 1,
  "count": 5,
  "session_duration_ms": 1800000,
  "session_start_datetime": "2024-01-15T10:30:00Z",
  "session_end_datetime": "2024-01-15T11:00:00Z",
  "average_resistance": 16.39,
  "person_type": "Adult"
}
```

**Topic:** `student/ucbqmie/seat_counts`
```json
{
  "seat_id": 1,
  "count": 5
}
```

## 📱 Usage

### Main Dashboard
1. Open the main dashboard URL
2. View real-time data for all 5 seats
3. Click on any seat card to view detailed statistics
4. Click the Analytics card to view historical data

### AR Mode
1. Click "Enable AR Mode" to activate AR features
2. Point your camera at a seat-specific QR code
3. The AR dashboard will appear showing that seat's data
4. Click the "X" button to close the AR dashboard

### QR Code Scanning
- **Seat QR Codes**: Scan to view individual seat data
- **Main Dashboard QR**: Scan to open the full dashboard
- **Analytics QR**: Scan to access historical analytics

## 📁 File Structure

```
Hotseat_Network-1/
├── index.HTML                    # Main dashboard application
├── seat1.html - seat5.html       # Individual seat pages
├── analytics.html                # Analytics dashboard
├── firebase-config.js            # Firebase configuration
├── mqtt-config.json              # MQTT broker configuration
├── mqtt-config.example.json      # Example MQTT config template
├── generate_qr_codes.py          # QR code generator script
├── create_seat_pages.py          # Seat page generator
├── qr_codes/                     # Generated QR codes
├── Img/                          # Images directory
│   ├── IMG_2532.JPG             # Background image
│   └── Unity_AR_Architecture.png # AR architecture diagram
├── .github/workflows/            # GitHub Actions deployment
├── GITHUB_PAGES_DEPLOYMENT.md    # Deployment guide
├── FIREBASE_SETUP.md             # Firebase setup guide
├── FIRESTORE_DATA_STRUCTURE.md   # Database structure documentation
├── DATA_FLOW_DIAGRAM.md          # Data flow documentation
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## 🗄️ Database Structure

The Firebase Firestore database contains:

- **`sessions`**: Individual session data with timestamps
- **`seat_stats`**: Current statistics for each seat
- **`daily_usage`**: Heatmap data for each day
- **`person_types`**: Daily person type counts

## 🌐 Deployment

### GitHub Pages Deployment

This project is automatically deployed to GitHub Pages. See [GITHUB_PAGES_DEPLOYMENT.md](GITHUB_PAGES_DEPLOYMENT.md) for detailed instructions.

**Quick Deployment:**
1. Push your code to the main branch
2. Enable GitHub Pages in repository settings
3. Configure Firebase for production
4. Generate production QR codes

### Local Development

```bash
# Start local server
python -m http.server 8000

# Generate QR codes for local development
python generate_qr_codes.py
```

## 🔧 Troubleshooting

### MQTT Connection Issues
1. Check your `mqtt-config.json` credentials
2. Ensure your MQTT broker is running and accessible
3. Verify network connectivity

### Firebase Connection Issues
1. Check Firebase configuration in `firebase-config.js`
2. Ensure your domain is added to Firebase authorized domains
3. Verify Firestore security rules

### AR Mode Not Working
1. Ensure you're using HTTPS (required for camera access)
2. Allow camera permissions when prompted
3. Use a compatible browser (Chrome recommended)

### QR Codes Not Scanning
1. Ensure QR codes are printed clearly
2. Check that the URLs in QR codes are correct
3. Verify the base URL in `generate_qr_codes.py`

## 🛡️ Security

- Firebase security rules are configured for public read/write access
- MQTT credentials are stored in configuration files
- HTTPS is required for AR features
- All external dependencies use CDN with integrity checks

## 📈 Performance

- Real-time data updates via MQTT
- Efficient Firebase queries with indexing
- Optimized chart rendering with Chart.js
- Responsive design for all device sizes
- CDN-hosted dependencies for fast loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the deployment guides
3. Check browser console for errors
4. Verify all configurations are correct

---

**Built with ❤️ for real-time seat analytics and monitoring**
