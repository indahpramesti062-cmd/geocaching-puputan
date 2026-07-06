// ============================================================
// map.js — Leaflet Map Management
// Player/cache markers, polylines, compass, auto-zoom
// ============================================================

class GameMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.playerMarker = null;
    this.cacheMarker = null;
    this.polyline = null;
    this.accuracyCircle = null;
    this.cachePosition = null;
    this.playerPosition = null;
    this.isInitialized = false;
  }

  // ── Initialize Leaflet Map ──────────────────────────────────
  init() {
    if (this.isInitialized) {
      this.map.invalidateSize();
      return;
    }

    this.map = L.map(this.containerId, {
      zoomControl: false,
      attributionControl: true
    }).setView([-8.537, 115.404], 16);

    // OSM Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.map);

    // Zoom control on the right
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.isInitialized = true;

    // Force map to recalculate size after a short delay
    setTimeout(() => this.map.invalidateSize(), 200);
  }

  // ── Set Cache Marker (Gold/Red with Pulse) ──────────────────
  setCachePosition(lat, lon, label) {
    this.cachePosition = { lat, lon };

    if (this.cacheMarker) {
      this.map.removeLayer(this.cacheMarker);
    }

    const cacheIcon = L.divIcon({
      className: 'cache-marker-wrapper',
      html: `<div class="cache-marker-pulse">📍</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -20]
    });

    this.cacheMarker = L.marker([lat, lon], { icon: cacheIcon })
      .addTo(this.map)
      .bindPopup(`<b>🎯 Cache: ${label || 'Target'}</b><br>${decimalToDMS(lat, true)}<br>${decimalToDMS(lon, false)}`);
  }

  // ── Update Player Position (Blue with Pulse) ────────────────
  setPlayerPosition(lat, lon, accuracy) {
    this.playerPosition = { lat, lon, accuracy };

    if (!this.playerMarker) {
      const playerIcon = L.divIcon({
        className: 'player-marker-wrapper',
        html: `<div class="player-marker-pulse"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      this.playerMarker = L.marker([lat, lon], { icon: playerIcon })
        .addTo(this.map);
    } else {
      this.playerMarker.setLatLng([lat, lon]);
    }

    // Accuracy circle
    if (accuracy) {
      if (this.accuracyCircle) {
        this.accuracyCircle.setLatLng([lat, lon]);
        this.accuracyCircle.setRadius(accuracy);
      } else {
        this.accuracyCircle = L.circle([lat, lon], {
          radius: accuracy,
          color: 'rgba(33, 150, 243, 0.5)',
          fillColor: 'rgba(33, 150, 243, 0.1)',
          fillOpacity: 0.3,
          weight: 1
        }).addTo(this.map);
      }
    }

    // Update polyline
    this.updateLine();
  }

  // ── Update Connecting Line ──────────────────────────────────
  updateLine() {
    if (!this.playerPosition || !this.cachePosition) return;

    const points = [
      [this.playerPosition.lat, this.playerPosition.lon],
      [this.cachePosition.lat, this.cachePosition.lon]
    ];

    if (this.polyline) {
      this.polyline.setLatLngs(points);
    } else {
      this.polyline = L.polyline(points, {
        color: '#B22222',
        weight: 3,
        dashArray: '10, 8',
        opacity: 0.8
      }).addTo(this.map);
    }
  }

  // ── Fit Map to Show Both Markers ────────────────────────────
  fitBounds() {
    if (!this.playerPosition || !this.cachePosition) {
      if (this.cachePosition) {
        this.map.setView([this.cachePosition.lat, this.cachePosition.lon], 16);
      }
      return;
    }

    const bounds = L.latLngBounds(
      [this.playerPosition.lat, this.playerPosition.lon],
      [this.cachePosition.lat, this.cachePosition.lon]
    );

    this.map.fitBounds(bounds.pad(0.3), {
      maxZoom: 18,
      animate: true
    });
  }

  // ── Center on Player ────────────────────────────────────────
  centerOnPlayer() {
    if (this.playerPosition) {
      this.map.setView(
        [this.playerPosition.lat, this.playerPosition.lon],
        Math.max(this.map.getZoom(), 17),
        { animate: true }
      );
    }
  }

  // ── Get Current Distance ────────────────────────────────────
  getDistance() {
    if (!this.playerPosition || !this.cachePosition) return null;
    return haversineDistance(
      this.playerPosition.lat, this.playerPosition.lon,
      this.cachePosition.lat, this.cachePosition.lon
    );
  }

  // ── Get Bearing ─────────────────────────────────────────────
  getBearing() {
    if (!this.playerPosition || !this.cachePosition) return null;
    return calculateBearing(
      this.playerPosition.lat, this.playerPosition.lon,
      this.cachePosition.lat, this.cachePosition.lon
    );
  }

  // ── Cleanup ─────────────────────────────────────────────────
  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.playerMarker = null;
    this.cacheMarker = null;
    this.polyline = null;
    this.accuracyCircle = null;
    this.isInitialized = false;
  }

  // ── Reset markers (keep map alive) ──────────────────────────
  clearMarkers() {
    if (this.playerMarker) { this.map.removeLayer(this.playerMarker); this.playerMarker = null; }
    if (this.cacheMarker) { this.map.removeLayer(this.cacheMarker); this.cacheMarker = null; }
    if (this.polyline) { this.map.removeLayer(this.polyline); this.polyline = null; }
    if (this.accuracyCircle) { this.map.removeLayer(this.accuracyCircle); this.accuracyCircle = null; }
    this.playerPosition = null;
    this.cachePosition = null;
  }
}
