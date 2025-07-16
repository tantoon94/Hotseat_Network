# GitHub Pages Deployment Guide for Hotseat Network

## 🚀 Deploying to GitHub Pages

### Step 1: Prepare Your Repository

1. **Ensure all files are committed to your repository:**
   ```bash
   git add .
   git commit -m "Prepare for GitHub Pages deployment"
   git push origin main
   ```

2. **Verify your repository structure:**
   ```
   Hotseat_Network-1/
   ├── index.HTML          # Main dashboard (will be served as index.html)
   ├── seat1.html          # Individual seat pages
   ├── seat2.html
   ├── seat3.html
   ├── seat4.html
   ├── seat5.html
   ├── analytics.html      # Analytics dashboard
   ├── firebase-config.js  # Firebase configuration
   ├── mqtt-config.json    # MQTT configuration
   ├── generate_qr_codes.py # QR code generator
   ├── create_seat_pages.py # Seat page generator
   ├── qr_codes/           # Generated QR codes
   ├── Img/                # Images directory
   └── README.md
   ```

### Step 2: Enable GitHub Pages

1. **Go to your repository on GitHub**
2. **Click on "Settings" tab**
3. **Scroll down to "Pages" section**
4. **Under "Source", select "Deploy from a branch"**
5. **Choose "main" branch**
6. **Select "/ (root)" folder**
7. **Click "Save"**

### Step 3: Configure Firebase for Production

1. **Update Firebase configuration for production:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings > General
   - Add your GitHub Pages domain to authorized domains:
     ```
     tantoon94.github.io
     ```

2. **Update security rules in Firestore:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read/write access from GitHub Pages domain
       match /{document=**} {
         allow read, write: if request.auth == null && 
           (request.origin.matches('https://tantoon94.github.io') || 
            request.origin.matches('http://localhost:8000'));
       }
     }
   }
   ```

### Step 4: Generate QR Codes for Production

Run the QR code generator to create production-ready QR codes:

```bash
python generate_qr_codes.py
```

This will create QR codes pointing to your GitHub Pages URLs:
- `https://tantoon94.github.io/Hotseat_Network/` (Main Dashboard)
- `https://tantoon94.github.io/Hotseat_Network/seat1.html` (Seat 1)
- `https://tantoon94.github.io/Hotseat_Network/seat2.html` (Seat 2)
- etc.

### Step 5: Test Your Deployment

1. **Wait for GitHub Pages to deploy** (usually 2-5 minutes)
2. **Visit your live site:** `https://tantoon94.github.io/Hotseat_Network/`
3. **Test all pages:**
   - Main dashboard
   - Individual seat pages
   - Analytics dashboard
   - AR functionality

### Step 6: Update MQTT Configuration

Ensure your `mqtt-config.json` is properly configured for production:

```json
{
  "host": "mqtt.cetools.org",
  "port": 8090,
  "username": "student",
  "password": "ce2021-mqtt-forget-whale"
}
```

## 📱 Live URLs After Deployment

Once deployed, your project will be accessible at:

- **Main Dashboard:** `https://tantoon94.github.io/Hotseat_Network/`
- **Seat 1:** `https://tantoon94.github.io/Hotseat_Network/seat1.html`
- **Seat 2:** `https://tantoon94.github.io/Hotseat_Network/seat2.html`
- **Seat 3:** `https://tantoon94.github.io/Hotseat_Network/seat3.html`
- **Seat 4:** `https://tantoon94.github.io/Hotseat_Network/seat4.html`
- **Seat 5:** `https://tantoon94.github.io/Hotseat_Network/seat5.html`
- **Analytics:** `https://tantoon94.github.io/Hotseat_Network/analytics.html`

## 🔧 Troubleshooting

### Common Issues:

1. **404 Errors:**
   - Ensure all HTML files are in the root directory
   - Check that file names match exactly (case-sensitive)
   - Verify GitHub Pages is enabled for the main branch

2. **Firebase Connection Issues:**
   - Add your GitHub Pages domain to Firebase authorized domains
   - Check browser console for CORS errors
   - Verify Firebase configuration is correct

3. **MQTT Connection Issues:**
   - Ensure MQTT broker allows connections from GitHub Pages
   - Check that credentials are correct
   - Verify WebSocket connections are enabled

4. **Images Not Loading:**
   - Ensure image paths are relative
   - Check that image files are committed to the repository
   - Verify image file names match exactly

### Performance Optimization:

1. **Enable GitHub Pages caching:**
   - Add cache headers to your HTML files
   - Use CDN for external libraries

2. **Optimize images:**
   - Compress images before committing
   - Use appropriate image formats (WebP, PNG, JPG)

3. **Minimize external dependencies:**
   - Consider hosting external libraries locally
   - Use CDN fallbacks for reliability

## 🎯 QR Code Deployment

After generating QR codes, you can:

1. **Print QR codes** and place them near each seat
2. **Share QR codes** with users for easy access
3. **Embed QR codes** in documentation or signage

## 📊 Monitoring

1. **Check GitHub Pages status** in repository Settings > Pages
2. **Monitor Firebase usage** in Firebase Console
3. **Check MQTT connection** in browser console
4. **Test QR codes** with different devices

## 🔄 Continuous Deployment

For automatic deployments:

1. **Set up GitHub Actions** (optional)
2. **Configure automatic deployment** on push to main branch
3. **Set up monitoring** for deployment status

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all files are properly committed
3. Ensure GitHub Pages is enabled
4. Test locally before deploying
5. Check Firebase and MQTT configurations

Your Hotseat Network project will be live and accessible worldwide once deployed! 🌍 