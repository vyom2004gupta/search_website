import os
from math import radians, cos, sin, sqrt, atan2
import json
from datetime import datetime
import logging

from flask import Flask, jsonify, request, send_from_directory, render_template
from flask_cors import CORS
import pandas as pd
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# -------------------------------------------------
# Configuration
# -------------------------------------------------
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "people.db")

DATABASE_URL = f"sqlite:///{DB_PATH}"

app = Flask(__name__, static_folder="static", template_folder="templates")
# Enable CORS for all origins in development
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Allow all origins in development
        "methods": ["GET", "POST", "OPTIONS"],  # Allow these methods
        "allow_headers": ["Content-Type"]  # Allow these headers
    }
})

# Google Sheets configuration
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/spreadsheets'  # Add write permission
]
SPREADSHEET_ID = '1jWZ6KOfsXWXxtZzrZg2rUEe9qDlOOTsdanWTt3q4rqc'
RANGE_NAME = 'Sheet1!A2:I'  # Updated to include organization and role

def get_google_sheets_service():
    """Get Google Sheets service object."""
    try:
        # For production, use service account
        if os.path.exists('service_account.json'):
            logger.info("✅ Found service_account.json — proceeding with authentication")
            credentials = service_account.Credentials.from_service_account_file(
                'service_account.json', scopes=SCOPES)
            logger.info("Successfully created credentials from service account")
        else:
            # For development, use OAuth 2.0
            if os.path.exists('token.json'):
                credentials = Credentials.from_authorized_user_file('token.json', SCOPES)
                logger.info("Using OAuth 2.0 credentials from token.json")
            else:
                logger.error("No credentials found. Please set up authentication.")
                raise FileNotFoundError("No credentials found. Please set up authentication.")
        
        service = build('sheets', 'v4', credentials=credentials)
        logger.info("Successfully created Google Sheets service")
        return service
    except Exception as e:
        logger.error(f"Error setting up Google Sheets service: {str(e)}")
        return None

def fetch_people_data():
    """Fetch data from Google Sheets."""
    try:
        service = get_google_sheets_service()
        if not service:
            logger.error("Failed to create Google Sheets service")
            return []

        logger.info(f"Fetching data from spreadsheet {SPREADSHEET_ID}")
        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=SPREADSHEET_ID,
                                  range=RANGE_NAME).execute()
        values = result.get('values', [])

        if not values:
            logger.warning('No data found in Google Sheet')
            return []

        logger.info(f"Successfully fetched {len(values)} rows from Google Sheets")
        
        # Convert to list of dictionaries
        people = []
        for row in values:
            # Pad row with None values if it's too short
            row_padded = row + [None] * (9 - len(row))  # Updated for new columns
            try:
                person = {
                    'id': row_padded[0],
                    'name': row_padded[1],
                    'photo_url': row_padded[2],
                    'phone': row_padded[3],
                    'email': row_padded[4],
                    'latitude': float(row_padded[5]) if row_padded[5] else None,
                    'longitude': float(row_padded[6]) if row_padded[6] else None,
                    'organization': row_padded[7],  # New field
                    'role': row_padded[8],  # New field
                }
                people.append(person)
            except (ValueError, TypeError) as e:
                logger.error(f"Error processing row {row}: {str(e)}")
                continue

        logger.info(f"Successfully processed {len(people)} people records")
        return people

    except HttpError as err:
        logger.error(f"Google Sheets API error: {str(err)}")
        return []
    except Exception as e:
        logger.error(f"Error fetching data: {str(e)}")
        return []

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points."""
    R = 6371  # Earth radius in kilometers

    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

# -------------------------------------------------
# Routes
# -------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/organizations")
def get_organizations():
    """Get list of unique organizations."""
    try:
        all_people = fetch_people_data()
        organizations = sorted(list(set(
            person['organization'] 
            for person in all_people 
            if person['organization']
        )))
        return jsonify(organizations)
    except Exception as e:
        logger.error(f"Error fetching organizations: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/search")
def search_people():
    try:
        q = request.args.get("q", "").strip().lower()
        org = request.args.get("organization", "").strip()
        logger.info(f"Search query received: q='{q}', organization='{org}'")

        # Fetch all people from Google Sheets
        all_people = fetch_people_data()
        logger.info(f"Fetched {len(all_people)} total records")
        
        # Filter based on search query and organization
        results = all_people
        
        if org:
            results = [p for p in results if p['organization'] and p['organization'].lower() == org.lower()]
            logger.info(f"Filtered to {len(results)} records after organization filter")

        if q:
            results = [
                p for p in results
                if (q in p['name'].lower() or 
                    (p['organization'] and q in p['organization'].lower()) or
                    (p['role'] and q in p['role'].lower()))
            ]
            logger.info(f"Filtered to {len(results)} records after text search")

        return jsonify(results)

    except Exception as e:
        logger.error(f"Error in search: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/nearby")
def nearby_people():
    try:
        lat = float(request.args["lat"])
        lon = float(request.args["lon"])
        radius_km = float(request.args.get("radius", 10))
        org = request.args.get("organization", "").strip()
        logger.info(f"Nearby search request: lat={lat}, lon={lon}, radius={radius_km}km, organization='{org}'")

        all_people = fetch_people_data()
        
        # First filter by organization if specified
        if org:
            all_people = [p for p in all_people if p['organization'] and p['organization'].lower() == org.lower()]
            logger.info(f"Filtered to {len(all_people)} records after organization filter")

        nearby = []
        for person in all_people:
            if person['latitude'] and person['longitude']:
                dist = haversine_distance(lat, lon, person['latitude'], person['longitude'])
                if dist <= radius_km:
                    person_copy = person.copy()
                    person_copy['distance_km'] = round(dist, 2)
                    nearby.append(person_copy)

        # Sort by distance
        nearby.sort(key=lambda x: x['distance_km'])
        logger.info(f"Found {len(nearby)} people within {radius_km}km")
        
        return jsonify(nearby)

    except (KeyError, ValueError) as e:
        logger.error(f"Invalid parameters in nearby search: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Error in nearby search: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/submit', methods=['POST'])
def submit_user():
    """Handle user submission."""
    try:
        data = request.json
        logger.info("Received user submission request")
        
        # Validate required fields
        required_fields = ['name', 'email', 'organization']
        for field in required_fields:
            if not data.get(field):
                logger.error(f"Missing required field: {field}")
                return jsonify({'error': f'{field} is required'}), 400

        # Get the Google Sheets service
        service = get_google_sheets_service()
        if not service:
            logger.error("Failed to create Google Sheets service")
            return jsonify({'error': 'Internal server error'}), 500

        # Get the next available row
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=RANGE_NAME
        ).execute()
        values = result.get('values', [])
        next_row = len(values) + 2  # +2 because we start from A2

        # If organization is "other", use the new_organization value
        organization = data.get('new_organization') if data.get('organization') == 'other' else data.get('organization')
        
        # Prepare row data
        row_data = [
            [
                str(next_row - 2),  # ID (row number - 2)
                data.get('name', ''),
                data.get('photo_url', ''),
                data.get('phone', ''),
                data.get('email', ''),
                str(data.get('latitude', '')),
                str(data.get('longitude', '')),
                organization,
                data.get('role', '')
            ]
        ]

        # Update the sheet
        body = {
            'values': row_data
        }
        
        result = service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID,
            range=f'Sheet1!A{next_row}',
            valueInputOption='RAW',
            insertDataOption='INSERT_ROWS',
            body=body
        ).execute()

        logger.info(f"Successfully added user data to row {next_row}")
        return jsonify({'message': 'Successfully added user data'}), 200
        
    except Exception as e:
        logger.error(f"Error submitting user data: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Route for static files handled automatically via static_folder argument

# -------------------------------------------------
# Entry point
# -------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    print(f"Starting Flask server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True) 