
import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const firebaseConfig = {
  apiKey: "AIzaSyAEhLPF6IjOKmkL4B6I9jU7rbVUzRbn3QA",
  authDomain: "easyrun-live-track.firebaseapp.com",
  databaseURL: "https://easyrun-live-track-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "easyrun-live-track",
  storageBucket: "easyrun-live-track.appspot.com",
  messagingSenderId: "64706196946",
  appId: "1:64706196946:web:0fdb6fa417e79339b90b8c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function EasyRunLive() {
  const [role, setRole] = useState(null);
  const [nickname, setNickname] = useState('');
  const [position, setPosition] = useState(null);
  const [runners, setRunners] = useState({});
  const [intervalId, setIntervalId] = useState(null);

  const handleStart = (selectedRole) => {
    if (!nickname) return alert('닉네임을 입력하세요.');
    setRole(selectedRole);

    const id = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        const [lat, lng] = coords;
        set(ref(db, `runners/${nickname}`), {
          nickname,
          lat,
          lng,
          timestamp: Date.now()
        });
      });
    }, 1000);
    setIntervalId(id);
  };

  useEffect(() => {
    if (role) {
      const runnersRef = ref(db, 'runners');
      onValue(runnersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setRunners(data);
        }
      });
    }
    return () => intervalId && clearInterval(intervalId);
  }, [role]);

  if (!role) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '40px' }}>
        <img src="/logo.png" alt="EASYRUN Logo" style={{ width: '160px', marginBottom: '20px' }} />
        <h2>EASYRUN LIVE</h2>
        <input
          placeholder="닉네임 입력"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <br /><br />
        <button onClick={() => handleStart('runner')} style={{ marginRight: '10px' }}>러너로 시작하기</button>
        <button onClick={() => handleStart('supporter')}>응원단으로 시작하기</button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={position || [37.5665, 126.978]} zoom={14} style={{ height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && (
          <Marker position={position} icon={icon}>
            <Popup>{nickname} (나)</Popup>
          </Marker>
        )}
        {Object.entries(runners).map(([key, val]) => {
          if (key === nickname) return null;
          return (
            <Marker key={key} position={[val.lat, val.lng]} icon={icon}>
              <Popup>{val.nickname}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default EasyRunLive;
