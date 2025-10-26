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
        fight_table = soup.find('table', class_='b-fight-details__table')
        
        if fight_table:
            rows = fight_table.find_all('tr', class_='b-fight-details__table-row')[1:]
            
            for row in rows[:3]:
                cols = row.find_all('td')
                
                if len(cols) >= 2:
                    fight_data = {}
                    
                    result_col = cols[0]
                    result_text = result_col.text.strip()
                    if result_text:
                        fight_data['result'] = result_text
                    
                    opponent_col = cols[1]
                    opponent_link = opponent_col.find('a')
                    if opponent_link:
                        fight_data['opponent'] = opponent_link.text.strip()
                    
                    if len(cols) >= 7:
                        method_col = cols[6]
                        method_text = method_col.text.strip()
                        method_parts = method_text.split()
                        if method_parts:
                            fight_data['method'] = method_parts[0]
                        
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

def scrape_fighter_details(fighter_url, headers):
    """Scrape detailed stats for a specific fighter"""
    response = requests.get(fighter_url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    stats = {}
    
    # Basic info
    name_tag = soup.find('span', class_='b-content__title-highlight')
    if name_tag:
        stats['name'] = name_tag.text.strip()
    
    nickname_tag = soup.find('p', class_='b-content__Nickname')
    if nickname_tag:
        stats['nickname'] = nickname_tag.text.strip().replace('Nickname:', '').strip()
    else:
        stats['nickname'] = ""
    
    # Set defaults
    stats['height'] = "--"
    stats['weight'] = "--"
    stats['reach'] = "--"
    stats['stance'] = ""
    stats['dob'] = "--"
    stats['wins'] = 0
    stats['losses'] = 0
    stats['draws'] = 0
    
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
        elif 'DOB:' in label:
            stats['dob'] = label.split('DOB:')[1].strip()
    
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
    stats['sig_strikes_landed_per_min'] = "0.00"
    stats['striking_accuracy'] = "0%"
    stats['sig_strikes_absorbed_per_min'] = "0.00"
    stats['striking_defense'] = "0%"
    stats['takedown_avg'] = "0.00"
    stats['takedown_accuracy'] = "0%"
    stats['takedown_defense'] = "0%"
    stats['submission_avg'] = "0.0"
    
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
    
    # Fight history
    stats['last_3_fights'] = scrape_fight_history(soup)
    
    # Calculate age
    if stats.get('dob') and stats['dob'] != "--":
        age = calculate_age(stats['dob'])
        if age:
            stats['age'] = age
    
    return stats

def search_fighter_on_ufcstats(fighter_name, headers):
    """Search for fighter using multiple variations"""
    base_url = "http://ufcstats.com/statistics/fighters"
    
    # Try different name variations
    name_variations = [
        fighter_name,
        fighter_name.replace("ChangHo", "Chang-Ho"),
        fighter_name.replace("Seokhyeon", "Seok Hyeon"),
    ]
    
    for letter in 'abcdefghijklmnopqrstuvwxyz':
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
                        first_name = name_link.text.strip()
                        last_name = cols[1].text.strip()
                        full_name = f"{first_name} {last_name}"
                        
                        # Check all variations
                        for variation in name_variations:
                            if full_name.lower() == variation.lower():
                                return name_link['href']
        
        time.sleep(0.3)
    
    return None

def main():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    # Fighters that need updating
    fighters_to_update = [
        "Ariane Carnelossi",
        "Phil Rowe",
        "Seokhyeon Ko",
        "Montserrat Ruiz",
        "Ketlen Vieira",
        "Norma Dumont",
        "Sedriques Dumas",
        "Donte Johnson",
        "ChangHo Lee",
        "Timmy Cuamba",
        "Billy Elekana",
        "Kevin Christian",
        "Rafael Estevam",
        "Allan Nascimento",
        "Daniel Frunza",
        "Charles Radtke",
        "Yadier del Valle",
        "Isaac Dulgarian",
        "Jeremiah Wells",
        "Themba Gorimbo",
        "Ante Delija",
        "Waldo Cortes Acosta",
        "Steve Garcia",
        "David Onama"
    ]
    
    # Load existing data
    with open('../public/fighters_data.json', 'r', encoding='utf-8') as f:
        fighters = json.load(f)
    
    print(f"Loaded {len(fighters)} fighters")
    print("Searching and updating specific fighters...\n")
    
    updated_count = 0
    
    for fighter_name in fighters_to_update:
        print(f"Processing {fighter_name}...", end=" ")
        
        # Find fighter URL
        fighter_url = search_fighter_on_ufcstats(fighter_name, headers)
        
        if fighter_url:
            print(f"Found on UFC Stats, scraping...")
            try:
                # Scrape full details
                new_stats = scrape_fighter_details(fighter_url, headers)
                
                # Find and update in fighters list
                for i, fighter in enumerate(fighters):
                    if fighter.get('name', '').lower() == fighter_name.lower():
                        # Update with new stats
                        fighters[i] = new_stats
                        updated_count += 1
                        print(f"  ✓ Updated with record {new_stats['wins']}-{new_stats['losses']}-{new_stats['draws']}")
                        break
                
                time.sleep(1)
            except Exception as e:
                print(f"  ✗ Error: {e}")
        else:
            print(f"  - Not found on UFC Stats, keeping placeholder data")
    
    # Save updated data
    with open('../public/fighters_data.json', 'w', encoding='utf-8') as f:
        json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
    
    with open('../public/fighters_data_new.json', 'w', encoding='utf-8') as f:
        json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
    
    with open('../dist/fighters_data.json', 'w', encoding='utf-8') as f:
        json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
    
    with open('../dist/fighters_data_new.json', 'w', encoding='utf-8') as f:
        json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
    
    print(f"\n✅ Done! Updated {updated_count} fighters with real UFC Stats data")
    print(f"Total fighters: {len(fighters)}")

if __name__ == "__main__":
    main()
