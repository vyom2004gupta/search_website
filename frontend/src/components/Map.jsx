import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Paper from '@mui/material/Paper';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Map({ people }) {
  // Calculate map bounds based on markers
  useEffect(() => {
    if (window.map && people.length > 0) {
      const bounds = L.latLngBounds(
        people
          .filter((p) => p.lat && p.lon)
          .map((p) => [p.lat, p.lon])
      );
      window.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [people]);

  return (
    <Paper
      elevation={3}
      sx={{
        height: 600,
        backgroundColor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        ref={(map) => {
          if (map) {
            window.map = map;
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {people
          .filter((p) => p.lat && p.lon)
          .map((person) => (
            <Marker key={person.id} position={[person.lat, person.lon]}>
              <Popup>
                <div>
                  <strong>{person.name}</strong>
                  <br />
                  {person.phone}
                  <br />
                  {person.email}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </Paper>
  );
}

export default Map; 