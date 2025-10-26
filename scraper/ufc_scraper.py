import requests
from bs4 import BeautifulSoup
import json
import time
import re

class UFCScraper:
    def __init__(self):
        self.base_url = "http://ufcstats.com/statistics/fighters"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
    
    def scrape_fighters_list(self, letter='a'):
        """Scrape list of fighters starting with a specific letter"""
        url = f"{self.base_url}?char={letter}&page=all"
        response = requests.get(url, headers=self.headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        fighters = []
        table = soup.find('table', class_='b-statistics__table')
        
        if table:
            rows = table.find_all('tr', class_='b-statistics__table-row')[1:]  # Skip header
            
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 2:
                    name_link = cols[0].find('a')
                    if name_link:
                        fighter = {
                            'name': name_link.text.strip(),
                            'url': name_link['href'],
                            'nickname': cols[1].text.strip()
                        }
                        fighters.append(fighter)
        
        return fighters
    
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
    
    def scrape_all_fighters(self, limit=None):
        """Scrape all fighters from A-Z"""
        all_fighters = []
        letters = 'abcdefghijklmnopqrstuvwxyz'
        
        print("Scraping fighters list...")
        for letter in letters:
            print(f"Fetching fighters starting with '{letter.upper()}'...")
            fighters = self.scrape_fighters_list(letter)
            all_fighters.extend(fighters)
            time.sleep(1)  # Be respectful to the server
        
        print(f"\nFound {len(all_fighters)} fighters total.")
        
        if limit:
            all_fighters = all_fighters[:limit]
            print(f"Limiting to {limit} fighters for testing.")
        
        # Now get detailed stats for each fighter
        detailed_fighters = []
        for i, fighter in enumerate(all_fighters, 1):
            print(f"Scraping details for {fighter['name']} ({i}/{len(all_fighters)})...")
            try:
                details = self.scrape_fighter_details(fighter['url'])
                detailed_fighters.append(details)
                time.sleep(1)  # Be respectful to the server
            except Exception as e:
                print(f"Error scraping {fighter['name']}: {e}")
                continue
        
        return detailed_fighters
    
    def save_to_json(self, fighters, filename='fighters_data.json'):
        """Save fighter data to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(fighters, indent=2, fp=f, ensure_ascii=False)
        print(f"\nData saved to {filename}")


def main():
    scraper = UFCScraper()
    
    # Scrape all fighters (this will take 30-60 minutes due to rate limiting)
    # Pass limit=500 for faster testing (about 10 minutes)
    fighters = scraper.scrape_all_fighters(limit=500)
    
    # Save to public directory so it's accessible by the React app
    output_path = '../public/fighters_data.json'
    scraper.save_to_json(fighters, output_path)


if __name__ == "__main__":
    main()
