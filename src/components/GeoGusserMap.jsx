import { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { geoEqualEarth } from "d3-geo";

const worldGeoUrl =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
  
    

// Haversine distance function
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => deg * (Math.PI / 180);
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in km
}

const GeoGusserMap = () => {
  const [guess, setGuess] = useState(null);
  const [locations, setLocations] = useState([]);
  const [clickedCoord, setClickedCoord] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);

  const projection = geoEqualEarth()
    .scale(250)
    .translate([window.innerWidth / 2, window.innerHeight / 2]);

  useEffect(() => {
    fetch("/data/locations.json")
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error("Error loading locations:", err));
  }, []);

  // Find Haridwar location coordinates
  const haridwar = locations.find(
    (loc) => loc.country.toLowerCase() === "haridwar"
  );

  const handleGuess = () => {
    if (locations.length > 0) {
      const randomLocation =
        locations[Math.floor(Math.random() * locations.length)];
      setGuess(randomLocation);
    }
  };

  const handleMapClick = (event) => {
    const { clientX, clientY, currentTarget } = event;
    const bounds = currentTarget.getBoundingClientRect();
    const x = clientX - bounds.left;
    const y = clientY - bounds.top;
    const coords = projection.invert([x, y]);

    if (coords) {
      setClickedCoord(coords);

      if (haridwar) {
        // coords = [lon, lat], haridwar.coordinates = [lon, lat]
        const dist = getDistanceFromLatLonInKm(
          haridwar.coordinates[1],
          haridwar.coordinates[0],
          coords[1],
          coords[0]
        );
        setDistanceKm(dist.toFixed(2));
      } else {
        setDistanceKm(null);
      }
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <ComposableMap
        projection={projection}
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={handleMapClick}
        style={{ position: "absolute", top: 0, left: 0, cursor: "crosshair" }}
      >
        <Geographies geography={worldGeoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#D6D6DA"
                stroke="#FFFFFF"
              />
            ))
          }
        </Geographies>

        {guess && (
          <Marker coordinates={guess.coordinates}>
            <g transform="translate(-12, -24)">
              <path
                d="M12 0C7 0 4 4 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4-3-8-8-8z"
                fill="red"
              />
              <circle cx="12" cy="8" r="3" fill="white" />
            </g>
          </Marker>
        )}

        {clickedCoord && (
          <Marker coordinates={clickedCoord}>
            <g transform="translate(-12, -24)">
              <path
                d="M12 0C7 0 4 4 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4-3-8-8-8z"
                fill="blue"
              />
              <circle cx="12" cy="8" r="3" fill="white" />
            </g>
          </Marker>
        )}
      </ComposableMap>

      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 px-6 py-3 rounded shadow text-center max-w-md">
        <h2 className="text-2xl font-bold mb-2">🌍 GeoGuessr Mini Game</h2>
        <button
          onClick={handleGuess}
          className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          🎯 Guess Random Location
        </button>
        {clickedCoord && (
          <p className="mt-3 text-gray-800 text-lg">
            You clicked at: <br />
            <strong>Lat:</strong> {clickedCoord[1].toFixed(4)},{" "}
            <strong>Lon:</strong> {clickedCoord[0].toFixed(4)}
          </p>
        )}
        {distanceKm !== null && (
          <p className="mt-2 font-semibold text-indigo-700">
            Distance from Haridwar: {distanceKm} km
          </p>
        )}
      </div>
    </div>
  );
};

export default GeoGusserMap;
