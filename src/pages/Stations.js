import BookingModal from '../components/BookingModal';
import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import API from '../api/axios';
import {
    MapContainer, TileLayer, Marker, Popup,
    Circle, useMap, LayersControl
} from 'react-leaflet';

const { BaseLayer } = LayersControl;


// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Green marker — stations
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Blue marker — user location
const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [30, 46],
    iconAnchor: [15, 46],
    popupAnchor: [1, -34],
});

// Map view update
function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

// Routing component
function RoutingControl({ from, to, onRouteFound }) {

    const map = useMap();

    const routeRef = useRef(null);

    const popupRef = useRef(null);

    useEffect(() => {

    if (!from || !to) {

        // REMOVE ROUTE
        if (routeRef.current) {
            map.removeLayer(routeRef.current);
            routeRef.current = null;
        }

        // REMOVE POPUP
        if (popupRef.current) {
            map.removeLayer(popupRef.current);
            popupRef.current = null;
        }

        return;
    }

    let isMounted = true;

    const fetchRoute = async () => {

        try {

            // REMOVE OLD ROUTE
            if (routeRef.current) {
                map.removeLayer(routeRef.current);
                routeRef.current = null;
            }

            // REMOVE OLD POPUP
            if (popupRef.current) {
                map.removeLayer(popupRef.current);
                popupRef.current = null;
            }

            const url =
                `https://router.project-osrm.org/route/v1/driving/` +
                `${from.lng},${from.lat};${to.lng},${to.lat}` +
                `?overview=full&geometries=geojson`;

            const response = await fetch(url);

            const data = await response.json();

            if (!isMounted) return;

            if (!data.routes || data.routes.length === 0) return;

            const route = data.routes[0];

            const coords = route.geometry.coordinates.map(
                ([lng, lat]) => [lat, lng]
            );

            // ROUTE LINE
            const polyline = L.polyline(coords, {
                color: '#1976d2',
                weight: 6,
                opacity: 1,
            }).addTo(map);

            routeRef.current = polyline;

            // DISTANCE
            const distanceKm =
                (route.distance / 1000).toFixed(1);

            // TIME
            const durationMin =
                Math.round(route.duration / 60);

            const hours =
                Math.floor(durationMin / 60);

            const mins =
                durationMin % 60;

            const timeStr =
                hours > 0
                    ? `${hours}h ${mins}m`
                    : `${mins} min`;

            // MID POINT
            const midIndex =
                Math.floor(coords.length / 2);

            // POPUP WITH CLOSE BUTTON
            const popup = L.popup({
                closeButton: true,
                autoClose: false,
                closeOnClick: false,
            })
                .setLatLng(coords[midIndex])
                .setContent(`
                    <div style="
                        padding:10px;
                        min-width:150px;
                        font-family:Segoe UI;
                    ">
                        <div style="
                            font-weight:bold;
                            color:#1976d2;
                            font-size:16px;
                            margin-bottom:5px;
                        ">
                            📏 ${distanceKm} km
                        </div>

                        <div style="
                            color:#2d6a4f;
                            font-weight:bold;
                        ">
                            🚗 ${timeStr}
                        </div>

                        <div style="
                            margin-top:5px;
                            color:#666;
                            font-size:13px;
                        ">
                            📍 ${to.name}
                        </div>
                    </div>
                `)
                .addTo(map);

            popupRef.current = popup;

            if (onRouteFound) {
                onRouteFound({
                    distanceKm,
                    timeStr,
                });
            }

        } catch (err) {

            console.log(err);
        }
    };

    fetchRoute();

    return () => {

        isMounted = false;

        if (routeRef.current) {
            map.removeLayer(routeRef.current);
            routeRef.current = null;
        }

        if (popupRef.current) {
            map.removeLayer(popupRef.current);
            popupRef.current = null;
        }
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [from, to, map]);
return null;
}

// Distance calculate — Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

// Travel time
function getTravelTime(distanceKm) {
    const minutes = Math.round((distanceKm / 40) * 60);
    if (minutes < 60) return `~${minutes} min`;
    return `~${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function Stations() {
    const [stations, setStations] = useState([]);
    const [filteredStations, setFilteredStations] = useState([]);
    const [nearbyStations, setNearbyStations] = useState([]);
    const [searchCity, setSearchCity] = useState('');
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
    const [mapZoom, setMapZoom] = useState(5);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [routeDetails, setRouteDetails] = useState(null);
    const [routeActive, setRouteActive] = useState(false);
    const [bookingStation, setBookingStation] = useState(null);

    useEffect(() => {
        fetchStations();
        getUserLocation();
    }, []);

    const fetchStations = async () => {
        try {
            const res = await API.get('/stations');
            setStations(res.data);
            setFilteredStations(res.data);
        } catch (err) {
            console.error('Failed to load stations');
        } finally {
            setLoading(false);
        }
    };

    const getUserLocation = () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            setMapCenter([latitude, longitude]);
            setMapZoom(12);
            setLocationLoading(false);
        },
        (error) => {
            console.error('Location error:', error);
            setLocationLoading(false);
        },
        {
            enableHighAccuracy: true,  // Use GPS for precise location
            timeout: 10000,            // Wait up to 10 seconds
            maximumAge: 0,             // Don't use cached location
        }
        );
    };

    // Nearby stations — 50km radius
    useEffect(() => {
        if (userLocation && stations.length > 0) {
            const nearby = stations
                .map(s => ({
                    ...s,
                    distance: parseFloat(calculateDistance(
                        userLocation.lat, userLocation.lng,
                        s.latitude, s.longitude
                    ))
                }))
                .filter(s => s.distance <= 50)
                .sort((a, b) => a.distance - b.distance);
            setNearbyStations(nearby);
        }
    }, [userLocation, stations]);

    const handleSearch = async () => {
    const query = searchCity.trim();
    if (!query) {
        setFilteredStations(stations);
        setMapCenter([20.5937, 78.9629]);
        setMapZoom(5);
        return;
    }

    const localMatches = stations.filter(s =>
        s.city?.toLowerCase().includes(query.toLowerCase()) ||
        s.state?.toLowerCase().includes(query.toLowerCase())
    );

    const addDistance = (items) => items.map(s => ({
        ...s,
        distance: userLocation
            ? parseFloat(calculateDistance(
                userLocation.lat, userLocation.lng,
                s.latitude, s.longitude
            ))
            : null,
    }));

    if (localMatches.length > 0) {
        const results = addDistance(localMatches);
        setFilteredStations(results);

        if (results.length === 1) {
            setMapCenter([results[0].latitude, results[0].longitude]);
            setMapZoom(13);
        } else {
            const lats = results.map(s => s.latitude);
            const lngs = results.map(s => s.longitude);
            const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
            const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
            setMapCenter([centerLat, centerLng]);
            setMapZoom(11);
        }
        return;
    }

    try {
        const res = await API.get(
            `/stations/search?city=${query}`
        );

        const withDistance = addDistance(res.data);
        setFilteredStations(withDistance);

        if (res.data.length > 0) {
            if (res.data.length === 1) {
                setMapCenter([res.data[0].latitude, res.data[0].longitude]);
                setMapZoom(13);
            } else {
                const lats = res.data.map(s => s.latitude);
                const lngs = res.data.map(s => s.longitude);
                const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
                const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
                setMapCenter([centerLat, centerLng]);
                setMapZoom(11);
            }
        } else {
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
            );
            const geoData = await geoRes.json();

            if (geoData.length > 0) {
                setMapCenter([
                    parseFloat(geoData[0].lat),
                    parseFloat(geoData[0].lon),
                ]);
                setMapZoom(12);
            }
        }
    } catch (err) {
        console.error('Search failed!', err);
    }
};

    const getDirections = (station) => {
    const distance = userLocation
        ? calculateDistance(
            userLocation.lat, userLocation.lng,
            station.latitude, station.longitude
          )
        : null;

    // Hide previous route UI until the new route is fully ready
    setRouteDetails(null);
    setRouteActive(false);

    setSelectedRoute({
        lat: station.latitude,
        lng: station.longitude,
        name: station.name,
        distance: distance,
        time: distance ? getTravelTime(distance) : '',
    });

    window.scrollTo({ top: 300, behavior: 'smooth' });
    };


    const citySuggestions = useMemo(() => {
        const query = searchCity.trim().toLowerCase();
        const suggestionSet = new Set();

        stations.forEach(station => {
            if (station.city) {
                const city = station.city.trim();
                if (city && (!query || city.toLowerCase().includes(query))) {
                    suggestionSet.add(city);
                }
            }
            if (station.state) {
                const state = station.state.trim();
                if (state && (!query || state.toLowerCase().includes(query))) {
                    suggestionSet.add(state);
                }
            }
        });

        return Array.from(suggestionSet).slice(0, 8);
    }, [stations, searchCity]);

    const displayStations = activeTab === 'nearby' ? nearbyStations : filteredStations;

    if (loading) return (
        <div style={styles.loadingBox}>
            <p style={{ fontSize: '3rem' }}>⚡</p>
            <p>Loading stations...</p>
        </div>
    );

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.headerTitle}>📍 EV Charging Stations</h1>
                <p style={styles.headerSub}>
                    {userLocation
                        ? `📡 Location detected — ${nearbyStations.length} stations within 50km`
                        : 'Find charging stations near you'}
                </p>
            </div>

            <div style={styles.content}>

                {/* Search Bar */}
                <div style={styles.searchBar}>
                    <div style={styles.searchInputWrapper}>
                        <input
                            type="text"
                            placeholder="Search by city or state (Pune, Maharashtra, Delhi)"
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={styles.searchInput}
                        />
                        {searchCity && citySuggestions.length > 0 && (
                            <div style={styles.suggestionsList}>
                                {citySuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        style={styles.suggestionItem}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                            setSearchCity(suggestion);
                                            handleSearch();
                                        }}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={handleSearch} style={styles.searchBtn}>
                        Search
                    </button>
                    {searchCity && (
                        <button onClick={() => {
                            setSearchCity('');
                            setFilteredStations(stations);
                        }} style={styles.clearBtn}>
                            ✕
                        </button>
                    )}
                    <button
                        onClick={() => {
                            getUserLocation();
                            setActiveTab('nearby');
                        }}
                        style={styles.nearbyBtn}
                        disabled={locationLoading}
                    >
                        {locationLoading ? '📡 Detecting...' : '📍 Near Me'}
                    </button>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    <button
                        style={activeTab === 'all' ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab('all')}
                    >
                        🗺️ All Stations
                    </button>
                    <button
                        style={activeTab === 'nearby' ? styles.tabActive : styles.tab}
                        onClick={() => {
                            setActiveTab('nearby');
                            if (userLocation) {
                                setMapCenter([userLocation.lat, userLocation.lng]);
                                setMapZoom(11);
                            } else {
                                getUserLocation();
                            }
                        }}
                    >
                        📍 Nearby
                    </button>
                </div>

                {/* Route Banner */}
                    {selectedRoute && routeActive && (
                    <div style={styles.routeBanner}>
                    <div style={styles.routeBannerLeft}>
                    <span>🗺️ <strong>Aapki Location</strong> → <strong>{selectedRoute.name}</strong></span>
                    <span style={styles.routeDetails}>
                        {routeDetails ? (
                            <>📏 {routeDetails.distanceKm} km &nbsp;|&nbsp; 🚗 {routeDetails.timeStr} &nbsp;|&nbsp;</>
                        ) : selectedRoute.distance ? (
                            <>📏 {selectedRoute.distance} km &nbsp;|&nbsp; 🚗 {selectedRoute.time} &nbsp;|&nbsp;</>
                        ) : (
                            <>Loading route... &nbsp;|&nbsp;</>
                        )}
                        ⛽ Road Route
                    </span>
                    </div>
                    <button
                    style={styles.clearRouteBtn}
                    onClick={() => {

                    setSelectedRoute(null);

                    setRouteDetails(null);

                    setRouteActive(false);
}}
                    >
                    ✕ Clear Route
                    </button>
                    </div>
                    )}

                {/* Map */}
                <div style={styles.mapWrapper}>
                    <MapContainer
                        center={mapCenter}
                        zoom={mapZoom}
                        style={{ width: '100%', height: '500px' }}
                    >
                        <MapUpdater center={mapCenter} zoom={mapZoom} />

                        <LayersControl position="topright">

                            {/* Street View */}
                            <BaseLayer checked name="🗺️ Street View">
                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                            </BaseLayer>

                            {/* Satellite View */}
                            <BaseLayer name="🛰️ Satellite View">
                                <TileLayer
                                    attribution='&copy; Esri'
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                />
                            </BaseLayer>

                            {/* Terrain View */}
                            <BaseLayer name="🏔️ Terrain View">
                                <TileLayer
                                    attribution='&copy; OpenTopoMap'
                                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                                />
                            </BaseLayer>

                            {/* Dark View */}
                            <BaseLayer name="🌙 Dark View">
                                <TileLayer
                                    attribution='&copy; CartoDB'
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                />
                            </BaseLayer>

                        </LayersControl>

                        {/* Routing */}
                           {userLocation && selectedRoute && (
                            <RoutingControl
                            from={userLocation}
                            to={selectedRoute}
                            onRouteFound={(details) => {
                                setRouteDetails(details);
                                setRouteActive(true);
                            }}
                            />
                        )}

                        {/* User Location */}
                        {userLocation && (
                            <>
                                <Marker
                                    position={[userLocation.lat, userLocation.lng]}
                                    icon={blueIcon}
                                >
                                    <Popup>
                                        <div style={{ textAlign: 'center' }}>
                                            <strong>📍 Aap Yahan Ho!</strong><br />
                                            <small>Your current location</small>
                                        </div>
                                    </Popup>
                                </Marker>
                                <Circle
                                    center={[userLocation.lat, userLocation.lng]}
                                    radius={50000}
                                    pathOptions={{
                                        color: '#1a73e8',
                                        fillColor: '#1a73e8',
                                        fillOpacity: 0.05,
                                        dashArray: '5 5',
                                    }}
                                />
                            </>
                        )}

                        {/* Station Markers */}
                        {displayStations.map(station => (
                            <Marker
                                key={station.id}
                                position={[station.latitude, station.longitude]}
                                icon={greenIcon}
                            >
                                <Popup minWidth={220}>
                                    <div style={styles.popup}>
                                        <h4 style={styles.popupTitle}>
                                            ⚡ {station.name}
                                        </h4>
                                        <p style={styles.popupRow}>
                                            📍 {station.address}
                                        </p>
                                        <p style={styles.popupRow}>
                                            🏙️ {station.city}, {station.state}
                                        </p>
                                        <p style={styles.popupRow}>
                                            🔌 Slots:{' '}
                                            <strong style={{
                                                color: station.availableChargers > 0
                                                    ? 'green' : 'red'
                                            }}>
                                                {station.availableChargers}/{station.totalChargers}
                                            </strong>
                                        </p>
                                        <p style={styles.popupRow}>
                                            💰 ₹{station.pricePerUnit}/unit
                                        </p>
                                        {station.distance && (
                                            <div style={styles.popupDistance}>
                                                🚗 {station.distance} km •{' '}
                                                {getTravelTime(station.distance)}
                                            </div>
                                        )}
                                        {userLocation ? (
                                            <button
                                                style={styles.directionsBtn}
                                                onClick={() => getDirections(station)}
                                            >
                                                🗺️ Get Directions
                                            </button>
                                        ) : (
                                            <button
                                                style={styles.directionsBtn}
                                                onClick={getUserLocation}
                                            >
                                                📍 Enable Location First
                                            </button>
                                        )}
                                        <button
                                            style={styles.popupBtn}
                                            onClick={() => setBookingStation(station)}
                                        >
                                            🔋 Book Now
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Nearby Stations List */}
                {activeTab === 'nearby' && (
                    <div style={styles.nearbySection}>
                        <h2 style={styles.nearbyTitle}>
                            📍 Nearby Stations — Sorted by Distance
                        </h2>
                        {nearbyStations.length === 0 ? (
                            <div style={styles.noResult}>
                                <p>😕 not found any station in 50km radius </p>
                            </div>
                        ) : (
                            <div style={styles.nearbyList}>
                                {nearbyStations.map((station, i) => (
                                    <div key={station.id} style={styles.nearbyCard}>
                                        <div style={styles.rankBadge}>#{i + 1}</div>
                                        <div style={styles.nearbyInfo}>
                                            <h3 style={styles.nearbyName}>
                                                ⚡ {station.name}
                                            </h3>
                                            <p style={styles.nearbyAddress}>
                                                📍 {station.address}, {station.city}
                                            </p>
                                            <div style={styles.nearbyStats}>
                                                <span style={{
                                                    ...styles.slotBadge,
                                                    backgroundColor: station.availableChargers > 0
                                                        ? '#d8f3dc' : '#ffe0e0',
                                                    color: station.availableChargers > 0
                                                        ? '#2d6a4f' : '#e63946',
                                                }}>
                                                    🔌 {station.availableChargers}/{station.totalChargers} slots
                                                </span>
                                                <span style={styles.priceBadge}>
                                                    💰 ₹{station.pricePerUnit}/unit
                                                </span>
                                            </div>
                                        </div>
                                        <div style={styles.distanceBox}>
                                            <p style={styles.distanceNum}>
                                                {station.distance} km
                                            </p>
                                            <p style={styles.distanceTime}>
                                                🚗 {getTravelTime(station.distance)}
                                            </p>
                                            <button
                                                style={styles.directionsSmallBtn}
                                                onClick={() => getDirections(station)}
                                            >
                                                🗺️ Directions
                                            </button>
                                            <button style={styles.bookSmallBtn}>
                                                Book →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Search Results */}
                {activeTab === 'all' && searchCity && (
                    <div style={styles.nearbySection}>
                        <h2 style={styles.nearbyTitle}>
                            🔍 "{searchCity}" — {filteredStations.length} stations found
                        </h2>
                        {filteredStations.length === 0 ? (
                            <div style={styles.noResult}>
                                <p>😕 Not found any Station"{searchCity}" In</p>
                            </div>
                        ) : (
                            <div style={styles.nearbyList}>
                                {filteredStations.map((station) => (
                                    <div key={station.id} style={styles.nearbyCard}>
                                        <div style={styles.nearbyInfo}>
                                            <h3 style={styles.nearbyName}>
                                                ⚡ {station.name}
                                            </h3>
                                            <p style={styles.nearbyAddress}>
                                                📍 {station.address}, {station.city}
                                            </p>
                                            <div style={styles.nearbyStats}>
                                                <span style={{
                                                    ...styles.slotBadge,
                                                    backgroundColor: station.availableChargers > 0
                                                        ? '#d8f3dc' : '#ffe0e0',
                                                    color: station.availableChargers > 0
                                                        ? '#2d6a4f' : '#e63946',
                                                }}>
                                                    🔌 {station.availableChargers}/{station.totalChargers} slots
                                                </span>
                                                <span style={styles.priceBadge}>
                                                    💰 ₹{station.pricePerUnit}/unit
                                                </span>
                                            </div>
                                        </div>
                                        {station.distance && (
                                            <div style={styles.distanceBox}>
                                                <p style={styles.distanceNum}>
                                                    {station.distance} km
                                                </p>
                                                <p style={styles.distanceTime}>
                                                    🚗 {getTravelTime(station.distance)}
                                                </p>
                                                <button
                                                    style={styles.directionsSmallBtn}
                                                    onClick={() => getDirections(station)}
                                                >
                                                    🗺️ Directions
                                                </button>
                                                <button
                                                    style={styles.bookSmallBtn}
                                                    onClick={() => setBookingStation(station)}
                                                >
                                                    Book →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {bookingStation && (
                    <BookingModal
                        station={bookingStation}
                        onClose={() => setBookingStation(null)}
                        onSuccess={() => {
                            fetchStations();
                            setBookingStation(null);
                        }}
                    />
                )}

            </div>
        </div>
    );
}

const styles = {
    container: { backgroundColor: '#f0f2f5', minHeight: '100vh' },
    header: {
        background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
        color: 'white',
        padding: '2rem',
        textAlign: 'center',
    },
    headerTitle: { fontSize: '2rem', marginBottom: '0.3rem' },
    headerSub: { opacity: 0.9, fontSize: '1rem' },
    content: { padding: '1.5rem 2rem' },
    searchBar: {
        display: 'flex',
        gap: '0.8rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
    },
    searchInput: {
        flex: 1,
        padding: '0.8rem 1rem',
        borderRadius: '8px',
        border: '2px solid #2d6a4f',
        fontSize: '1rem',
        minWidth: '200px',
        outline: 'none',
    },
    searchInputWrapper: {
        position: 'relative',
        flex: 1,
        minWidth: '200px',
    },
    suggestionsList: {
        position: 'absolute',
        top: 'calc(100% + 0.4rem)',
        width: '100%',
        maxHeight: '240px',
        overflowY: 'auto',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        zIndex: 20,
    },
    suggestionItem: {
        width: '100%',
        padding: '0.75rem 1rem',
        textAlign: 'left',
        backgroundColor: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.95rem',
        color: '#333',
    },
    searchBtn: {
        padding: '0.8rem 1.5rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    clearBtn: {
        padding: '0.8rem 1rem',
        backgroundColor: '#e63946',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    nearbyBtn: {
        padding: '0.8rem 1.2rem',
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    tabs: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    tab: {
        padding: '0.6rem 1.5rem',
        backgroundColor: 'white',
        color: '#666',
        border: '1px solid #ddd',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    tabActive: {
        padding: '0.6rem 1.5rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    },
    routeBanner: {
        backgroundColor: '#1a73e8',
        color: 'white',
        padding: '0.8rem 1.2rem',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.8rem',
    },
    routeBannerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    },
    routeDetails: {
    fontSize: '0.9rem',
    opacity: 0.9,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '0.2rem 0.8rem',
    borderRadius: '20px',
    display: 'inline-block',
    },
    clearRouteBtn: {
        backgroundColor: 'white',
        color: '#1a73e8',
        border: 'none',
        padding: '0.3rem 0.8rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    mapWrapper: {
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        marginBottom: '1.5rem',
    },
    popup: { minWidth: '200px', padding: '0.3rem' },
    popupTitle: { color: '#2d6a4f', margin: '0 0 0.5rem' },
    popupRow: { margin: '0.3rem 0', fontSize: '0.9rem' },
    popupDistance: {
        backgroundColor: '#e8f5e9',
        color: '#2d6a4f',
        padding: '0.4rem 0.6rem',
        borderRadius: '6px',
        fontSize: '0.85rem',
        margin: '0.5rem 0',
        fontWeight: 'bold',
    },
    directionsBtn: {
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '0.4rem',
        fontWeight: 'bold',
    },
    popupBtn: {
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '0.4rem',
    },
    nearbySection: { marginTop: '0.5rem' },
    nearbyTitle: {
        color: '#2d6a4f',
        marginBottom: '1rem',
        fontSize: '1.3rem',
    },
    nearbyList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
    },
    nearbyCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.2rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #e8f5e9',
    },
    rankBadge: {
        backgroundColor: '#2d6a4f',
        color: 'white',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        flexShrink: 0,
    },
    nearbyInfo: { flex: 1 },
    nearbyName: {
        color: '#1b4332',
        margin: '0 0 0.3rem',
        fontSize: '1rem',
    },
    nearbyAddress: {
        color: '#666',
        fontSize: '0.85rem',
        margin: '0 0 0.5rem',
    },
    nearbyStats: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    slotBadge: {
        padding: '0.2rem 0.7rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    priceBadge: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '0.2rem 0.7rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    distanceBox: {
        textAlign: 'center',
        minWidth: '90px',
        flexShrink: 0,
    },
    distanceNum: {
        fontSize: '1.4rem',
        fontWeight: 'bold',
        color: '#1a73e8',
        margin: 0,
    },
    distanceTime: {
        fontSize: '0.8rem',
        color: '#666',
        margin: '0.2rem 0 0.5rem',
    },
    directionsSmallBtn: {
        padding: '0.3rem 0.8rem',
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        marginBottom: '0.3rem',
        width: '100%',
    },
    bookSmallBtn: {
        padding: '0.3rem 0.8rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        width: '100%',
    },
    loadingBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
    },
    noResult: {
        textAlign: 'center',
        padding: '2rem',
        color: '#666',
        backgroundColor: 'white',
        borderRadius: '12px',
    },
};

export default Stations;