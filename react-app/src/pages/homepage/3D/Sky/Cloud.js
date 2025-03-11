/* eslint-disable react/no-unknown-property */
import React, { useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';


// よりリアルな雲
function Cloud({ position, scale }) {
  const cloudRef = useRef();
  
  // 雲の密度に基づく部分の数
  const cloudParts = Math.floor(5 + scale * 1.5); 
  
  return (
    <group ref={cloudRef} position={position} scale={[scale, scale * 0.6, scale]}>
      {/* 雲の中心部 */}
      <mesh>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent
          opacity={0.9}
          fog={true}
        />
      </mesh>
      
      {/* 雲の周りに複数の小さな球体を配置してふわふわ感を出す */}
      {Array.from({ length: cloudParts }).map((_, i) => {
        const angle = (i / cloudParts) * Math.PI * 2;
        const radiusVar = Math.random() * 0.3;
        const radius = 0.8 + radiusVar;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.3) * 0.3;
        const size = 0.6 + Math.random() * 0.6;
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[size, 12, 12]} />
            <meshStandardMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.8 - radiusVar * 0.5}
              fog={true}
            />
          </mesh>
        );
      })}
      
      {/* 上部のふわふわした部分 */}
      {Array.from({ length: Math.floor(cloudParts * 0.7) }).map((_, i) => {
        const angle = (i / (cloudParts * 0.7)) * Math.PI * 2;
        const radiusVar = Math.random() * 0.2;
        const radius = 0.4 + radiusVar;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 0.7 + Math.random() * 0.3;
        const size = 0.5 + Math.random() * 0.4;
        
        return (
          <mesh key={i + cloudParts} position={[x, y, z]}>
            <sphereGeometry args={[size, 12, 12]} />
            <meshStandardMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.85 - radiusVar}
              fog={true}
            />
          </mesh>
        );
      })}
      
      {/* 下部のふわふわした部分 */}
      {Array.from({ length: Math.floor(cloudParts * 0.5) }).map((_, i) => {
        const angle = (i / (cloudParts * 0.5)) * Math.PI * 2;
        const radiusVar = Math.random() * 0.2;
        const radius = 0.5 + radiusVar;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = -0.5 - Math.random() * 0.3;
        const size = 0.4 + Math.random() * 0.3;
        
        return (
          <mesh key={i + cloudParts + Math.floor(cloudParts * 0.7)} position={[x, y, z]}>
            <sphereGeometry args={[size, 12, 12]} />
            <meshStandardMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.7 - radiusVar}
              fog={true}
            />
          </mesh>
        );
      })}
    </group>
  );
}

Cloud.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  scale: PropTypes.number.isRequired
};

// 雲のグループ
function Clouds({ count = 7 }) {
  const clouds = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      // 雲を遠くに配置
      const distance = 100 + Math.random() * 80;
      const angle = Math.random() * Math.PI * 2;
      const height = 30 + Math.random() * 20;
      
      items.push({
        px: Math.cos(angle) * distance,
        py: height,
        pz: Math.sin(angle) * distance,
        scale: 8 + Math.random() * 15,
        speed: (Math.random() * 0.03) + 0.001,
        rotationSpeed: (Math.random() - 0.5) * 0.0001,
        rotation: Math.random() * Math.PI * 2
      });
    }
    return items;
  }, [count]);

  const groupRef = useRef();
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    groupRef.current.children.forEach((cloud, i) => {
      // 円周上をゆっくり移動
      const cloudData = clouds[i];
      const currentAngle = Math.atan2(cloudData.px, cloudData.pz);
      const distance = Math.sqrt(cloudData.px ** 2 + cloudData.pz ** 2);
      
      // 角度をわずかに更新
      const newAngle = currentAngle + cloudData.speed;
      cloudData.px = Math.cos(newAngle) * distance;
      cloudData.pz = Math.sin(newAngle) * distance;
      
      // わずかな上下の動き
      const yOffset = Math.sin(time * 0.05 + i * 2) * 0.5;
      
      // 非常にゆっくりとした回転
      cloudData.rotation += cloudData.rotationSpeed;
      
      // 位置と回転の適用
      cloud.position.set(cloudData.px, cloudData.py + yOffset, cloudData.pz);
      cloud.rotation.y = cloudData.rotation;
      
      // カメラに向ける（ビルボーディング効果）
      const lookAtVector = [0, cloudData.py, 0]; // シーンの中心を見る
      cloud.lookAt(...lookAtVector);
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <Cloud
          key={i}
          position={[cloud.px, cloud.py, cloud.pz]}
          scale={cloud.scale}
        />
      ))}
    </group>
  );
}

Clouds.propTypes = {
  count: PropTypes.number
};

export default Clouds;