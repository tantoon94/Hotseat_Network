import qrcode
import json
import os
import sys

def main():
    # Configuration - Change this based on your setup
    # For local development
    # base_url = "http://localhost:8000/"

    # For production (GitHub Pages)
    base_url = "https://tantoon94.github.io/Hotseat_Network/"

    # Validate base URL
    if not base_url.startswith(('http://', 'https://')):
        print("❌ Error: Invalid base URL. Must start with http:// or https://")
        sys.exit(1)

    # Create QR codes directory if it doesn't exist
    qr_dir = "qr_codes"
    try:
        if not os.path.exists(qr_dir):
            os.makedirs(qr_dir)
            print(f"✅ Created directory: {qr_dir}")
    except OSError as e:
        print(f"❌ Error creating directory {qr_dir}: {e}")
        sys.exit(1)

    def generate_qr_code(url, filename, description):
        """Generate a QR code for the given URL"""
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(url)
            qr.make(fit=True)
            
            # Create QR code image
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            # Save the QR code
            filepath = os.path.join(qr_dir, filename)
            qr_image.save(filepath)
            print(f"✅ Generated QR code for {description}: {filepath}")
            return filepath
        except Exception as e:
            print(f"❌ Error generating QR code for {description}: {e}")
            return None

    # Generate QR codes for each seat
    print("🎯 Generating QR codes for Hotseat Network...")
    print(f"Base URL: {base_url}")
    print("-" * 50)

    generated_files = []

    for seat_id in range(1, 6):
        # Create seat-specific URL for individual seat page
        seat_url = f"{base_url}seat{seat_id}.html"
        filename = f"seat_{seat_id}_qr.png"
        result = generate_qr_code(seat_url, filename, f"Seat {seat_id}")
        if result:
            generated_files.append(result)

    # Generate main dashboard QR code
    main_url = base_url
    result = generate_qr_code(main_url, "main_dashboard_qr.png", "Main Dashboard")
    if result:
        generated_files.append(result)

    # Generate analytics dashboard QR code
    analytics_url = f"{base_url}analytics.html"
    result = generate_qr_code(analytics_url, "analytics_qr.png", "Analytics Dashboard")
    if result:
        generated_files.append(result)

    # Generate AR dashboard QR code (if you have one)
    ar_url = f"{base_url}?ar=true"
    result = generate_qr_code(ar_url, "ar_dashboard_qr.png", "AR Dashboard")
    if result:
        generated_files.append(result)

    print("\n" + "=" * 50)
    print("📱 QR Code URLs Generated:")
    print("=" * 50)
    for seat_id in range(1, 6):
        print(f"Seat {seat_id}: {base_url}seat{seat_id}.html")
    print(f"Main Dashboard: {base_url}")
    print(f"Analytics: {base_url}analytics.html")
    print(f"AR Dashboard: {base_url}?ar=true")

    print(f"\n📁 All QR codes saved in: {qr_dir}/")
    print(f"✅ Successfully generated {len(generated_files)} QR codes")
    
    if len(generated_files) < 8:  # Expected number of files
        print("⚠️ Warning: Some QR codes may not have been generated successfully")
    
    print("\n🎉 QR code generation complete!")
    print("\n💡 Usage Instructions:")
    print("1. Print these QR codes and place them near each seat")
    print("2. Users can scan to access individual seat dashboards")
    print("3. The main dashboard QR code can be placed at the entrance")
    print("4. Analytics QR code for administrators")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️ QR code generation interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1) 