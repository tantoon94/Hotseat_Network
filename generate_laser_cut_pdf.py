#!/usr/bin/env python3
"""
Generate PDF for laser cutting seat QR code plates
Creates a PDF with all 5 seat QR codes arranged for 5x5cm laser cut plates
"""

import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image
import math

def create_laser_cut_pdf():
    """Create PDF with QR codes arranged for laser cutting"""
    
    # A4 page dimensions in cm
    page_width_cm, page_height_cm = 21.0, 29.7
    
    # Plate dimensions
    plate_size_cm = 5.0
    
    # Margins and spacing
    margin_cm = 1.0
    spacing_cm = 1.0
    
    # Calculate how many plates can fit per row
    available_width = page_width_cm - (2 * margin_cm)
    plates_per_row = int(available_width // (plate_size_cm + spacing_cm))
    
    # Calculate how many rows needed
    num_seats = 5
    num_rows = math.ceil(num_seats / plates_per_row)
    
    # Calculate total height needed
    total_height_needed = num_rows * (plate_size_cm + spacing_cm) + margin_cm
    
    # Create PDF
    pdf_path = "seat_qr_codes_laser_cut.pdf"
    c = canvas.Canvas(pdf_path, pagesize=A4)
    
    # Set up font (using default if custom font not available)
    try:
        # Try to use a bold font if available
        pdfmetrics.registerFont(TTFont('Bold', 'arial.ttf'))
        font_name = 'Bold'
        font_size = 12
    except:
        font_name = 'Helvetica-Bold'
        font_size = 12
    
    # QR code directory
    qr_dir = "qr_codes"
    
    # Process each seat
    for seat_num in range(1, 6):
        qr_filename = f"seat_{seat_num}_qr.png"
        qr_path = os.path.join(qr_dir, qr_filename)
        
        if not os.path.exists(qr_path):
            print(f"Warning: QR code file {qr_path} not found")
            continue
        
        # Calculate position
        row = (seat_num - 1) // plates_per_row
        col = (seat_num - 1) % plates_per_row
        
        x_cm = margin_cm + col * (plate_size_cm + spacing_cm)
        y_cm = page_height_cm - margin_cm - (row + 1) * (plate_size_cm + spacing_cm)
        
        # Convert to points (1 cm = 28.35 points)
        x_pt = x_cm * 28.35
        y_pt = y_cm * 28.35
        size_pt = plate_size_cm * 28.35
        
        # Draw plate border (for laser cutting reference)
        c.setStrokeColor(colors.black)
        c.setLineWidth(0.5)
        c.rect(x_pt, y_pt, size_pt, size_pt, stroke=1, fill=0)
        
        # Add QR code image
        try:
            # Open and resize QR code image
            img = Image.open(qr_path)
            
            # Calculate QR code size (leave some margin within the plate)
            qr_margin_cm = 0.7  # More margin for text
            qr_size_cm = plate_size_cm - (2 * qr_margin_cm) - 1.2  # leave space for text above
            qr_size_pt = qr_size_cm * 28.35
            
            # Calculate QR code position (centered horizontally, lower vertically)
            qr_x = x_pt + (size_pt - qr_size_pt) / 2
            qr_y = y_pt + 28.35*1.2  # leave space for text above
            
            # Resize image to fit
            img_resized = img.resize((int(qr_size_pt), int(qr_size_pt)), Image.Resampling.LANCZOS)
            
            # Save temporary resized image
            temp_path = f"temp_qr_{seat_num}.png"
            img_resized.save(temp_path)
            
            # Add to PDF
            c.drawImage(temp_path, qr_x, qr_y, qr_size_pt, qr_size_pt)
            
            # Clean up temporary file
            os.remove(temp_path)
            
        except Exception as e:
            print(f"Error processing QR code for seat {seat_num}: {e}")
            # Draw placeholder text
            c.setFont('Helvetica', 8)
            c.setFillColor(colors.red)
            c.drawString(x_pt + 5, y_pt + size_pt/2, f"QR Code Error\nSeat {seat_num}")
        
        # Add seat title (large, bold, centered, inside plate, above QR)
        title_text = f"SEAT {seat_num}"
        # Use a font size that aligns well with QR code (about 1/4 of QR code height)
        qr_height_pt = qr_size_pt if 'qr_size_pt' in locals() else size_pt * 0.6
        target_font_size = qr_height_pt * 0.25  # 25% of QR code height
        max_font_size = int(target_font_size)
        min_font_size = 12
        font_name = 'Helvetica-Bold'
        c.setFillColor(colors.black)
        for fs in range(max_font_size, min_font_size-1, -1):
            c.setFont(font_name, fs)
            title_width = c.stringWidth(title_text, font_name, fs)
            if title_width < size_pt - 10:
                break
        # Place the text centered horizontally, at the top of the plate
        title_x = x_pt + (size_pt - title_width) / 2
        title_y = y_pt + size_pt - 15  # 15pt from top
        c.drawString(title_x, title_y, title_text)
    
    # Add page title
    c.setFont('Helvetica-Bold', 16)
    c.setFillColor(colors.black)
    page_title = "SEAT QR CODES - LASER CUT PLATES"
    title_width = c.stringWidth(page_title, 'Helvetica-Bold', 16)
    c.drawString((A4[0] - title_width) / 2, A4[1] - 30, page_title)
    
    # Add specifications
    c.setFont('Helvetica', 10)
    c.setFillColor(colors.gray)
    specs_text = f"Plate Size: {plate_size_cm}cm x {plate_size_cm}cm | Material: Acrylic/Wood | Cut along black borders"
    specs_width = c.stringWidth(specs_text, 'Helvetica', 10)
    c.drawString((A4[0] - specs_width) / 2, 30, specs_text)
    
    # Save PDF
    c.save()
    print(f"PDF created: {pdf_path}")
    print(f"Plate size: {plate_size_cm}cm x {plate_size_cm}cm")
    print(f"Arrangement: {plates_per_row} plates per row, {num_rows} rows")
    print("Ready for laser cutting!")

if __name__ == "__main__":
    create_laser_cut_pdf() 