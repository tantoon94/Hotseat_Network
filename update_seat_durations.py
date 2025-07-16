#!/usr/bin/env python3
"""
Update all seat pages to use HH:MM:SS duration format
"""

import re

def update_seat_file(filename):
    """Update a seat file with the new duration format"""
    print(f"Updating {filename}...")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the duration calculation
    old_pattern = r'const sessionDurationMinutes = Math\.round\(data\.session_duration_ms / 60000\);'
    new_pattern = '''// Calculate session duration in HH:MM:SS format
                const sessionDurationMs = data.session_duration_ms || 0;
                const hours = Math.floor(sessionDurationMs / 3600000);
                const minutes = Math.floor((sessionDurationMs % 3600000) / 60000);
                const seconds = Math.floor((sessionDurationMs % 60000) / 1000);
                const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;'''
    
    content = re.sub(old_pattern, new_pattern, content)
    
    # Replace duration display
    content = re.sub(r'document\.getElementById\(`seat\d+-duration`\)\.textContent = sessionDurationMinutes;',
                    r'document.getElementById(`seat\d+-duration`).textContent = formattedDuration;', content)
    
    # Replace session duration display
    content = re.sub(r'document\.getElementById\(`seat\d+-session-duration`\)\.textContent = `\${sessionDurationMinutes} min`;',
                    r'document.getElementById(`seat\d+-session-duration`).textContent = formattedDuration;', content)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {filename}")

def main():
    """Update all seat files"""
    seat_files = ['seat2.html', 'seat3.html', 'seat4.html', 'seat5.html']
    
    for filename in seat_files:
        try:
            update_seat_file(filename)
        except FileNotFoundError:
            print(f"⚠️ File {filename} not found, skipping...")
        except Exception as e:
            print(f"❌ Error updating {filename}: {e}")

if __name__ == "__main__":
    main() 