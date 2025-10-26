import requests
from bs4 import BeautifulSoup
import json
import re

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


def main():
    # UFC fighter URLs for Saturday's fighters
    fighters_to_add = {
        "Mackenzie Dern": "http://ufcstats.com/fighter-details/7447e9f28508106a",
        "Virna Jandiroba": "http://ufcstats.com/fighter-details/7dda2cf308f24a02",
        "Ludovit Klein": "http://ufcstats.com/fighter-details/5b86d491d63890c5",
        "Mizuki": "http://ufcstats.com/fighter-details/43a59ce3bb40449e",
        "Jaqueline Amorim": "http://ufcstats.com/fighter-details/bc7d1ad49fcb2d08",
        "Azat Maksum": "http://ufcstats.com/fighter-details/7f1bf0c255ec8756",
        "Mitch Raposo": "http://ufcstats.com/fighter-details/0be6776db31d98ec",
        "Chris Barnett": "http://ufcstats.com/fighter-details/7a5e8c94a86f9895",
        "Jose Delgado": "http://ufcstats.com/fighter-details/7d6ceff6747f2de2",
        "Nathaniel Wood": "http://ufcstats.com/fighter-details/329e403448756217",
        "Matheus Camilo": "http://ufcstats.com/fighter-details/72f890c5d421e705",
        "Ikram Aliskerov": "http://ufcstats.com/fighter-details/b07aed698fba8624",
        "JunYong Park": "http://ufcstats.com/fighter-details/285ae0b4a68221f4",
        "Azamat Murzakanov": "http://ufcstats.com/fighter-details/e90a2f22417af68e",
        "Aleksandar Rakic": "http://ufcstats.com/fighter-details/333b9e5c723ac873",
        "Alexander Volkov": "http://ufcstats.com/fighter-details/279566840aa55bf2",
        "Jailton Almeida": "http://ufcstats.com/fighter-details/41e83a89929d1327",
        "Mario Bautista": "http://ufcstats.com/fighter-details/bc711b6dd95c1af6",
        "Umar Nurmagomedov": "http://ufcstats.com/fighter-details/2b6fc1c02736833d",
        "Tom Aspinall": "http://ufcstats.com/fighter-details/399afbabc02376b5",
        "Ciryl Gane": "http://ufcstats.com/fighter-details/787bb1f087ccff8a",
        "Nasrat Haqparast": "http://ufcstats.com/fighter-details/4dea44a9e1d5b9f1",
    }
    
    # Load existing data
    try:
        with open('../public/fighters_data.json', 'r', encoding='utf-8') as f:
            existing = json.load(f)
    except FileNotFoundError:
        existing = []
    
    existing_names = {f['name'] for f in existing if 'name' in f}
    
    # Scrape and add new fighters
    for name, url in fighters_to_add.items():
        if name in existing_names:
            print(f"✓ {name} already in database")
            continue
        
        print(f"Scraping {name}...")
        try:
            stats = scrape_fighter(url)
            existing.append(stats)
            print(f"✓ Added {stats['name']}")
        except Exception as e:
            print(f"✗ Error scraping {name}: {e}")
    
    # Save updated data
    with open('../public/fighters_data.json', 'w', encoding='utf-8') as f:
        json.dump(existing, indent=2, fp=f, ensure_ascii=False)
    
    print(f"\n✅ Done! Total fighters: {len(existing)}")


if __name__ == "__main__":
    main()
