#!/usr/bin/env python3
"""
Generate DXF file for laser cutting seat QR code plates
Creates a DXF with all 5 seat QR codes arranged for 5x5cm laser cut plates
"""

import ezdxf
from ezdxf.enums import TextEntityAlignment
import os
from PIL import Image
import numpy as np

def create_laser_cut_dxf():
    """Create DXF with QR codes arranged for laser cutting"""
    
    # Create a new DXF document
    doc = ezdxf.new('R2010')  # AutoCAD 2010 format
    msp = doc.modelspace()
    
    # Page dimensions (A4 in mm)
    page_width_mm = 210
    page_height_mm = 297
    
    # Plate dimensions (5cm = 50mm)
    plate_size_mm = 50
    
    # Margins and spacing
    margin_mm = 10
    spacing_mm = 10
    
    # Calculate how many plates can fit per row
    available_width = page_width_mm - (2 * margin_mm)
    plates_per_row = int(available_width // (plate_size_mm + spacing_mm))
    
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
        
        x_mm = margin_mm + col * (plate_size_mm + spacing_mm)
        y_mm = page_height_mm - margin_mm - (row + 1) * (plate_size_mm + spacing_mm)
        
        # Draw plate border (for laser cutting)
        points = [
            (x_mm, y_mm),
            (x_mm + plate_size_mm, y_mm),
            (x_mm + plate_size_mm, y_mm + plate_size_mm),
            (x_mm, y_mm + plate_size_mm),
            (x_mm, y_mm)
        ]
        msp.add_lwpolyline(points, close=True)
        
        # Add QR code area indicator (rectangle)
        qr_margin_mm = 7  # More margin for text
        qr_size_mm = plate_size_mm - (2 * qr_margin_mm) - 10  # leave space for text above
        qr_x = x_mm + (plate_size_mm - qr_size_mm) / 2
        qr_y = y_mm + 10  # leave space for text above
        qr_points = [
            (qr_x, qr_y),
            (qr_x + qr_size_mm, qr_y),
            (qr_x + qr_size_mm, qr_y + qr_size_mm),
            (qr_x, qr_y + qr_size_mm),
            (qr_x, qr_y)
        ]
        qr_polyline = msp.add_lwpolyline(qr_points, close=True)
        qr_polyline.dxf.const_width = 0.5
        qr_text = msp.add_text("QR CODE AREA", dxfattribs={
            'height': 3.0,
            'style': 'Standard'
        })
        qr_text.dxf.insert = (qr_x + qr_size_mm/2, qr_y + qr_size_mm/2)
        qr_text.dxf.halign = 1
        
        # Add seat title (large, bold, centered, inside plate, above QR)
        title_text = f"SEAT {seat_num}"
        # Use a text height that aligns well with QR code (about 1/4 of QR code height)
        target_height = qr_size_mm * 0.25  # 25% of QR code height
        max_height = target_height
        min_height = 5.0
        for h in np.arange(max_height, min_height-0.1, -0.5):
            temp = msp.add_text(title_text, dxfattribs={
                'height': h,
                'style': 'Standard'
            })
            temp.dxf.insert = (x_mm + plate_size_mm/2, y_mm + plate_size_mm - 5)  # 5mm from top
            temp.dxf.halign = 1
            # Check if text fits
            # (approximate width: 0.6 * height * len(title_text))
            if 0.6 * h * len(title_text) < plate_size_mm - 6:
                break
            msp.delete_entity(temp)
        # The last temp is the one that fits
    
    # Add page title
    title_text = "SEAT QR CODES - LASER CUT PLATES"
    title = msp.add_text(title_text, dxfattribs={
        'height': 5.0,
        'style': 'Standard'
    })
    title.dxf.insert = (page_width_mm/2, page_height_mm - 15)
    title.dxf.halign = 1  # Center alignment
    
    # Add specifications
    specs_text = f"Plate Size: {plate_size_mm}mm x {plate_size_mm}mm | Material: Acrylic/Wood | Cut along black borders"
    specs = msp.add_text(specs_text, dxfattribs={
        'height': 2.5,
        'style': 'Standard'
    })
    specs.dxf.insert = (page_width_mm/2, 15)
    specs.dxf.halign = 1  # Center alignment
    
    # Save DXF
    dxf_path = "seat_qr_codes_laser_cut.dxf"
    doc.saveas(dxf_path)
    print(f"DXF created: {dxf_path}")
    print(f"Plate size: {plate_size_mm}mm x {plate_size_mm}mm")
    print(f"Arrangement: {plates_per_row} plates per row")
    print("Note: QR codes are indicated as areas - you'll need to add the actual QR code images separately")
    print("Ready for laser cutting!")

if __name__ == "__main__":
    create_laser_cut_dxf() 