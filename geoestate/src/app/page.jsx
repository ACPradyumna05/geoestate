import FluctuatingCounter from '../components/ui/FluctuatingCounter';
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-page">

    <div className="navbar-section content-width">

    <div className="nav-logo">

        <div className="logo-circle"></div>

        <div className="logo-text">
        GeoEstate
        </div>

    </div>


    <div className="nav-links">

        <div className="nav-link">Markets</div>

        <div className="nav-link">Explore</div>

        <div className="nav-link">Analytics</div>

        <div className="nav-link">Data</div>

    </div>


    <div className="nav-actions">

       <Link href="/dashboard" className="nav-cta">
        Enter Platform
        </Link>

    </div>

    </div>


 {/* ================= HERO ================= */}
      <div className="hero-section content-width">


        {/* LEFT SIDE */}
        <div className="hero-left">

            <div className="hero-eyebrow">
                INDIA PROPERTY INTELLIGENCE
            </div>


            <div className="hero-headline editorial-heading">
                Know what a neighborhood is worth.
            </div>


            <div className="hero-description">
                Explore pricing patterns, housing density, and market shifts
                across India through geographic intelligence.
            </div>


            <div className="hero-search">

                <div className="search-icon">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.25"/>
                        <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                    </svg>
                </div>

                <div className="search-placeholder">
                    Search city, locality, or neighborhood...
                </div>

                <Link href="/dashboard" className="search-action">
                Explore
                </Link>

            </div>


            <div className="hero-metrics">
                <div className="metric-item">
                    <div className="metric-value">
                        <FluctuatingCounter base={23421} range={90} interval={2600} duration={1400} />
                    </div>
                    <div className="metric-label">Active Listings</div>
                </div>
                <div className="metric-item">
                    <div className="metric-value">52</div>
                    <div className="metric-label">Cities</div>
                </div>
                <div className="metric-item">
                    <div className="metric-value">₹18,400</div>
                    <div className="metric-label">Avg / sqft</div>
                </div>
            </div>

        </div>



        {/* RIGHT SIDE */}
        <div className="hero-right">

            <div className="hero-map-frame">

                <div className="map-grid"></div>


                <div className="hero-hex-preview">

                <div className="hex-row">
                    <div className="hero-hex low"></div>
                    <div className="hero-hex low"></div>
                    <div className="hero-hex mid"></div>
                </div>

                <div className="hex-row offset">
                    <div className="hero-hex low"></div>
                    <div className="hero-hex mid"></div>
                   
                    <div className="hero-hex high"></div>
                </div>

                <div className="hex-row">
                    <div className="hero-hex low"></div>

                    <div className="hero-hex high"></div>
                </div>

                <div className="hex-row offset">
                    <div className="hero-hex low"></div>
                    <div className="hero-hex mid"></div>
                    <div className="hero-hex high"></div>
                </div>

                </div>


                <div className="hero-map-card">

                <div className="hero-map-city">
                    Mumbai
                </div>

                <div className="hero-map-divider"></div>

                <div className="hero-map-stat">
                    <span>Avg Price</span>
                    <span>₹18,400/sqft</span>
                </div>

                <div className="hero-map-stat">
                    <span>Median</span>
                    <span>₹1.2 Cr</span>
                </div>

                <div className="hero-map-stat">
                    <span>Listings</span>
                    <span>23,421</span>
                </div>

                </div>


                <div className="hero-map-legend">

                <div className="legend-pill low">
                    Affordable
                </div>

                <div className="legend-pill mid">
                    Balanced
                </div>

                <div className="legend-pill high">
                    Premium
                </div>

                </div>

            </div>

        </div>


      </div>


      {/* MARKET STRIP */}
      <div className="market-strip-section">

        <div className="market-strip-inner">
        </div>

      </div>


      {/* FULL WIDTH MAP */}
      <div className="map-preview-section">

        <div className="map-header">

          <div className="map-title">
          </div>

          <div className="map-controls">
          </div>

        </div>


        <div className="map-canvas">
        </div>


        <div className="map-insight-bar">
        </div>

      </div>


      {/* DATA STORY */}
      <div className="narrative-section">

        <div className="narrative-statement">
        </div>

        <div className="narrative-comparison">

          <div className="comparison-left">
          </div>

          <div className="comparison-middle">
          </div>

          <div className="comparison-right">
          </div>

        </div>

      </div>


      {/* CITY SNAPSHOTS */}
      <div className="city-preview-section">

        <div className="city-preview-header">
        </div>

        <div className="city-grid">

          <div className="city-card">
          </div>

          <div className="city-card">
          </div>

          <div className="city-card">
          </div>

          <div className="city-card">
          </div>

        </div>

      </div>


      {/* FOOTER CTA */}
      <div className="cta-section">

        <div className="cta-content">
        </div>

      </div>


      {/* FOOTER */}
      <div className="footer-section">

        <div className="footer-left">
        </div>

        <div className="footer-right">
        </div>

      </div>

    </main>
  );
}
