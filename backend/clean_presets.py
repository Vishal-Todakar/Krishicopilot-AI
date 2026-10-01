import os
import sqlite3

db_paths = [
    os.path.join(os.getcwd(), 'krishicopilot.db'),
    os.path.join(os.getcwd(), 'backend', 'krishicopilot.db')
]

for path in db_paths:
    if os.path.exists(path):
        conn = sqlite3.connect(path)
        cur = conn.cursor()
        # Find demo user IDs
        cur.execute("SELECT id FROM users WHERE email = 'farmer@krishicopilot.in'")
        demo_ids = [row[0] for row in cur.fetchall()]
        for uid in demo_ids:
            cur.execute("DELETE FROM crop_scans WHERE user_id = ?", (uid,))
            cur.execute("DELETE FROM farms WHERE user_id = ?", (uid,))
            cur.execute("DELETE FROM users WHERE id = ?", (uid,))
            
        # Clean any remaining farm presets for all users so everything is blank until filled by user
        cur.execute("""
            UPDATE farms 
            SET farm_name = '', primary_crop = '', crop_stage = '', 
                soil_type = '', area_acres = 0.0, irrigation_method = '', 
                location = '', district = '', state = ''
        """)
        conn.commit()
        
        cur.execute("SELECT id, full_name, email FROM users")
        print(path, "remaining users:", cur.fetchall())
        cur.execute("SELECT id, user_id, farm_name, primary_crop, area_acres FROM farms")
        print(path, "remaining farms:", cur.fetchall())
        conn.close()
