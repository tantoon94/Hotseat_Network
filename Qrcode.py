import qrcode

url = "https://tantoon94.github.io/Hotseat_Network/"
qr = qrcode.make(url)
qr.save("unity_dashboard_qr.png")