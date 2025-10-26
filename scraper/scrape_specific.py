import requests
from bs4 import BeautifulSoup
import json
import time
import re

class UFCSpecificScraper:
    def __init__(self):
        self.base_url = "http://ufcstats.com/statistics/fighters"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
    
    def scrape_fighter_details(self, fighter_url):
        """Scrape detailed stats for a specific fighter"""
        response = requests.get(fighter_url, headers=self.headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        stats = {}
        
        # Basic info
        name_tag = soup.find('span', class_='b-content__title-highlight')
        if name_tag:
            stats['name'] = name_tag.text.strip()
        
        nickname_tag = soup.find('p', class_='b-content__Nickname')
        if nickname_tag:
            stats['nickname'] = nickname_tag.text.strip().replace('Nickname:', '').strip()
        
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
        
        return stats
    
    def scrape_fight_history(self, soup):
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
    
    def find_and_scrape_fighters(self, names_to_find):
        """Find and scrape specific fighters by name"""
        all_fighters = []
        letters = 'abcdefghijklmnopqrstuvwxyz'
        
        # First, find all fighters and their URLs
        print("Searching for fighters...")
        fighter_urls = {}
        
        for letter in letters:
            url = f"{self.base_url}?char={letter}&page=all"
            response = requests.get(url, headers=self.headers)
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
                            # Check if this fighter matches any of our search names
                            for search_name in names_to_find:
                                if search_name.lower() in name.lower():
                                    fighter_urls[name] = name_link['href']
                                    print(f"Found: {name}")
            
            time.sleep(0.5)
        
        # Now scrape details for found fighters
        detailed_fighters = []
        for name, url in fighter_urls.items():
            print(f"Scraping details for {name}...")
            try:
                details = self.scrape_fighter_details(url)
                detailed_fighters.append(details)
                time.sleep(1)
            except Exception as e:
                print(f"Error scraping {name}: {e}")
        
        return detailed_fighters
    
    def load_existing_data(self, filename):
        """Load existing fighter data"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return []
    
    def save_merged_data(self, new_fighters, filename='../public/fighters_data.json'):
        """Merge new fighters with existing data and save"""
        existing = self.load_existing_data(filename)
        
        # Create a set of existing fighter names
        existing_names = {f['name'] for f in existing if 'name' in f}
        
        # Add new fighters that don't already exist
        added = 0
        for fighter in new_fighters:
            if fighter.get('name') and fighter['name'] not in existing_names:
                existing.append(fighter)
                added += 1
                print(f"Added: {fighter['name']}")
        
        # Save merged data
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(existing, indent=2, fp=f, ensure_ascii=False)
        
        print(f"\n✅ Added {added} new fighters to {filename}")
        print(f"Total fighters in database: {len(existing)}")


def main():
    scraper = UFCSpecificScraper()
    
    # Add fighters you want to scrape (use last names for better matching)
    fighters_to_find = [
        "Sutherland", # Louis Sutherland
    ]
    
    print(f"Searching for: {', '.join(fighters_to_find)}\n")
    
    fighters = scraper.find_and_scrape_fighters(fighters_to_find)
    
    if fighters:
        scraper.save_merged_data(fighters)
    else:
        print("No fighters found!")


if __name__ == "__main__":
    main()
