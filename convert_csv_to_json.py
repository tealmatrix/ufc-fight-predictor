#!/usr/bin/env python3
"""
Convert UFC_Training_Data.csv to fighters JSON format
This version aggregates the LATEST fight data for each fighter
"""
import csv
import json
from collections import defaultdict
from datetime import datetime

def parse_stat(value):
    """Parse a stat value, handling empty strings and percentages"""
    if not value or value == '' or str(value).strip() == '' or str(value) == 'nan' or str(value) == '0.0':
        return None
    return value.strip()

def format_height(height_inches):
    """Convert inches to feet/inches format"""
    try:
        height = float(height_inches)
        feet = int(height // 12)
        inches = int(height % 12)
        return f"{feet}' {inches}\""
    except:
        return "5' 10\""

def format_reach(reach_inches):
    """Format reach with inches marker"""
    try:
        return f"{int(float(reach_inches))}\""
    except:
        return '72"'

def format_percentage(val):
    """Ensure percentages have % sign"""
    if not val:
        return '0%'
    val = str(val)
    if '%' in val:
        return val
    try:
        float_val = float(val)
        if float_val <= 1.0:
            return f"{int(float_val * 100)}%"
        else:
            return f"{int(float_val)}%"
    except:
        return '0%'

def main():
    fighters_by_date = defaultdict(list)
    
    # Read the CSV file and group fights by fighter and date
    with open('UFC_Training_Data.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            event_date = row.get('Event_Date', '')
            
            # Process Fighter A
            a_name = row.get('A_Name', '').strip()
            if a_name:
                fighter_data = {
                    'name': a_name,
                    'date': event_date,
                    'height': parse_stat(row.get('A_Height', '')),
                    'reach': parse_stat(row.get('A_Reach', '')),
                    'wins': parse_stat(row.get('A_Career_Wins', '0')),
                    'losses': parse_stat(row.get('A_Career_Losses', '0')),
                    'draws': parse_stat(row.get('A_Career_Draws_NC', '0')),
                    'sig_strikes_landed_per_min': parse_stat(row.get('A_Career_SSLPM', '0.00')),
                    'striking_accuracy': parse_stat(row.get('A_Career_Sig_Strike_Acc', '0%')),
                    'sig_strikes_absorbed_per_min': parse_stat(row.get('A_Career_SSAPM', '0.00')),
                    'striking_defense': parse_stat(row.get('A_Career_Sig_Strike_Def', '0%')),
                    'takedown_avg': parse_stat(row.get('A_Career_TD_P15M', '0.00')),
                    'takedown_accuracy': parse_stat(row.get('A_Career_TD_Acc', '0%')),
                    'takedown_defense': parse_stat(row.get('A_Career_TD_Def', '0%')),
                }
                fighters_by_date[a_name].append(fighter_data)
            
            # Process Fighter B
            b_name = row.get('B_Name', '').strip()
            if b_name:
                fighter_data = {
                    'name': b_name,
                    'date': event_date,
                    'height': parse_stat(row.get('B_Height', '')),
                    'reach': parse_stat(row.get('B_Reach', '')),
                    'wins': parse_stat(row.get('B_Career_Wins', '0')),
                    'losses': parse_stat(row.get('B_Career_Losses', '0')),
                    'draws': parse_stat(row.get('B_Career_Draws_NC', '0')),
                    'sig_strikes_landed_per_min': parse_stat(row.get('B_Career_SSLPM', '0.00')),
                    'striking_accuracy': parse_stat(row.get('B_Career_Sig_Strike_Acc', '0%')),
                    'sig_strikes_absorbed_per_min': parse_stat(row.get('B_Career_SSAPM', '0.00')),
                    'striking_defense': parse_stat(row.get('B_Career_Sig_Strike_Def', '0%')),
                    'takedown_avg': parse_stat(row.get('B_Career_TD_P15M', '0.00')),
                    'takedown_accuracy': parse_stat(row.get('B_Career_TD_Acc', '0%')),
                    'takedown_defense': parse_stat(row.get('B_Career_TD_Def', '0%')),
                }
                fighters_by_date[b_name].append(fighter_data)
    
    # Get the most recent data for each fighter
    fighters_data = {}
    for name, fights in fighters_by_date.items():
        # Sort by date (most recent first)
        fights.sort(key=lambda x: x['date'], reverse=True)
        
        # Get the most recent fight data
        latest = fights[0]
        
        fighters_data[name] = {
            'name': name,
            'height': format_height(latest['height']) if latest['height'] else "5' 10\"",
            'reach': format_reach(latest['reach']) if latest['reach'] else '72"',
            'wins': int(float(latest['wins'])) if latest['wins'] else 0,
            'losses': int(float(latest['losses'])) if latest['losses'] else 0,
            'draws': int(float(latest['draws'])) if latest['draws'] else 0,
            'sig_strikes_landed_per_min': f"{float(latest['sig_strikes_landed_per_min']):.2f}" if latest['sig_strikes_landed_per_min'] else '0.00',
            'striking_accuracy': format_percentage(latest['striking_accuracy']),
            'sig_strikes_absorbed_per_min': f"{float(latest['sig_strikes_absorbed_per_min']):.2f}" if latest['sig_strikes_absorbed_per_min'] else '0.00',
            'striking_defense': format_percentage(latest['striking_defense']),
            'takedown_avg': f"{float(latest['takedown_avg']):.2f}" if latest['takedown_avg'] else '0.00',
            'takedown_accuracy': format_percentage(latest['takedown_accuracy']),
            'takedown_defense': format_percentage(latest['takedown_defense']),
            'submission_avg': '0.0',  # Not in CSV
            'stance': 'Orthodox',  # Not in CSV
            'weight': '',
            'dob': '',
            'nickname': '',
            'last_3_fights': []
        }
    
    # Convert to array format
    fighters_array = list(fighters_data.values())
    fighters_array.sort(key=lambda x: x['name'])
    
    # Write to JSON file
    with open('fighters_from_csv.json', 'w', encoding='utf-8') as f:
        json.dump(fighters_array, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Converted {len(fighters_array)} fighters to fighters_from_csv.json")
    
    # Show sample fighters
    print(f"\nSample fighters:")
    for name in ['Muhammad Naimov', 'Mairon Santos']:
        if name in fighters_data:
            print(f"\n{name}:")
            print(json.dumps(fighters_data[name], indent=2))

if __name__ == '__main__':
    main()
