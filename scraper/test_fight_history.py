import requests
from bs4 import BeautifulSoup

# Test with a known fighter - Hamdy Abdelwahab
fighter_url = "http://ufcstats.com/fighter-details/19bc93c5ab46cbbe"
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}

response = requests.get(fighter_url, headers=headers)
soup = BeautifulSoup(response.content, 'html.parser')

# Find all tables
all_tables = soup.find_all('table')
print(f"Found {len(all_tables)} tables total\n")

for idx, table in enumerate(all_tables):
    print(f"Table {idx}: class={table.get('class')}")

# Try different ways to find fight history
fight_table = soup.find('table', class_='b-fight-details__table')
if not fight_table:
    # Try without specific class
    tables = soup.find_all('table')
    if tables:
        fight_table = tables[0]  # Usually the first table is fight history

if fight_table:
    print("\nFound fight history table\n")
    rows = fight_table.find_all('tr')[:4]  # Header + first 3 fights
    
    for i, row in enumerate(rows):
        print(f"Row {i}:")
        cols = row.find_all(['td', 'th'])
        print(f"  Number of columns: {len(cols)}")
        
        for j, col in enumerate(cols[:10]):  # Show first 10 columns
            text = ' '.join(col.text.strip().split())[:80]  # Limit text length, remove extra whitespace
            print(f"  Column {j}: '{text}'")
        print()
else:
    print("No fight history table found")
