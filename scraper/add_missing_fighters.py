import requests
from bs4 import BeautifulSoup
import json
import re
import time

def search_fighter_on_ufcstats(fighter_name):
    """Search for a fighter on UFC Stats and return their URL"""
    # UFC Stats doesn't have a search API, so we'll need to manually find these
    # For now, let's use known fighter IDs or search manually
    
    # Known fighter URLs (you may need to find these manually)
    known_fighters = {
        "Mateusz Rebecki": "http://ufcstats.com/fighter-details/d8b2a1c3e4f56789",  # placeholder
        "Valter Walker": "http://ufcstats.com/fighter-details/a1b2c3d4e5f67890",   # placeholder
        "Louis Sutherland": "http://ufcstats.com/fighter-details/f1e2d3c4b5a69870"  # placeholder
    }
    
    return known_fighters.get(fighter_name)

def scrape_fighter(url):
    """Scrape a specific fighter's details"""
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    stats = {}
    
    # Get name
    name_tag = soup.find('span', class_='b-content__title-highlight')
    if name_tag:
        stats['name'] = name_tag.text.strip()
    
    # Nickname
    nickname_tag = soup.find('p', class_='b-content__Nickname')
    if nickname_tag:
        nickname_text = nickname_tag.text.strip()
        if 'Nickname:' in nickname_text:
            stats['nickname'] = nickname_text.replace('Nickname:', '').strip()
        else:
            stats['nickname'] = ""
    else:
        stats['nickname'] = ""
    
    # Set default values
    stats['height'] = "--"
    stats['weight'] = "--"
    stats['reach'] = "--"
    stats['stance'] = ""
    stats['dob'] = "--"
    stats['wins'] = 0
    stats['losses'] = 0
    stats['draws'] = 0
    stats['sig_strikes_landed_per_min'] = "0.00"
    stats['striking_accuracy'] = "0%"
    stats['sig_strikes_absorbed_per_min'] = "0.00"
    stats['striking_defense'] = "0%"
    stats['takedown_avg'] = "0.00"
    stats['takedown_accuracy'] = "0%"
    stats['takedown_defense'] = "0%"
    stats['submission_avg'] = "0.0"
    
    # Fighter details
    details_list = soup.find_all('li', class_='b-list__box-list-item')
    for item in details_list:
        label = item.text.strip()
        if 'Height:' in label:
            stats['height'] = label.split('Height:')[1].strip()
        elif 'Weight:' in label:
            stats['weight'] = label.split('Weight:')[1].strip()
        elif 'Reach:' in label:
            stats['reach'] = label.split('Reach:')[1].strip()
        elif 'STANCE:' in label:
            stats['stance'] = label.split('STANCE:')[1].strip()
    
    # Record
    record_tag = soup.find('span', class_='b-content__title-record')
    if record_tag:
        record_text = record_tag.text.strip()
        record_match = re.search(r'Record:\s*(\d+)-(\d+)-(\d+)', record_text)
        if record_match:
            stats['wins'] = int(record_match.group(1))
            stats['losses'] = int(record_match.group(2))
            stats['draws'] = int(record_match.group(3))
    
    # Career stats
    career_stats = soup.find_all('div', class_='b-list__info-box-left')
    for stat_box in career_stats:
        items = stat_box.find_all('li', class_='b-list__box-list-item')
        for item in items:
            text = item.text.strip()
            if 'SLpM:' in text:
                stats['sig_strikes_landed_per_min'] = text.split('SLpM:')[1].strip()
            elif 'Str. Acc.:' in text:
                stats['striking_accuracy'] = text.split('Str. Acc.:')[1].strip()
            elif 'SApM:' in text:
                stats['sig_strikes_absorbed_per_min'] = text.split('SApM:')[1].strip()
            elif 'Str. Def:' in text:
                stats['striking_defense'] = text.split('Str. Def:')[1].strip()
            elif 'TD Avg.:' in text:
                stats['takedown_avg'] = text.split('TD Avg.:')[1].strip()
            elif 'TD Acc.:' in text:
                stats['takedown_accuracy'] = text.split('TD Acc.:')[1].strip()
            elif 'TD Def.:' in text:
                stats['takedown_defense'] = text.split('TD Def.:')[1].strip()
            elif 'Sub. Avg.:' in text:
                stats['submission_avg'] = text.split('Sub. Avg.:')[1].strip()
    
    # Fight history - last 3 fights
    stats['last_3_fights'] = scrape_fight_history(soup)
    
    return stats

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

def add_fighter_manually(name, nickname="", height="--", weight="--", reach="--", 
                         stance="", wins=0, losses=0, draws=0):
    """Manually add a fighter with basic stats if URL not found"""
    return {
        "name": name,
        "nickname": nickname,
        "height": height,
        "weight": weight,
        "reach": reach,
        "stance": stance,
        "dob": "--",
        "wins": wins,
        "losses": losses,
        "draws": draws,
        "sig_strikes_landed_per_min": "0.00",
        "striking_accuracy": "0%",
        "sig_strikes_absorbed_per_min": "0.00",
        "striking_defense": "0%",
        "takedown_avg": "0.00",
        "takedown_accuracy": "0%",
        "takedown_defense": "0%",
        "submission_avg": "0.0",
        "last_3_fights": []
    }

def main():
    # Missing fighters to add manually with basic info
    missing_fighters = [
        {"name": "Ariane Carnelossi", "nickname": "", "weight": "115 lbs."},
        {"name": "Phil Rowe", "nickname": "Fresh", "weight": "170 lbs."},
        {"name": "Seokhyeon Ko", "nickname": "", "weight": "135 lbs."},
        {"name": "Montserrat Ruiz", "nickname": "Conejo", "weight": "125 lbs."},
        {"name": "Ketlen Vieira", "nickname": "Fenomeno", "weight": "135 lbs."},
        {"name": "Norma Dumont", "nickname": "Imortal", "weight": "135 lbs."},
        {"name": "Sedriques Dumas", "nickname": "Riq", "weight": "205 lbs."},
        {"name": "Donte Johnson", "nickname": "", "weight": "170 lbs."},
        {"name": "ChangHo Lee", "nickname": "", "weight": "170 lbs."},
        {"name": "Timmy Cuamba", "nickname": "The Spartan", "weight": "135 lbs."},
        {"name": "Billy Elekana", "nickname": "", "weight": "145 lbs."},
        {"name": "Kevin Christian", "nickname": "The Messenger", "weight": "155 lbs."},
        {"name": "Rafael Estevam", "nickname": "Ataman", "weight": "135 lbs."},
        {"name": "Allan Nascimento", "nickname": "Puro Osso", "weight": "125 lbs."},
        {"name": "Daniel Frunza", "nickname": "", "weight": "145 lbs."},
        {"name": "Charles Radtke", "nickname": "", "weight": "185 lbs."},
        {"name": "Yadier del Valle", "nickname": "", "weight": "155 lbs."},
        {"name": "Isaac Dulgarian", "nickname": "", "weight": "145 lbs."},
        {"name": "Jeremiah Wells", "nickname": "The Black Warrior", "weight": "170 lbs."},
        {"name": "Themba Gorimbo", "nickname": "The Answer", "weight": "170 lbs."},
        {"name": "Ante Delija", "nickname": "", "weight": "265 lbs."},
        {"name": "Waldo Cortes Acosta", "nickname": "", "weight": "265 lbs."},
        {"name": "Steve Garcia", "nickname": "Mean Machine", "weight": "145 lbs."},
        {"name": "David Onama", "nickname": "The Silent Assassin", "weight": "145 lbs."}
    ]
    
    # Load existing data
    try:
        with open('../public/fighters_data.json', 'r', encoding='utf-8') as f:
            existing = json.load(f)
    except FileNotFoundError:
        existing = []
    
    existing_names = {f['name'] for f in existing if 'name' in f}
    
    # Add missing fighters
    for fighter_data in missing_fighters:
        if fighter_data['name'] in existing_names:
            print(f"✓ {fighter_data['name']} already in database")
            continue
        
        print(f"Adding {fighter_data['name']} manually...")
        fighter_stats = add_fighter_manually(**fighter_data)
        existing.append(fighter_stats)
        print(f"✓ Added {fighter_data['name']}")
        
    # Save updated data
    with open('../public/fighters_data.json', 'w', encoding='utf-8') as f:
        json.dump(existing, indent=2, fp=f, ensure_ascii=False)
    
    # Copy to dist folder
    with open('../dist/fighters_data.json', 'w', encoding='utf-8') as f:
        json.dump(existing, indent=2, fp=f, ensure_ascii=False)
    
    print(f"\n✅ Done! Total fighters: {len(existing)}")

if __name__ == "__main__":
    main()