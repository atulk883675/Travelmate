import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import { calculateRoute } from "../../services/routingservices";

// Automatically adjust the map to show the complete route
const MapUpdater = ({ routeCoordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates.length > 0) {
      map.fitBounds(routeCoordinates, {
        padding: [40, 40],
        animate: true,
      });
    }
  }, [routeCoordinates, map]);

  return null;
};

const DestinationMap = ({
  latitude,
  longitude,
  destination,
  startLocation,
}) => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoute = async () => {
      if (!startLocation) {
        setRoute(null);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await calculateRoute(startLocation, {
          latitude,
          longitude,
        });

        setRoute(response.route);
      } catch (err) {
        console.error("Route Fetch Error:", err);
        setRoute(null);
        setError(
          err.response?.data?.message ||
          "Unable to calculate the route."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [latitude, longitude, startLocation]);

  const routeCoordinates =
    route?.geometry?.coordinates?.map(
      ([lng, lat]) => [lat, lng]
    ) || [];

  return (
    <div className="destination-map">
      {loading && <p>Calculating route...</p>}

      {error && <p className="error-message">{error}</p>}

      {route && (
        <div className="route-summary">
          <p>
            **Distance:** {route.distance} km
          </p>
          <p>
            **Estimated duration:**{" "}
            {Math.round(route.duration)} minutes
          </p>
        </div>
      )}

      <MapContainer
        center={[latitude, longitude]}
        zoom={12}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        touchZoom={true}
        zoomControl={true}
        keyboard={true}
        style={{ height: "400px", width: "100%", cursor: "grab" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {startLocation && (
          <Marker
            position={[
              startLocation.latitude,
              startLocation.longitude,
            ]}
          >
            <Popup>Starting Location</Popup>
          </Marker>
        )}

        <Marker position={[latitude, longitude]}>
          <Popup>
            <strong>{destination}</strong>
          </Popup>
        </Marker>

        {routeCoordinates.length > 0 && (
          <>
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "blue",
                weight: 5,
              }}
            />

            <MapUpdater routeCoordinates={routeCoordinates} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default DestinationMap;