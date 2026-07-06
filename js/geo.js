// ============================================================
// geo.js — Geolocation & Coordinate Utilities
// GPS tracking, distance, bearing, UTM, DMS conversions
// ============================================================

// ── Helpers ──────────────────────────────────────────────────
function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }

// ── GeoTracker Class ─────────────────────────────────────────
class GeoTracker {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
    this.onUpdate = null;
    this.onError = null;
  }

  start(onUpdate, onError) {
    this.onUpdate = onUpdate;
    this.onError = onError;

    if (!navigator.geolocation) {
      if (onError) onError({ code: 0, message: 'Geolocation tidak didukung oleh browser ini.' });
      return false;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        };
        if (this.onUpdate) this.onUpdate(this.currentPosition);
      },
      (error) => {
        let msg = 'Terjadi kesalahan GPS.';
        switch (error.code) {
          case 1: msg = 'Akses lokasi ditolak. Mohon izinkan akses GPS di pengaturan browser.'; break;
          case 2: msg = 'Posisi tidak tersedia. Pastikan GPS aktif.'; break;
          case 3: msg = 'Waktu permintaan GPS habis. Coba lagi.'; break;
        }
        if (this.onError) this.onError({ code: error.code, message: msg });
      },
      options
    );

    return true;
  }

  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.currentPosition = null;
  }

  isTracking() {
    return this.watchId !== null;
  }
}

// ── Haversine Distance (meters) ──────────────────────────────
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ── Bearing (degrees 0-360) ──────────────────────────────────
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

// ── Bearing → Compass Direction ──────────────────────────────
function bearingToCompass(bearing) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(bearing / 22.5) % 16;
  return dirs[index];
}

// ── Decimal Degrees → DMS String ─────────────────────────────
function decimalToDMS(decimal, isLat) {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(1);
  const dir = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
  return `${dir} ${deg}°${String(min).padStart(2, '0')}'${String(sec).padStart(4, '0')}"`;
}

// ── Format Full Coordinate String ────────────────────────────
function formatLatLon(lat, lon) {
  return `${decimalToDMS(lat, true)}, ${decimalToDMS(lon, false)}`;
}

// ── Lat/Lon → UTM (WGS84) ───────────────────────────────────
// Full implementation supporting any zone, optimized for Bali (Zone 50S)
function latLonToUTM(lat, lon) {
  // WGS84 ellipsoid parameters
  const a = 6378137.0;                    // semi-major axis
  const f = 1 / 298.257223563;            // flattening
  const b = a * (1 - f);                  // semi-minor axis
  const e = Math.sqrt(1 - (b * b) / (a * a)); // eccentricity
  const e2 = (e * e) / (1 - e * e);       // second eccentricity squared
  const k0 = 0.9996;                      // scale factor

  // UTM zone
  const zone = Math.floor((lon + 180) / 6) + 1;
  const lonOrigin = (zone - 1) * 6 - 180 + 3; // central meridian

  const latRad = toRad(lat);
  const lonRad = toRad(lon);
  const lonOriginRad = toRad(lonOrigin);

  const N = a / Math.sqrt(1 - e * e * Math.sin(latRad) * Math.sin(latRad));
  const T = Math.tan(latRad) * Math.tan(latRad);
  const C = e2 * Math.cos(latRad) * Math.cos(latRad);
  const A = Math.cos(latRad) * (lonRad - lonOriginRad);

  // Meridional arc
  const M = a * (
    (1 - e * e / 4 - 3 * Math.pow(e, 4) / 64 - 5 * Math.pow(e, 6) / 256) * latRad -
    (3 * e * e / 8 + 3 * Math.pow(e, 4) / 32 + 45 * Math.pow(e, 6) / 1024) * Math.sin(2 * latRad) +
    (15 * Math.pow(e, 4) / 256 + 45 * Math.pow(e, 6) / 1024) * Math.sin(4 * latRad) -
    (35 * Math.pow(e, 6) / 3072) * Math.sin(6 * latRad)
  );

  // Easting
  let easting = k0 * N * (
    A +
    (1 - T + C) * Math.pow(A, 3) / 6 +
    (5 - 18 * T + T * T + 72 * C - 58 * e2) * Math.pow(A, 5) / 120
  ) + 500000;

  // Northing
  let northing = k0 * (
    M + N * Math.tan(latRad) * (
      A * A / 2 +
      (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24 +
      (61 - 58 * T + T * T + 600 * C - 330 * e2) * Math.pow(A, 6) / 720
    )
  );

  // Southern hemisphere offset
  if (lat < 0) northing += 10000000;

  const hemisphere = lat >= 0 ? 'N' : 'S';

  return {
    zone: `${zone}${hemisphere}`,
    easting: Math.round(easting),
    northing: Math.round(northing)
  };
}

// ── Format UTM String ────────────────────────────────────────
function formatUTM(lat, lon) {
  const utm = latLonToUTM(lat, lon);
  return `Zone ${utm.zone}, E ${utm.easting.toLocaleString('id-ID')}, N ${utm.northing.toLocaleString('id-ID')}`;
}

// ── Format Distance ──────────────────────────────────────────
function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}
