'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MapContainer from '../../components/map/MapContainer';
import { CITY_STATE, DEFAULT_HOUSE } from '../../lib/hexData';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

const BHK_OPTIONS     = ['1', '2', '3', '4+'];
const AVAIL_OPTIONS   = ['Ready', 'Under Const.'];
const AMENITY_OPTIONS = ['Parking', 'Security', 'Transit', 'Hospitals', 'Schools'];
const ZOOM_LEVELS     = ['India', 'City', 'Locality'];
const MAP_MODES       = ['Hexbin', 'Heatmap', 'Points'];

// Cities used in the bottom panels (fixed anchors)
const PULSE_CITIES = [
  { id: 'bangalore', city: 'Bangalore' },
  { id: 'mumbai',    city: 'Mumbai'    },
  { id: 'new_delhi', city: 'New Delhi' },
];
const COMP_A = { id: 'mumbai', city: 'Mumbai' };
const COMP_B = { id: 'pune',   city: 'Pune'   };

// Build the /predict payload from current filter state + city + sqft.
// Maps UI filter labels → model feature values.
function buildFeatures({ city, bhk, avail, amenities, sqft = 1000 }) {
  return {
    ...DEFAULT_HOUSE,
    City:  city.city,
    State: CITY_STATE[city.id] ?? 'Maharashtra',
    BHK:   parseInt(bhk) || 2,
    Size_in_SqFt: parseInt(sqft) || 1000,
    Availability_Status:
      avail.includes('Ready') ? 'Ready_to_Move' : 'Under_Construction',
    Parking_Space:
      amenities.includes('Parking')  ? 'Yes' : 'No',
    Security:
      amenities.includes('Security') ? 'Yes' : 'No',
    Public_Transport_Accessibility:
      amenities.includes('Transit')   ? 'High' : 'Medium',
    Nearby_Hospitals:
      amenities.includes('Hospitals') ? 8 : 3,
    Nearby_Schools:
      amenities.includes('Schools')   ? 8 : 5,
  };
}

// Call /predict and return predicted_price_per_sqft (lakhs/sqft), or null on error.
async function callPredict(features) {
  try {
    const r = await fetch(`${API_URL}/predict`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(features),
    });
    const data = await r.json();
    return data.status === 'success' ? data.predicted_price_per_sqft : null;
  } catch {
    return null;
  }
}

// Price_per_SqFt from the model is in lakhs/sqft → × 100,000 → ₹/sqft
function fmtPrice(lakhs) {
  if (lakhs == null) return '—';
  return `₹${Math.round(lakhs * 100_000).toLocaleString('en-IN')}/sqft`;
}

function toggle(setter, value) {
  setter(prev =>
    prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
  );
}

export default function DashboardPage() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [activeBHK,       setActiveBHK]       = useState(['2']);
  const [activeAvail,     setActiveAvail]     = useState(['Ready']);
  const [activeAmenities, setActiveAmenities] = useState([]);
  const [activeZoom,      setActiveZoom]      = useState('India');
  const [activeMode,      setActiveMode]      = useState('Hexbin');

  // ── Map interaction ───────────────────────────────────────────────────────
  // selectedCity is set by clicking a hex; drives the Price Predictor
  const [selectedCity, setSelectedCity] = useState({ id: 'mumbai', city: 'Mumbai' });

  // ── Bottom panel state ────────────────────────────────────────────────────
  const [sqft,           setSqft]          = useState('1000');
  const [predictorPrice, setPredictorPrice] = useState(null);
  const [pulseData,      setPulseData]     = useState([null, null, null]);
  const [compData,       setCompData]      = useState([null, null]);

  const sqftTimer = useRef(null);

  // Shorthand for the current filter args object (read-only snapshot)
  const filterArgs = {
    bhk:       activeBHK[0] ?? '2',
    avail:     activeAvail,
    amenities: activeAmenities,
  };

  // ── Price Predictor ───────────────────────────────────────────────────────
  // Re-runs when sqft (debounced), selectedCity, or any filter changes.
  useEffect(() => {
    clearTimeout(sqftTimer.current);
    setPredictorPrice(null);
    sqftTimer.current = setTimeout(() => {
      callPredict(buildFeatures({ city: selectedCity, ...filterArgs, sqft }))
        .then(setPredictorPrice);
    }, 350);
    return () => clearTimeout(sqftTimer.current);
  }, [sqft, selectedCity, activeBHK, activeAvail, activeAmenities]); // eslint-disable-line

  // ── Market Pulse ──────────────────────────────────────────────────────────
  // 3 fixed city predictions at 1000 sqft; updates when filters change.
  useEffect(() => {
    setPulseData([null, null, null]);
    Promise.all(
      PULSE_CITIES.map(city =>
        callPredict(buildFeatures({ city, ...filterArgs, sqft: 1000 }))
      )
    ).then(setPulseData);
  }, [activeBHK, activeAvail, activeAmenities]); // eslint-disable-line

  // ── Area Comparison ───────────────────────────────────────────────────────
  // Mumbai vs Pune at 1000 sqft; updates when filters change.
  useEffect(() => {
    setCompData([null, null]);
    Promise.all([
      callPredict(buildFeatures({ city: COMP_A, ...filterArgs, sqft: 1000 })),
      callPredict(buildFeatures({ city: COMP_B, ...filterArgs, sqft: 1000 })),
    ]).then(setCompData);
  }, [activeBHK, activeAvail, activeAmenities]); // eslint-disable-line

  // Derived bar widths for Area Comparison
  const [pA, pB]  = compData;
  const compMax   = Math.max(pA ?? 0, pB ?? 0);
  const barWidthA = compMax > 0 ? `${((pA ?? 0) / compMax) * 100}%` : '0%';
  const barWidthB = compMax > 0 ? `${((pB ?? 0) / compMax) * 100}%` : '0%';

  return (
    <main className="dashboard-page">

      {/* ─── TOP COMMAND LAYER ─── */}
      <header className="dashboard-topbar">

        <div className="topbar-left">
          <Link href="/" className="topbar-brand">
            <div className="topbar-brand-dot" />
            <span className="topbar-brand-name">GeoEstate</span>
          </Link>
          <div className="topbar-divider" />
          <div className="dashboard-search">
            <div className="dashboard-search-icon">
              <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.25"/>
                <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              className="dashboard-search-input"
              type="text"
              placeholder="Search city, locality, landmark..."
            />
          </div>
        </div>

        <div className="dashboard-zoom-pills">
          {ZOOM_LEVELS.map(z => (
            <button
              key={z}
              className={`zoom-pill${activeZoom === z ? ' active' : ''}`}
              onClick={() => setActiveZoom(z)}
            >
              {z}
            </button>
          ))}
        </div>

      </header>


      {/* ─── MAIN ─── */}
      <div className="dashboard-main">

        {/* ─── LEFT INTELLIGENCE RAIL ─── */}
        <aside className="dashboard-sidebar">

          <div className="sidebar-section">
            <div className="sidebar-label">BHK</div>
            <div className="sidebar-options">
              {BHK_OPTIONS.map(b => (
                <button
                  key={b}
                  className={`filter-chip${activeBHK.includes(b) ? ' active' : ''}`}
                  onClick={() => toggle(setActiveBHK, b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Price Range</div>
            <div className="range-display">₹10L — ₹5Cr</div>
            <div className="range-track">
              <div className="range-fill" />
              <div className="range-thumb left" />
              <div className="range-thumb right" />
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Availability</div>
            <div className="sidebar-options">
              {AVAIL_OPTIONS.map(a => (
                <button
                  key={a}
                  className={`filter-chip${activeAvail.includes(a) ? ' active' : ''}`}
                  onClick={() => toggle(setActiveAvail, a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Amenities</div>
            <div className="sidebar-options">
              {AMENITY_OPTIONS.map(a => (
                <button
                  key={a}
                  className={`filter-chip${activeAmenities.includes(a) ? ' active' : ''}`}
                  onClick={() => toggle(setActiveAmenities, a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

        </aside>


        {/* ─── CENTRAL SPATIAL SURFACE ─── */}
        <div className="dashboard-map">

          <div className="map-toolbar">
            <div className="map-mode-group">
              {MAP_MODES.map(m => (
                <button
                  key={m}
                  className={`map-mode-btn${activeMode === m ? ' active' : ''}`}
                  onClick={() => setActiveMode(m)}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="map-toolbar-right">
              <span className="toolbar-info-pill">42 Cities</span>
              <span className="toolbar-info-pill live">● Live</span>
            </div>
          </div>

          <div className="intel-map-container">
            <MapContainer
              filters={filterArgs}
              onCitySelect={setSelectedCity}
            />
          </div>

        </div>

      </div>


      {/* ─── BOTTOM INTELLIGENCE PANELS ─── */}
      <div className="dashboard-bottom-panel">

        {/* Price Predictor */}
        <div className="bottom-panel">
          <div className="panel-label-row">
            <span className="panel-label">Price Predictor</span>
            <span className="panel-city-tag">{selectedCity.city}</span>
          </div>
          <div className="predictor-input-row">
            <input
              className="predictor-input"
              type="text"
              value={sqft}
              onChange={e => setSqft(e.target.value.replace(/\D/g, ''))}
              placeholder="sqft"
            />
            <span className="predictor-input-unit">sqft</span>
          </div>
          <div className="predictor-result">
            <span className={`predictor-price${predictorPrice == null ? ' loading' : ''}`}>
              {fmtPrice(predictorPrice)}
            </span>
          </div>
        </div>

        {/* Market Pulse */}
        <div className="bottom-panel">
          <div className="panel-label">Market Pulse</div>
          {PULSE_CITIES.map((city, i) => (
            <div className="insight-row" key={city.id}>
              <span className="insight-city">{city.city}</span>
              <span className={`insight-price${pulseData[i] == null ? ' loading' : ''}`}>
                {fmtPrice(pulseData[i])}
              </span>
            </div>
          ))}
        </div>

        {/* Area Comparison */}
        <div className="bottom-panel">
          <div className="panel-label">Area Comparison</div>
          <div className="comparison-cities">
            <div className="comparison-col">
              <span className="comparison-city-name">{COMP_A.city}</span>
              <span className={`comparison-city-price${pA == null ? ' loading' : ''}`}>
                {fmtPrice(pA)}
              </span>
            </div>
            <span className="comparison-vs">vs</span>
            <div className="comparison-col">
              <span className="comparison-city-name">{COMP_B.city}</span>
              <span className={`comparison-city-price${pB == null ? ' loading' : ''}`}>
                {fmtPrice(pB)}
              </span>
            </div>
          </div>
          <div className="comparison-bars">
            <div className="comp-bar">
              <div className="comp-bar-fill" style={{ width: barWidthA, background: '#111111' }} />
            </div>
            <div className="comp-bar">
              <div className="comp-bar-fill" style={{ width: barWidthB, background: 'var(--accent-terra)' }} />
            </div>
          </div>
        </div>

      </div>

    </main>
  );
}
