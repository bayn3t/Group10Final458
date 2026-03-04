# Seattle Metro Bus Stops Map 🚌

An interactive, static web map displaying all **14,945 active Seattle/King County Metro bus stops** with route information and accessibility details.

## Quick Start

1. Open `index.html` in your browser
2. Explore the map - zoom, pan, and click stops for details
3. Use the search box to find specific stops by name, ID, or route

## Features

✨ **Interactive Map**
- Pan and zoom to explore bus stops
- Marker clustering for better performance
- Color-coded markers by number of routes served

🔍 **Search & Filter**
- Search by stop name, stop ID, or route number
- Real-time filtering as you type

ℹ️ **Stop Information Popups**
- Stop name and ID
- Routes served at each stop
- Service jurisdiction
- Shelter availability
- ADA accessibility information

📱 **Responsive Design**
- Works on desktop, tablet, and mobile
- Touch-friendly interface

⚡ **Performance**
- 14,945 stops loaded efficiently
- Static files only (no server required)
- Works with GitHub Pages

## File Structure

```
./
├── index.html              # Main HTML file
├── README.md              # This file
├── css/
│   └── style.css          # All styling
├── js/
│   └── main.js            # Map functionality
└── data/
    └── stops.geojson      # Bus stop data (14,945 stops)
```

## Technologies

- **Leaflet.js** - Interactive mapping
- **OpenStreetMap** - Map tiles
- **GeoJSON** - Geospatial data format
- **Vanilla JavaScript** - Pure client-side (no frameworks)

## Data

**Source**: King County Metro Transit Stop Database  
**Updated**: December 2025  
**Total Stops**: 14,945 active stops  
**Coverage**: Seattle, King County, and surrounding areas

## Usage

### View the Map
1. Open `index.html` in your web browser
2. Explore, search, and click on bus stops for details

### GitHub Pages
1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Access at `https://yourusername.github.io/repo-name`

## Marker Colors

| Color | Routes | Meaning |
|-------|--------|---------|
| 🔵 Blue | 1-2 | Local service |
| 🟠 Orange | 3-5 | Good coverage |
| 🔴 Red | 6+ | Major hub |

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest versions)  
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Data Processing

The original CSV was processed to:
1. Filter only active stops (`IN_SERVICE_FLAG == 'Y'`)
2. Extract stop ID, name, location, routes, accessibility
3. Convert to GeoJSON for efficient mapping

## Customization

**Change map center** (js/main.js, line 1):
```javascript
const map = L.map('map').setView([47.6062, -122.3321], 11);
//                              ^lat      ^lon         ^zoom
```

**Change marker colors**: Edit `getMarkerColor()` in js/main.js

**Update data**: Replace `data/stops.geojson` with new GeoJSON

---

**Made with ❤️ for Seattle transit riders**