import json

# Correct data for the fighters
correct_data = {
    "Muhammad Naimov": {
        "name": "Muhammad Naimov",
        "nickname": "Hillman",
        "wins": 13,
        "losses": 3,
        "draws": 0,
        "height": "5' 9\"",
        "weight": "145 lbs.",
        "reach": "70\"",
        "stance": "Orthodox",
        "dob": "Aug 07, 1994",
        "sig_strikes_landed_per_min": "2.94",
        "striking_accuracy": "42%",
        "sig_strikes_absorbed_per_min": "3.77",
        "striking_defense": "44%",
        "takedown_avg": "1.85",
        "takedown_accuracy": "36%",
        "takedown_defense": "67%",
        "submission_avg": "0.0",
        "last_3_fights": [
            {"result": "W", "opponent": "Bogdan Grad", "method": "Decision - Unanimous", "round": "3"},
            {"result": "W", "opponent": "Kaan Ofli", "method": "Decision - Unanimous", "round": "3"},
            {"result": "L", "opponent": "Felipe Lima", "method": "Submission", "round": "3"}
        ]
    },
    "Mairon Santos": {
        "name": "Mairon Santos",
        "nickname": "The Legend",
        "wins": 17,
        "losses": 1,
        "draws": 0,
        "height": "5' 7\"",
        "weight": "145 lbs.",
        "reach": "72\"",
        "stance": "Orthodox",
        "dob": "Jun 10, 2000",
        "sig_strikes_landed_per_min": "3.53",
        "striking_accuracy": "46%",
        "sig_strikes_absorbed_per_min": "2.38",
        "striking_defense": "66%",
        "takedown_avg": "0.00",
        "takedown_accuracy": "0%",
        "takedown_defense": "50%",
        "submission_avg": "0.0",
        "last_3_fights": [
            {"result": "W", "opponent": "Sodiq Yusuff", "method": "Decision - Unanimous", "round": "3"},
            {"result": "W", "opponent": "Francis Marshall", "method": "Decision - Unanimous", "round": "3"},
            {"result": "W", "opponent": "Kaan Ofli", "method": "KO/TKO", "round": "2"}
        ]
    }
}

# Read the existing JSON file
try:
    with open('fighters_from_csv.json', 'r') as f:
        fighters = json.load(f)
    
    updated_count = 0
    # Update the fighters
    for i, fighter in enumerate(fighters):
        if fighter['name'] in correct_data:
            print(f"Updating {fighter['name']}...")
            fighters[i] = correct_data[fighter['name']]
            updated_count += 1
            
    # If they weren't found, add them (though they should be there from the CSV)
    existing_names = {f['name'] for f in fighters}
    for name, data in correct_data.items():
        if name not in existing_names:
            print(f"Adding {name}...")
            fighters.append(data)
            updated_count += 1
            
    # Write back to the file
    with open('fighters_from_csv.json', 'w') as f:
        json.dump(fighters, f, indent=2)
        
    print(f"Successfully updated {updated_count} fighters.")
    
except Exception as e:
    print(f"Error: {e}")
