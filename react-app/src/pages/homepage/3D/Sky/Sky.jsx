/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

import Rain from './Rain';
import Birds from './Bird';
import { MatrixLoad } from '../../MatrixLoad';


function Sky() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const loadingTimerRef = useRef(null);

  useEffect(() => {
    // 画像が読み込まれるのを待つ（シミュレーション）
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        setFadeIn(true);
      }, 500); // フェードアウト後にフェードイン開始
    }, 3000);

    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>

      {/* マトリックスローディング画面 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: isLoading ? 20 : 1, // ローディング中は最前面、それ以外は最背面
        }}
      >
        <MatrixLoad key="matrix-rain" isLoading={isLoading} />
      </div>

      {/* メインのCanvasコンテンツ */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10, // 常に中間のレイヤー
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 1.5s ease-in',
          // ロード完了後のみポインターイベントを有効化
          pointerEvents: fadeIn ? 'auto' : 'none'
        }}
      >
        <Canvas camera={{ position: [0, 10, 30], fov: 65 }}>
          {/* 環境マップ */}
          <Environment files="/3D/test.exr" background={true} />

          {/* 雨パーティクル */}
          <Rain count={3000} />

          {/* 鳥 */}
          <Birds count={15} />

          {/* 遠くの物体をぼかす */}
          <fog attach="fog" args={['#aabbcc', 30, 150]} />

          {/* 標準的なOrbitControls - 自動回転なし */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={0.8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            autoRotate={false}
          />
        </Canvas>
      </div>
    </div>
  );
}

export default Sky;