import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function EasyRunLive() {
  const [role, setRole] = useState(null); // "runner" or "supporter"
  const [nickname, setNickname] = useState("");
  const [position, setPosition] = useState(null);
  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [pace, setPace] = useState("0:00");

  // 거리 계산 함수 (Haversine formula)
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
              const dist = calculateDistance(
                lastLat,
                lastLng,
                coords[0],
                coords[1]
              );
              setDistance((d) => d + dist);
              const seconds = 10; // GPS 주기
              const spd = dist / (seconds / 3600); // km/h
              setSpeed(spd);
              setPace((60 / spd).toFixed(2));
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

          {role === "runner" && position && (
            <>
              <CircleMarker
                center={position}
                radius={15} // 크게 표시
                pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.8 }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                  <div style={{ textAlign: "center" }}>
                    <strong>{nickname}</strong><br />
                    속도: {speed.toFixed(1)}km/h<br />
                    페이스: {pace}분/km<br />
                    거리: {distance.toFixed(2)}km
                  </div>
                </Tooltip>
              </CircleMarker>
            </>
          )}

          {role === "runner" && path.length > 1 && <Polyline positions={path} />}
        </MapContainer>
      )}
    </div>
  );
}
