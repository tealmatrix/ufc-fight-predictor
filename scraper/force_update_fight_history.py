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
        print(f"  Error scraping fight history: {e}")
    
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

def get_fighter_url_from_list(fighter_name, headers):
    """Search for a fighter and return their URL"""
    base_url = "http://ufcstats.com/statistics/fighters"
    
    # Get first letter of last name
    name_parts = fighter_name.strip().split()
    if len(name_parts) < 2:
        first_letter = fighter_name[0].lower()
    else:
        first_letter = name_parts[-1][0].lower()
    
    url = f"{base_url}?char={first_letter}&page=all"
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
                    # Column 0 has first name, column 1 has last name
                    first_name = name_link.text.strip()
                    last_name = cols[1].text.strip()
                    full_name = f"{first_name} {last_name}"
                    
                    # Case-insensitive match
                    if full_name.lower() == fighter_name.lower():
                        return name_link['href']
    
    return None

def update_fighter_with_history(fighter_name, headers):
    """Get fight history for a fighter"""
    fighter_url = get_fighter_url_from_list(fighter_name, headers)
    
    if fighter_url:
        response = requests.get(fighter_url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        return scrape_fight_history(soup)
    
    return []

def main():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    # Load existing data
    with open('../public/fighters_data.json', 'r', encoding='utf-8') as f:
        fighters = json.load(f)
    
    print(f"Loaded {len(fighters)} fighters")
    print("Updating all fighters with fight history...\n")
    
    updated_count = 0
    fighters_with_history = 0
    
    for i, fighter in enumerate(fighters, 1):
        fighter_name = fighter.get('name', '')
        
        if not fighter_name:
            print(f"[{i}/{len(fighters)}] Skipping empty entry")
            fighter['last_3_fights'] = []
            continue
        
        # Calculate age if DOB exists
        if 'dob' in fighter and fighter['dob'] != "--":
            if 'age' not in fighter or not fighter.get('age'):
                age = calculate_age(fighter['dob'])
                if age:
                    fighter['age'] = age
        
        print(f"[{i}/{len(fighters)}] Updating {fighter_name}...", end=" ")
        
        try:
            fight_history = update_fighter_with_history(fighter_name, headers)
            fighter['last_3_fights'] = fight_history
            
            if fight_history:
                fighters_with_history += 1
                print(f"✓ Added {len(fight_history)} fights")
            else:
                print(f"- No fights found")
            
            updated_count += 1
            time.sleep(1)  # Be respectful to the server
            
        except Exception as e:
            print(f"✗ Error: {e}")
            fighter['last_3_fights'] = []
    
    # Save updated data
    with open('../public/fighters_data.json', 'w', encoding='utf-8') as f:
        json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
    
    with open('../public/fighters_data_new.json', 'w', encoding='utf-8') as f:
        json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
    
    # Copy to dist folder
    with open('../dist/fighters_data.json', 'w', encoding='utf-8') as f:
        json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
    
    with open('../dist/fighters_data_new.json', 'w', encoding='utf-8') as f:
        json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
    
    print(f"\n✅ Done!")
    print(f"   Processed: {updated_count} fighters")
    print(f"   With fight history: {fighters_with_history} fighters")
    print(f"   Total fighters: {len(fighters)}")

if __name__ == "__main__":
    main()
