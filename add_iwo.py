import json

# Data for Iwo Baraniewski
iwo_data = {
    "name": "Iwo Baraniewski",
    "nickname": "Rudy",
    "wins": 6,
    "losses": 0,
    "draws": 0,
    "height": "6' 0\"",
    "weight": "205 lbs.",
    "reach": "73\"",
    "stance": "Orthodox",
    "dob": "Nov 20, 1998",
    "sig_strikes_landed_per_min": "12.00",
    "striking_accuracy": "66%",
    "sig_strikes_absorbed_per_min": "6.00",
    "striking_defense": "33%",
    "takedown_avg": "0.00",
    "takedown_accuracy": "0%",
    "takedown_defense": "0%",
    "submission_avg": "0.0",
    "last_3_fights": [
        {"result": "W", "opponent": "Robert Valentin", "method": "KO/TKO", "round": "1"},
        {"result": "W", "opponent": "TBA", "method": "TBA", "round": "TBA"},
        {"result": "W", "opponent": "TBA", "method": "TBA", "round": "TBA"}
    ]
}

# Read the existing JSON file
try:
    with open('public/fighters_data_new.json', 'r') as f:
        fighters = json.load(f)
    
    # Check if he already exists
    exists = False
    for i, fighter in enumerate(fighters):
        if fighter['name'].lower() == iwo_data['name'].lower():
            print(f"Updating {fighter['name']}...")
            fighters[i] = iwo_data
            exists = True
            break
            
    if not exists:
        print(f"Adding {iwo_data['name']}...")
        fighters.append(iwo_data)
            
    # Write back to the file
    with open('public/fighters_data_new.json', 'w') as f:
        json.dump(fighters, f, indent=2)
        
    print(f"Successfully added/updated Iwo Baraniewski.")
    
except Exception as e:
    print(f"Error: {e}")
