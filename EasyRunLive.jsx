
import React, { useState } from 'react';

function EasyRunLive() {
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState(null);

  if (!role) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '60px' }}>
        <img src="/logo.jpg" alt="EASYRUN logo" style={{ width: '150px', marginBottom: '30px' }} />
        <h2>EASYRUN LIVE</h2>
        <input
          type="text"
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setRole('runner')} style={{ marginRight: '10px' }}>러너로 시작하기</button>
          <button onClick={() => setRole('supporter')}>응원단으로 시작하기</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', paddingTop: '100px' }}>
      <h2>{nickname} 님, {role === 'runner' ? '러너' : '응원단'} 모드입니다!</h2>
      <p>🚧 위치 공유 및 지도 기능은 곧 업데이트됩니다.</p>
    </div>
  );
}

export default EasyRunLive;
