import requests
from bs4 import BeautifulSoup

def test_fighter_lookup(fighter_name):
    """Test looking up a fighter"""
    base_url = "http://ufcstats.com/statistics/fighters"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    # Get first letter of last name
    name_parts = fighter_name.strip().split()
    if len(name_parts) < 2:
        first_letter = fighter_name[0].lower()
    else:
        first_letter = name_parts[-1][0].lower()
    
    print(f"Testing fighter: {fighter_name}")
    print(f"First letter: {first_letter}")
    
    url = f"{base_url}?char={first_letter}&page=all"
    print(f"URL: {url}\n")
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    table = soup.find('table', class_='b-statistics__table')
    if table:
        rows = table.find_all('tr', class_='b-statistics__table-row')[1:]
        print(f"Found {len(rows)} fighters with last name starting with '{first_letter.upper()}'\n")
        
        # Show first 10 fighters
        print("First 10 fighters:")
        for i, row in enumerate(rows[:5]):
            cols = row.find_all('td')
            print(f"\nRow {i+1}:")
            print(f"  Number of columns: {len(cols)}")
            if len(cols) >= 1:
                print(f"  Column 0 HTML: {cols[0]}")
                print(f"  Column 0 text: '{cols[0].text.strip()}'")
                name_link = cols[0].find('a')
                if name_link:
                    print(f"  Link text: '{name_link.text.strip()}'")
                    print(f"  Link href: '{name_link['href']}'")
            if len(cols) >= 2:
                print(f"  Column 1 text: '{cols[1].text.strip()}'")
        
        print("\nSearching for exact match...")
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 2:
                name_link = cols[0].find('a')
                if name_link:
                    name = ' '.join(name_link.text.strip().split())
                    if name.lower() == fighter_name.lower():
                        print(f"✓ Found: {name}")
                        print(f"  URL: {name_link['href']}")
                        return
        
        print("✗ Not found")
    else:
        print("No table found!")

# Test with a known fighter
test_fighter_lookup("Tom Aaron")
