import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, CheckCircle, Wrench, Navigation } from 'lucide-react';

export default function ParkMap({ parks = [], height = '450px', center = [17.7012, 83.3100], zoom = 12 }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance on re-render to prevent duplicate map initialization errors
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Determine map center based on parks lat/lng or default center
    let initialCenter = center;
    const validParks = parks.filter((p) => p.latitude && p.longitude);
    if (validParks.length > 0) {
      const avgLat = validParks.reduce((sum, p) => sum + Number(p.latitude), 0) / validParks.length;
      const avgLng = validParks.reduce((sum, p) => sum + Number(p.longitude), 0) / validParks.length;
      initialCenter = [avgLat, avgLng];
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom marker icons based on park status
    const createCustomIcon = (status) => {
      let color = '#198754'; // Active - Green
      if (status === 'maintenance') color = '#FFC107'; // Maintenance - Amber
      if (status === 'inactive') color = '#DC3545'; // Inactive - Red

      const svgHtml = `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background-color: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `;

      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: svgHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
    };

    // Add Markers for each park
    parks.forEach((park) => {
      const lat = park.latitude ? Number(park.latitude) : 17.7012;
      const lng = park.longitude ? Number(park.longitude) : 83.3100;

      const marker = L.marker([lat, lng], {
        icon: createCustomIcon(park.status),
      }).addTo(map);

      // Create rich interactive HTML popup content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 font-sans text-gray-800 max-w-[220px]';
      popupDiv.innerHTML = `
        <div class="font-bold text-sm text-gray-900 mb-1 flex items-center gap-1.5">
          <span>${park.name}</span>
        </div>
        <div class="text-xs text-gray-500 mb-2">
          📍 ${park.location || 'Location N/A'} (${park.ward || 'Ward N/A'})
        </div>
        <div class="mb-3">
          <span style="
            display: inline-block;
            padding: 2px 8px;
            font-size: 10px;
            font-weight: 700;
            border-radius: 12px;
            text-transform: uppercase;
            background-color: ${park.status === 'active' ? '#e6f4ea' : park.status === 'maintenance' ? '#fef7e0' : '#fce8e6'};
            color: ${park.status === 'active' ? '#137333' : park.status === 'maintenance' ? '#b06000' : '#c5221f'};
          ">
            ${park.status === 'active' ? '🟢 Active & Open' : park.status === 'maintenance' ? '🟡 Under Maintenance' : '🔴 Closed'}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-1.5 pt-1 border-t border-gray-100">
          <button id="popup-checkin-${park.id}" style="
            background-color: #0B5ED7;
            color: white;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            width: 100%;
          ">Check-In</button>

          <button id="popup-issue-${park.id}" style="
            background-color: #f1f5f9;
            color: #334155;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            cursor: pointer;
            width: 100%;
          ">Report Issue</button>
        </div>
      `;

      marker.bindPopup(popupDiv);

      // Attach click listeners to popup buttons after opening
      marker.on('popupopen', () => {
        const checkinBtn = document.getElementById(`popup-checkin-${park.id}`);
        const issueBtn = document.getElementById(`popup-issue-${park.id}`);

        if (checkinBtn) {
          checkinBtn.onclick = () => {
            navigate(`/checkin/${park.qr_code || ''}`);
          };
        }
        if (issueBtn) {
          issueBtn.onclick = () => {
            navigate('/maintenance');
          };
        }
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [parks, center, zoom]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100">
      {/* Map Legend Bar */}
      <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-gray-200/80 text-xs flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="font-medium text-gray-700">Active</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="font-medium text-gray-700">Maintenance</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="font-medium text-gray-700">Inactive</span>
        </div>
      </div>

      <div ref={mapContainerRef} style={{ height }} className="w-full z-10" />
    </div>
  );
}
