#!/usr/bin/env python3
import requests
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

# Get database API and auth key
DATABASE_API = os.getenv('DATABASE_API')
DATABASE_AUTH_KEY = os.getenv('DATABASE_AUTH_KEY')

if not DATABASE_API or not DATABASE_AUTH_KEY:
    print("Error: DATABASE_API or DATABASE_AUTH_KEY not found in .env.local")
    exit(1)

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {DATABASE_AUTH_KEY}'
}

def reset_team_checkins():
    """Reset the checked_in flag for all teams"""
    print("Resetting team check-ins...")

    # Get all teams
    get_teams_payload = {
        "ignore_encryption": {
            "_id": True,
        }
    }

    try:
        response = requests.post(
            f"{DATABASE_API}/etc/get/team", 
            headers=headers,
            json=get_teams_payload
        )

        if not response.ok:
            print(f"Error fetching teams: {response.status_code}")
            print(response.text)
            return

        teams_data = response.json()
        if not teams_data.get('data'):
            print("No teams found")
            return

        teams = teams_data['data']
        print(f"Found {len(teams)} teams")

        # Update each team
        count = 0
        for team in teams:
            if team.get('checked_in') == True:
                team_id = team['_id']
                update_payload = {
                    "_id": team_id,
                    "checked_in": False,
                    "ignore_encryption": {
                        "_id": True,
                    }
                }

                update_response = requests.post(
                    f"{DATABASE_API}/etc/edit/team",
                    headers=headers,
                    json=update_payload
                )

                if update_response.ok:
                    count += 1
                    print(f"Reset team: {team.get('team_name', team_id)}")
                else:
                    print(f"Failed to update team {team_id}: {update_response.status_code}")
                    print(update_response.text)

        print(f"Updated {count} teams")
        
    except Exception as e:
        print(f"Error: {str(e)}")

def reset_member_checkins():
    """Reset the checked_in flag for all members"""
    print("\nResetting member check-ins...")
    
    # Get all members
    get_members_payload = {
        "ignore_encryption": {
            "_id": True,
        }
    }
    
    try:
        response = requests.post(
            f"{DATABASE_API}/etc/get/member", 
            headers=headers,
            json=get_members_payload
        )
        
        if not response.ok:
            print(f"Error fetching members: {response.status_code}")
            print(response.text)
            return
        
        members_data = response.json()
        if not members_data.get('data'):
            print("No members found")
            return
        
        members = members_data['data']
        print(f"Found {len(members)} members")
        
        # Update each member
        count = 0
        for member in members:
            if member.get('checked_in') == True:
                member_id = member['_id']
                update_payload = {
                    "_id": member_id,
                    "checked_in": False,
                    "ignore_encryption": {
                        "_id": True,
                    }
                }
                
                update_response = requests.post(
                    f"{DATABASE_API}/etc/edit/member",
                    headers=headers,
                    json=update_payload
                )
                
                if update_response.ok:
                    count += 1
                    print(f"Reset member: {member.get('name_zh', member_id)}")
                else:
                    print(f"Failed to update member {member_id}: {update_response.status_code}")
                    print(update_response.text)
        
        print(f"Updated {count} members")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    print("Starting check-in reset process...")
    reset_team_checkins()
    reset_member_checkins()
    print("\nCheck-in reset process completed!") 