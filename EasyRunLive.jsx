
import React, { useEffect, useState, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { MapContainer, TileLayer, useMap, Circle, Marker, Popup } from 'react-leaflet';
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

function MyLocationButton({ position }) {
  const map = useMap();
  return (
    <button
      style={{
        position: 'absolute',
        bottom: '80px',
        right: '10px',
        zIndex: 1000,
        padding: '8px 12px',
        background: 'white',
        border: '1px solid gray',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
      onClick={() => position && map.setView(position, 15)}
    >
      내 위치
    </button>
  );
}

function EasyRunLive() {
  const [role, setRole] = useState(null);
  const [nickname, setNickname] = useState('');
  const [position, setPosition] = useState(null);
  const [users, setUsers] = useState({});
  const [intervalId, setIntervalId] = useState(null);
  const [pace, setPace] = useState('');
  const [prevTime, setPrevTime] = useState(null);
  const [prevPos, setPrevPos] = useState(null);
  const mapRef = useRef(null);

  const handleStart = (selectedRole) => {
    if (!nickname) return alert('닉네임을 입력하세요.');
    setRole(selectedRole);
    const id = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);

        const now = Date.now();
        if (prevTime && prevPos) {
          const distance = getDistance(prevPos, coords);
          const timeDiffMin = (now - prevTime) / 60000;
          const speed = distance / timeDiffMin;
          const paceMin = speed === 0 ? 0 : 1 / speed;
          const minutes = Math.floor(paceMin);
          const seconds = Math.round((paceMin - minutes) * 60);
          setPace(`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
        }
        setPrevTime(now);
        setPrevPos(coords);

        const [lat, lng] = coords;
        set(ref(db, `users/${nickname}`), {
          nickname,
          lat,
          lng,
          timestamp: now,
          role
        });
      });
    }, 1000);
    setIntervalId(id);
  };

  useEffect(() => {
    if (role) {
      const usersRef = ref(db, 'users');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setUsers(data);
      });
    }
    return () => intervalId && clearInterval(intervalId);
  }, [role]);

  function getDistance([lat1, lon1], [lat2, lon2]) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  if (!role) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '40px' }}>
        <img src="/logo.jpg" alt="EASYRUN Logo" style={{ width: '160px', marginBottom: '20px' }} />
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
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '4px 12px',
        borderRadius: '8px',
        fontWeight: 'bold'
      }}>EASYRUN MARATHON LIVE</div>
      <MapContainer center={position || [37.5665, 126.978]} zoom={15} style={{ height: '100%' }} ref={mapRef}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MyLocationButton position={position} />
        {Object.entries(users).map(([key, val]) => {
          const isSelf = key === nickname;
          const isRunner = val.role === 'runner';
          const isSupporter = val.role === 'supporter';
          const flashColor = isRunner ? 'red' : 'blue';
          return (
            <Circle
              key={key}
              center={[val.lat, val.lng]}
              radius={15}
              pathOptions={{
                color: flashColor,
                fillColor: flashColor,
                fillOpacity: 0.6
              }}
            >
              <Popup>
                <b>{val.nickname}</b><br />
                {isRunner && !isSelf && `페이스: ${pace || '측정 중...'}`}
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
      <a href="https://www.instagram.com/easyrun_crew/"
         target="_blank"
         rel="noreferrer"
         style={{
           position: 'absolute',
           bottom: 10,
           right: 10,
           zIndex: 1000
         }}
      >
        <img src="/logo.jpg" alt="EASYRUN" style={{ width: '60px', borderRadius: '8px' }} />
      </a>
    </div>
  );
}

export default EasyRunLive;
