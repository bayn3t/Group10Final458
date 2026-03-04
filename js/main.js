// Initialize the map centered on Seattle
const map = L.map('map').setView([47.6062, -122.3321], 11);

// Jurisdiction code mapping
const jurisdictionMap = {
    'BEL': 'Bellevue',
    'SEA': 'Seattle',
    'FDY': 'Federal Way',
    'KNT': 'Kent',
    'NEW': 'Newaukum',
    'COV': 'Covington',
    'MI': 'Mercer Island',
    'DUV': 'Duvall',
    'NOB': 'North Bend',
    'CH': 'Clyde Hill',
    'KCM': 'King County',
    'UNK': 'Unknown',
    'DOT': 'State DOT'
};

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    maxNativeZoom: 18
}).addTo(map);

// Store data globally
let allStops = [];
let filteredStops = [];
let markerGroup = L.markerClusterGroup({
    maxClusterRadius: 60,
    disableClusteringAtZoom: 16
});

// Color scheme for markers based on number of routes
function getMarkerColor(routeCount) {
    if (!routeCount || routeCount === 'No routes') return '#667eea';
    const count = parseInt(routeCount) || 0;
    if (count <= 2) return '#667eea';      // Purple - small
    if (count <= 5) return '#2196F3';      // Blue - medium
    return '#00BCD4';                      // Teal - large
}

// Create custom marker icon
function createMarkerIcon(color) {
    return L.icon({
        iconUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${encodeURIComponent(color)}" width="28" height="28"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
        className: 'bus-stop-marker'
    });
}

// Create popup content
function createPopupContent(feature) {
    const props = feature.properties;
    const routesArray = props.routes_serving ? props.routes_serving.split(',').map(r => r.trim()) : [];
    
    let html = '<div class="popup-content">';
    html += '<div class="popup-header">';
    html += `<div class="stop-name">${props.stop_name || 'Unknown Stop'}</div>`;
    html += `<div class="stop-id">Stop #${props.stop_id}</div>`;
    html += '</div>';
    
    html += '<div class="popup-info">';
    
    // Routes serving - Main focus
    html += '<div class="popup-info-row" style="margin-bottom: 14px;">';
    html += '<div style="width: 100%;">';
    html += '<div class="info-label" style="margin-bottom: 6px;">Routes Serving</div>';
    if (routesArray.length > 0) {
        routesArray.forEach(route => {
            if (route) {
                html += `<span class="routes-badge">${route}</span>`;
            }
        });
    } else {
        html += '<span style="color: #999; font-size: 12px;">No routes assigned</span>';
    }
    html += '</div>';
    html += '</div>';
    
    // Location / Jurisdiction
    if (props.jurisdiction) {
        const jurisdictionName = jurisdictionMap[props.jurisdiction] || props.jurisdiction;
        html += `<div class="popup-info-row">`;
        html += `<div class="info-label">Service Area</div>`;
        html += `<div class="info-value">${jurisdictionName}</div>`;
        html += `</div>`;
    }
    
    // Shelter
    const shelterClass = props.has_shelter === 'Yes' ? 'yes' : 'no';
    const shelterIcon = props.has_shelter === 'Yes' ? '✓' : '✗';
    html += `<div class="popup-info-row">`;
    html += `<div class="info-label">Shelter</div>`;
    html += `<div><span class="shelter-badge ${shelterClass}">${shelterIcon} ${props.has_shelter}</span></div>`;
    html += `</div>`;
    
    // Accessibility
    const accessClass = props.accessibility.includes('ADA') ? 'yes' : 'no';
    const accessIcon = props.accessibility.includes('ADA') ? '♿' : '—';
    html += `<div class="popup-info-row">`;
    html += `<div class="info-label">Accessible</div>`;
    html += `<div><span class="accessibility ${accessClass}">${accessIcon} ${props.accessibility}</span></div>`;
    html += `</div>`;
    
    html += '</div>';
    html += '</div>';
    
    return html;
}

// Load GeoJSON data
async function loadStops() {
    try {
        const response = await fetch('data/stops.geojson');
        if (!response.ok) throw new Error('Failed to load stops data');
        
        const data = await response.json();
        allStops = data.features;
        
        // Update stop count
        document.querySelector('.stop-count').textContent = `${allStops.length.toLocaleString()} Active Stops`;
        
        // Add all stops to map
        displayStops(allStops);
        
        // Fit map to bounds
        if (allStops.length > 0) {
            const bounds = L.latLngBounds(
                allStops.map(stop => [
                    stop.properties.stop_lat,
                    stop.properties.stop_lon
                ])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
        
    } catch (error) {
        console.error('Error loading stops:', error);
        document.querySelector('.stop-count').textContent = 'Error loading stops';
    }
}

// Display stops on map
function displayStops(stops) {
    markerGroup.clearLayers();
    
    stops.forEach(feature => {
        const props = feature.properties;
        const color = getMarkerColor(props.routes_serving);
        
        const marker = L.marker(
            [props.stop_lat, props.stop_lon],
            { icon: createMarkerIcon(color) }
        );
        
        marker.bindPopup(createPopupContent(feature), {
            maxWidth: 300,
            className: 'stop-popup'
        });
        
        // Add click event for analytics (optional)
        marker.on('click', function() {
            console.log(`Clicked stop: ${props.stop_name}`);
        });
        
        markerGroup.addLayer(marker);
    });
    
    map.addLayer(markerGroup);
}

// Search mode state
let searchMode = 'route'; // 'route' or 'location'

// Toggle button handlers
document.getElementById('mode-route').addEventListener('click', function() {
    searchMode = 'route';
    document.getElementById('mode-route').classList.add('active');
    document.getElementById('mode-location').classList.remove('active');
    document.getElementById('search-input').placeholder = 'Search routes...';
    // Re-run search with current query
    const query = document.getElementById('search-input').value;
    if (query.trim()) {
        document.getElementById('search-input').dispatchEvent(new Event('input'));
    }
});

document.getElementById('mode-location').addEventListener('click', function() {
    searchMode = 'location';
    document.getElementById('mode-location').classList.add('active');
    document.getElementById('mode-route').classList.remove('active');
    document.getElementById('search-input').placeholder = 'Search locations...';
    // Re-run search with current query
    const query = document.getElementById('search-input').value;
    if (query.trim()) {
        document.getElementById('search-input').dispatchEvent(new Event('input'));
    }
});

// Search functionality
document.getElementById('search-input').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length === 0) {
        displayStops(allStops);
        return;
    }
    
    filteredStops = allStops.filter(stop => {
        const props = stop.properties;
        
        if (searchMode === 'route') {
            // Search only by route number (exact match)
            const routes = (props.routes_serving || '');
            const routeArray = routes.split(/\s+/).map(r => r.trim()).filter(r => r);
            return routeArray.some(route => route === query);
        } else {
            // Search only by location name (partial match)
            const stopName = (props.stop_name || '').toLowerCase();
            return stopName.includes(query);
        }
    });
    
    displayStops(filteredStops);
    
    // Show message if no results
    if (filteredStops.length === 0) {
        console.log(`No stops found matching: ${query}`);
    }
});

// Clear search
document.getElementById('clear-search').addEventListener('click', function() {
    document.getElementById('search-input').value = '';
    displayStops(allStops);
});

// Load data when page loads
window.addEventListener('load', loadStops);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.getElementById('search-input').value = '';
        displayStops(allStops);
    }
});
