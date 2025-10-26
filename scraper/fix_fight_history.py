import requests
from bs4 import BeautifulSoup
import json
import time
import re
from datetime import datetime

def scrape_fight_history(soup, fighter_name):
    """Extract last 3 fights from fighter page with correct opponent names"""
    fights = []
    
    try:
        # Look for all table rows in the fight history section
        tbody = soup.find('tbody', class_='b-fight-details__table-body')
        
        if tbody:
            rows = tbody.find_all('tr', class_='b-fight-details__table-row')[:3]
            
            for row in rows:
                cols = row.find_all('td', class_='b-fight-details__table-col')
                
                if len(cols) >= 2:
                    fight_data = {}
                    
                    # Result (W/L/D/NC) - first column
                    result_text = cols[0].text.strip().lower()
                    if result_text in ['win', 'loss', 'draw', 'nc', 'u-dec', 's-dec']:
                        if result_text in ['u-dec', 's-dec']:
                            fight_data['result'] = 'loss'
                        else:
                            fight_data['result'] = result_text
                    
                    # Opponent - second column contains both fighters
                    # Need to find which one is NOT the current fighter
                    opponent_col = cols[1]
                    fighter_links = opponent_col.find_all('a', class_='b-link')
                    
                    for link in fighter_links:
                        name = link.text.strip()
                        # Get the full name by cleaning whitespace
                        name = ' '.join(name.split())
                        
                        # If this name is different from our fighter, it's the opponent
                        if name.lower() != fighter_name.lower():
                            fight_data['opponent'] = name
                            break
                    
                    # If we still don't have opponent, try alternative method
                    if 'opponent' not in fight_data:
                        # Get all text and try to extract both names
                        all_text = opponent_col.get_text(separator='|', strip=True)
                        names = [n.strip() for n in all_text.split('|') if n.strip() and len(n.strip()) > 3]
                        for name in names:
                            if name.lower() != fighter_name.lower() and not name.startswith('def.'):
                                fight_data['opponent'] = name
                                break
                    
                    # Method and Round - look for the result column
                    for i, col in enumerate(cols):
                        col_text = col.text.strip()
                        
                        # Look for method keywords
                        if any(keyword in col_text.upper() for keyword in ['KO/TKO', 'SUB', 'DEC', 'DECISION']):
                            # Clean up the method text
                            method_lines = [line.strip() for line in col_text.split('\n') if line.strip()]
                            if method_lines:
                                method = method_lines[0]
                                # Simplify method names
                                if 'KO/TKO' in method:
                                    fight_data['method'] = 'KO/TKO'
                                elif 'SUB' in method:
                                    fight_data['method'] = 'Submission'
                                elif 'DEC' in method or 'Decision' in method:
                                    if 'U-DEC' in method or 'Unanimous' in method:
                                        fight_data['method'] = 'Decision (Unanimous)'
                                    elif 'S-DEC' in method or 'Split' in method:
                                        fight_data['method'] = 'Decision (Split)'
                                    else:
                                        fight_data['method'] = 'Decision'
                                else:
                                    fight_data['method'] = method
                        
                        # Look for round number
                        if re.search(r'^\s*\d+\s*$', col_text):
                            fight_data['round'] = col_text.strip()
                    
                    # Only add if we have at least result and opponent
                    if 'result' in fight_data and 'opponent' in fight_data:
                        fights.append(fight_data)
    
    except Exception as e:
        print(f"  Error scraping fight history: {e}")
    
    return fights

def calculate_age(dob_string):
    """Calculate age from DOB"""
    if not dob_string or dob_string == "--":
        return None
    
    try:
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
                    first_name = name_link.text.strip()
                    last_name = cols[1].text.strip()
                    full_name = f"{first_name} {last_name}"
                    
                    if full_name.lower() == fighter_name.lower():
                        return name_link['href']
    
    return None

def update_fighter_with_history(fighter_name, headers):
    """Get fight history for a fighter"""
    fighter_url = get_fighter_url_from_list(fighter_name, headers)
    
    if fighter_url:
        response = requests.get(fighter_url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        return scrape_fight_history(soup, fighter_name)
    
    return []

def main():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    # Load existing data
    with open('../public/fighters_data.json', 'r', encoding='utf-8') as f:
        fighters = json.load(f)
    
    print(f"Loaded {len(fighters)} fighters")
    print("Updating all fighters with corrected fight history...\n")
    
    updated_count = 0
    fighters_with_history = 0
    
    for i, fighter in enumerate(fighters, 1):
        fighter_name = fighter.get('name', '')
        
        if not fighter_name:
            print(f"[{i}/{len(fighters)}] Skipping empty entry")
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
            time.sleep(1)
            
        except Exception as e:
            print(f"✗ Error: {e}")
            fighter['last_3_fights'] = []
    
    # Save updated data to all locations
    print("\nSaving data...")
    
    with open('../public/fighters_data.json', 'w', encoding='utf-8') as f:
        json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
    
    with open('../public/fighters_data_new.json', 'w', encoding='utf-8') as f:
        json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
    
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
