import "./globals.css";

export const metadata = {
  title: "GeoEstate",
  description: "Spatial property intelligence platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        <div className="app-shell">
          {children}
        </div>

      </body>
    </html>
  );
}