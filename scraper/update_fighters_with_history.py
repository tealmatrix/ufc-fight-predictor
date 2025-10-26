import requests
from bs4 import BeautifulSoup
import json
import time
import re
from datetime import datetime

def scrape_fight_history(soup):
    """Extract last 3 fights from fighter page"""
    fights = []
    
    try:
        # Find the fight history table
        fight_table = soup.find('table', class_='b-fight-details__table')
        
        if fight_table:
            rows = fight_table.find_all('tr', class_='b-fight-details__table-row')[1:]  # Skip header
            
            # Get last 3 fights (or fewer if they don't have 3)
            for row in rows[:3]:
                cols = row.find_all('td')
                
                if len(cols) >= 2:
                    fight_data = {}
                    
                    # Result (W/L/D/NC)
                    result_col = cols[0]
                    result_text = result_col.text.strip()
                    if result_text:
                        fight_data['result'] = result_text
                    
                    # Opponent name
                    opponent_col = cols[1]
                    opponent_link = opponent_col.find('a')
                    if opponent_link:
                        fight_data['opponent'] = opponent_link.text.strip()
                    
                    # Method (KO/TKO, SUB, DEC, etc)
                    if len(cols) >= 7:
                        method_col = cols[6]
                        method_text = method_col.text.strip()
                        # Parse method and round
                        method_parts = method_text.split()
                        if method_parts:
                            fight_data['method'] = method_parts[0]
                        
                        # Round
                        if len(cols) >= 8:
                            round_col = cols[7]
                            round_text = round_col.text.strip()
                            if round_text:
                                fight_data['round'] = round_text
                    
                    if fight_data:
                        fights.append(fight_data)
    
    except Exception as e:
        print(f"Error scraping fight history: {e}")
    
    return fights

def calculate_age(dob_string):
    """Calculate age from DOB string like 'Jan 22, 1993'"""
    if not dob_string or dob_string == "--":
        return None
    
    try:
        # Parse the date
        dob = datetime.strptime(dob_string, "%b %d, %Y")
        today = datetime.now()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return age
    except:
        return None

def update_fighter_with_history(fighter_name, headers):
    """Search for a fighter and get their fight history"""
    base_url = "http://ufcstats.com/statistics/fighters"
    letters = 'abcdefghijklmnopqrstuvwxyz'
    
    # Search for the fighter
    for letter in letters:
        url = f"{base_url}?char={letter}&page=all"
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        table = soup.find('table', class_='b-statistics__table')
        if table:
            rows = table.find_all('tr', class_='b-statistics__table-row')[1:]
            
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 2:
                    name_link = cols[0].find('a')
                    if name_link:
                        name = name_link.text.strip()
                        # Case-insensitive match
                        if name.lower() == fighter_name.lower():
                            # Found the fighter, now get their fight history
                            fighter_url = name_link['href']
                            response = requests.get(fighter_url, headers=headers)
                            fighter_soup = BeautifulSoup(response.content, 'html.parser')
                            return scrape_fight_history(fighter_soup)
        
        time.sleep(0.3)
    
    return []

def main():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    # Load existing data
    with open('../public/fighters_data.json', 'r', encoding='utf-8') as f:
        fighters = json.load(f)
    
    print(f"Loaded {len(fighters)} fighters")
    print("Updating fighters with fight history...")
    
    updated_count = 0
    for i, fighter in enumerate(fighters, 1):
        fighter_name = fighter.get('name', '')
        
        # Calculate age if DOB exists and age is missing
        if 'dob' in fighter and fighter['dob'] != "--":
            if 'age' not in fighter or not fighter.get('age'):
                age = calculate_age(fighter['dob'])
                if age:
                    fighter['age'] = age
        
        # Skip if already has fight history
        if 'last_3_fights' in fighter and len(fighter['last_3_fights']) > 0:
            print(f"[{i}/{len(fighters)}] {fighter_name} - already has fight history, skipping")
            continue
        
        print(f"[{i}/{len(fighters)}] Updating {fighter_name}...")
        
        try:
            fight_history = update_fighter_with_history(fighter_name, headers)
            fighter['last_3_fights'] = fight_history
            
            if fight_history:
                updated_count += 1
                print(f"  ✓ Added {len(fight_history)} fights")
            else:
                print(f"  - No fights found")
            
            time.sleep(1)  # Be respectful to the server
            
        except Exception as e:
            print(f"  ✗ Error: {e}")
            fighter['last_3_fights'] = []
    
    # Save updated data
    with open('../public/fighters_data.json', 'w', encoding='utf-8') as f:
        json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
    
    # Copy to dist folder
    with open('../dist/fighters_data.json', 'w', encoding='utf-8') as f:
        json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
    
    print(f"\n✅ Done! Updated {updated_count} fighters with fight history")
    print(f"Total fighters: {len(fighters)}")

if __name__ == "__main__":
    main()
