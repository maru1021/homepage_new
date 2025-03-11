/* eslint-disable react/no-unknown-property */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';


function Bird({ position, scale = [1, 1, 1] }) {
  const birdRef = useRef();

  return (
    <group ref={birdRef} position={position} scale={scale}>
      {/* 胴体 */}
      <mesh scale={[1, 0.5, 1.7]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* 頭 */}
      <mesh position={[0, 0.2, 0.8]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* 左翼 */}
      <group position={[-0.4, 0.1, 0]} rotation={[0, 0, 0]}>
        <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 12]}>
          <boxGeometry args={[1.4, 0.05, 0.6]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      </group>

      {/* 右翼 */}
      <group position={[0.4, 0.1, 0]} rotation={[0, 0, 0]}>
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 12]}>
          <boxGeometry args={[1.4, 0.05, 0.6]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      </group>

      {/* 尾羽 */}
      <mesh position={[0, 0.1, -0.8]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  );
}

Bird.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  scale: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.number
  ])
};


// 鳥の群れ
function Birds({ count = 5 }) {
  // 鳥の初期位置と動きのパラメータをメモ化
  const birds = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      // 遠くの鳥
      const distance = 80 + Math.random() * 1; // 遠くに配置
      const angle = Math.random() * Math.PI * 2;
      const height = 30 + Math.random() * 10; // 高い位置

      items.push({
        // 位置
        px: Math.cos(angle) * distance,
        py: height,
        pz: Math.sin(angle) * distance,
        // 速度
        vx: Math.cos(angle + Math.PI/2) * (0.05 + Math.random() * 0.05),
        vy: (Math.random() - 0.5) * 0.01,
        vz: Math.sin(angle + Math.PI/2) * (0.05 + Math.random() * 0.05),
        // 回転
        rotation: angle + Math.PI/2,
        // 羽ばたき
        wingPosition: Math.random() * Math.PI * 2,
        wingSpeed: 0.1 + Math.random() * 0.01,
        // 大きさ
        scale: 0.01 + Math.random() * 1
      });
    }
    return items;
  }, [count]);

  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    groupRef.current.children.forEach((bird, i) => {
      const data = birds[i];

      // 位置の更新（非常にゆっくり）
      data.px += data.vx;
      data.py += data.vy + Math.sin(time * 0.1 + i) * 0.01;
      data.pz += data.vz;

      // 大きな円周上を飛ぶように
      const distance = Math.sqrt(data.px ** 2 + data.pz ** 2);
      if (distance < 70 || distance > 150) {
        // 中心に近づきすぎたり、遠すぎたりしたら方向転換
        data.vx = -data.vx;
        data.vz = -data.vz;
        data.rotation = Math.atan2(data.vx, data.vz);
      }

      // 位置の適用
      bird.position.set(data.px, data.py, data.pz);

      // 羽ばたきアニメーション（遠くから見るとゆっくり）
      data.wingPosition += data.wingSpeed;
      if (bird.children[2] && bird.children[3]) {
        const leftWing = bird.children[2]; 
        const rightWing = bird.children[3];
        leftWing.rotation.z = Math.sin(data.wingPosition) * 0.5 + Math.PI / 12;
        rightWing.rotation.z = -Math.sin(data.wingPosition) * 0.5 - Math.PI / 12;
      }

      // 回転（飛行方向を向く）
      bird.rotation.y = data.rotation;
    });
  });

  return (
    <group ref={groupRef}>
      {birds.map((data, i) => (
        <Bird 
          key={i} 
          position={[data.px, data.py, data.pz]} 
          scale={[data.scale, data.scale, data.scale]}
        />
      ))}
    </group>
  );
}

Birds.propTypes = {
  count: PropTypes.number
};

export default Birds;