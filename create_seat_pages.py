#!/usr/bin/env python3
"""
Script to create individual seat pages for the Hotseat Network dashboard.
This generates seat2.html through seat5.html based on the seat1.html template.
"""

import os

def create_seat_page(seat_number):
    """Create a seat page for the given seat number."""
    
    # Read the seat1.html template
    with open('seat1.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace all occurrences of "Seat 1" with the new seat number
    content = content.replace('Seat 1', f'Seat {seat_number}')
    content = content.replace('seat1', f'seat{seat_number}')
    content = content.replace('seat1-dashboard-', f'seat{seat_number}-dashboard-')
    content = content.replace('seat1-count', f'seat{seat_number}-count')
    content = content.replace('seat1-duration', f'seat{seat_number}-duration')
    content = content.replace('seat1-resistance', f'seat{seat_number}-resistance')
    content = content.replace('person-donut-chart', f'person-donut-chart-{seat_number}')
    content = content.replace('seat1-start', f'seat{seat_number}-start')
    content = content.replace('seat1-end', f'seat{seat_number}-end')
    content = content.replace('seat1-session-duration', f'seat{seat_number}-session-duration')
    content = content.replace('seat1-last-update', f'seat{seat_number}-last-update')
    
    # Update the seat-specific logic in JavaScript
    content = content.replace("if (seatId === '1')", f"if (seatId === '{seat_number}')")
    content = content.replace("if (seatId === 1)", f"if (seatId === {seat_number})")
    
    # Write the new file
    filename = f'seat{seat_number}.html'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Created {filename}")

def main():
    """Create pages for seats 2-5."""
    print("Creating individual seat pages...")
    
    for seat_num in range(2, 6):
        create_seat_page(seat_num)
    
    print("\n🎉 All seat pages created successfully!")
    print("\nAvailable pages:")
    print("- seat1.html (already existed)")
    for seat_num in range(2, 6):
        print(f"- seat{seat_num}.html")
    
    print("\nYou can now access individual seat dashboards at:")
    print("- http://localhost:8000/seat1.html")
    print("- http://localhost:8000/seat2.html")
    print("- http://localhost:8000/seat3.html")
    print("- http://localhost:8000/seat4.html")
    print("- http://localhost:8000/seat5.html")

if __name__ == "__main__":
    main() 