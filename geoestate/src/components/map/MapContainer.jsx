"use client";

import { useState, useRef } from "react";
import { Map, NavigationControl } from "react-map-gl/maplibre";
import { DeckGL } from "@deck.gl/react";
import { ColumnLayer } from "deck.gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { HEX_CITIES, CITY_STATE, DEFAULT_HOUSE } from "../../lib/hexData";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// Pre-compute color thresholds once from the static dataset.
const _sorted = HEX_CITIES.map(d => d.avg_price).sort((a, b) => a - b);
const P33     = _sorted[Math.floor(_sorted.length / 3)];
const P66     = _sorted[Math.floor((_sorted.length * 2) / 3)];
const ALL_SAME = P33 === P66;

function hexColor(price) {
  if (ALL_SAME)     return [166, 90,  58,  210]; // uniform → balanced terra
  if (price <= P33) return [69,  99,  75,  200]; // affordable — green
  if (price <= P66) return [166, 90,  58,  215]; // balanced  — terra
  return                   [127, 63,  38,  235]; // premium   — deep clay
}

// Merge static defaults with current filter state for the /predict payload.
function buildHoverFeatures({ city, filters }) {
  return {
    ...DEFAULT_HOUSE,
    City:  city.city,
    State: CITY_STATE[city.id] ?? "Maharashtra",
    BHK:   parseInt(filters.bhk) || 2,
    Availability_Status:
      filters.avail.includes("Ready") ? "Ready_to_Move" : "Under_Construction",
    Parking_Space:
      filters.amenities.includes("Parking")  ? "Yes" : "No",
    Security:
      filters.amenities.includes("Security") ? "Yes" : "No",
    Public_Transport_Accessibility:
      filters.amenities.includes("Transit")  ? "High" : "Medium",
    Nearby_Hospitals:
      filters.amenities.includes("Hospitals") ? 8 : 3,
    Nearby_Schools:
      filters.amenities.includes("Schools")   ? 8 : 5,
  };
}

// lakhs/sqft → "₹13,200/sqft"
function formatPrice(lakhs) {
  return `₹${Math.round(lakhs * 100_000).toLocaleString("en-IN")}/sqft`;
}

const INITIAL_VIEW = {
  longitude: 80.9,
  latitude:  22.0,
  zoom:       4.2,
  pitch:      0,
  bearing:    0,
};

export default function MapContainer({ filters, onCitySelect }) {
  const [hoverInfo, setHoverInfo] = useState(null);
  const [cityPrice, setCityPrice] = useState(null);
  const [loading,   setLoading]   = useState(false);

  const activeCityRef = useRef(null);
  const abortRef      = useRef(null);

  function onHexHover({ object, x, y }) {
    if (!object) {
      setHoverInfo(null);
      setCityPrice(null);
      activeCityRef.current = null;
      return;
    }

    setHoverInfo({ object, x, y });

    // Skip if still over the same city with unchanged filters
    if (activeCityRef.current === object.id) return;
    activeCityRef.current = object.id;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setCityPrice(null);

    fetch(`${API_URL}/predict`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(buildHoverFeatures({ city: object, filters })),
      signal:  ctrl.signal,
    })
      .then(r => r.json())
      .then(data => {
        setCityPrice(
          data.status === "success"
            ? data.predicted_price_per_sqft
            : object.avg_price
        );
        setLoading(false);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) {
          setCityPrice(object.avg_price);
          setLoading(false);
        }
      });
  }

  function onHexClick({ object }) {
    if (object && onCitySelect) {
      onCitySelect({ id: object.id, city: object.city });
    }
  }

  const layers = [
    new ColumnLayer({
      id:             "city-hex-layer",
      data:           HEX_CITIES,
      getPosition:    d => [d.lng, d.lat],
      getFillColor:   d => hexColor(d.avg_price),
      radius:         45000,
      diskResolution: 6,
      extruded:       false,
      stroked:        false,
      pickable:       true,
      opacity:        0.82,
      onHover:        onHexHover,
      onClick:        onHexClick,
    }),
  ];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      <DeckGL
        initialViewState={INITIAL_VIEW}
        controller={true}
        layers={layers}
        style={{ position: "absolute", inset: 0 }}
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json">
          <NavigationControl position="top-right" />
        </Map>
      </DeckGL>

      {hoverInfo && (
        <div
          className="map-city-card"
          style={{ left: hoverInfo.x + 14, top: hoverInfo.y - 104 }}
        >
          <div className="map-city-card-name">{hoverInfo.object.city}</div>
          <div className="map-city-card-divider" />
          <div className="map-city-card-row">
            <span>Model Price</span>
            <span className={loading ? "map-city-card-loading" : ""}>
              {loading ? "—" : cityPrice != null ? formatPrice(cityPrice) : "—"}
            </span>
          </div>
          <div className="map-city-card-row">
            <span>Listings</span>
            <span>{hoverInfo.object.listing_count.toLocaleString("en-IN")}</span>
          </div>
          <div className="map-city-card-hint">Click to select city</div>
        </div>
      )}

    </div>
  );
}
