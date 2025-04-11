import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function EasyRunLive() {
  const [role, setRole] = useState(null); // "runner" or "supporter"
  const [nickname, setNickname] = useState("");
  const [position, setPosition] = useState(null);
  const [path, setPath] = useState([]);

  useEffect(() => {
    if (role === "runner") {
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setPosition(coords);
          setPath((prev) => [...prev, coords]);
        });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [role]);

  return (
    <div style={{ padding: 20 }}>
      {!role && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2>EASYRUN LIVE</h2>
          <input
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button onClick={() => setRole("runner")} disabled={!nickname}>
            러너로 시작하기
          </button>
          <button onClick={() => setRole("supporter")}>응원단으로 보기</button>
        </div>
      )}
      {role && (
        <MapContainer
          center={[37.615, 126.715]}
          zoom={15}
          style={{ height: "80vh", width: "100%", marginTop: 20 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {role === "runner" && position && <Marker position={position} />}
          {role === "runner" && path.length > 1 && <Polyline positions={path} />}
        </MapContainer>
      )}
    </div>
  );
}
