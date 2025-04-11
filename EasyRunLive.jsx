import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function RecenterButton({ position }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView(position, map.getZoom())}
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        zIndex: 1000,
        padding: "10px 15px",
        background: "white",
        border: "1px solid #ccc",
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      내 위치로 이동
    </button>
  );
}

export default function EasyRunLive() {
  const [role, setRole] = useState(null);
  const [nickname, setNickname] = useState("");
  const [position, setPosition] = useState(null);
  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState("0:00");
  const [status, setStatus] = useState("");
  const lastPositionRef = useRef(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (role === "runner") {
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setPosition(coords);

          setPath((prev) => {
            if (prev.length > 0) {
              const [lastLat, lastLng] = prev[prev.length - 1];
              const dist = calculateDistance(lastLat, lastLng, coords[0], coords[1]);
              if (dist < 0.005) {
                setStatus("휴식 중");
              } else {
                setDistance((d) => d + dist);
                const paceMin = (10 / 60) / dist;
                const minutes = Math.floor(paceMin);
                const seconds = Math.round((paceMin - minutes) * 60);
                setPace(f"{minutes}:{'0' + str(seconds) if seconds < 10 else seconds}");
                setStatus("");
              }
            }
            return [...prev, coords];
          });
        });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [role]);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 10 }}>EASYRUN MARATHON LIVE</h2>
      {!role && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button onClick={() => setRole("runner")} disabled={!nickname}>러너로 시작하기</button>
          <button onClick={() => setRole("supporter")}>응원단으로 보기</button>
        </div>
      )}
      {role && (
        <div style={{ position: "relative" }}>
          <MapContainer
            center={[37.615, 126.715]}
            zoom={15}
            style={{ height: "80vh", width: "100%", marginTop: 20 }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {role === "runner" && position && (
              <>
                <CircleMarker
                  center={position}
                  radius={10}
                  pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.8 }}
                  className="blinking"
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                    <div style={{ textAlign: "center" }}>
                      <strong>{nickname}</strong><br />
                      {status ? status : `페이스: ${pace}분/km`}<br />
                      거리: {distance.toFixed(2)}km
                    </div>
                  </Tooltip>
                </CircleMarker>
              </>
            )}
            {role === "runner" && path.length > 1 && <Polyline positions={path} />}
            {position && <RecenterButton position={position} />}
          </MapContainer>
        </div>
      )}

      <style>
        {`
          .blinking {
            animation: blink 1s infinite;
          }
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
