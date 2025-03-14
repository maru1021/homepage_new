/* eslint-disable react/no-unknown-property */
import React, { useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

// 雨のパーティクル
function Rain({ count = 1000 }) {
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100; // x
      positions[i * 3 + 1] = Math.random() * 100; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100; // z
    }
    return positions;
  }, [count]);

  const speeds = useMemo(() => {
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      speeds[i] = 0.1 + Math.random() * 0.2;
    }
    return speeds;
  }, [count]);

  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;

    const positions = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      // 雨を下に移動
      positions[i * 3 + 1] -= speeds[i];

      // 画面外に出たら上に戻す
      if (positions[i * 3 + 1] < -20) {
        positions[i * 3 + 1] = 20;
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ccddff"
        size={0.2}
        transparent
        opacity={0.6}
        fog={true}
      />
    </points>
  );
}

Rain.propTypes = {
  count: PropTypes.number
};

// よりリアルな鳥
function RealisticBird({ position, scale = [1, 1, 1] }) {
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

RealisticBird.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  scale: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.number
  ])
};

// 鳥の群れ（少数）
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
        <RealisticBird
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

// よりリアルな雲
function RealisticCloud({ position, scale }) {
  const cloudRef = useRef();

  // 雲の密度に基づく部分の数
  const cloudParts = Math.floor(5 + scale * 1.5);

  return (
    <group ref={cloudRef} position={position} scale={[scale, scale * 0.6, scale]}>
      {/* 雲の中心部 */}
      <mesh>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#f0f0f0"
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
              color="#f8f8f8"
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

RealisticCloud.propTypes = {
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
        scale: 8 + Math.random() * 15, // もっと大きく見せる
        speed: (Math.random() * 0.003) + 0.001, // とても遅く
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
        <RealisticCloud
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

function Sky() {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#000', position: 'relative' }}>
      <Canvas camera={{ position: [0, 10, 30], fov: 65 }}>
        {/* 環境マップ */}
        <Environment files="/3D/test.exr" background={true} />

        {/* 雨パーティクル */}
        <Rain count={3000} />

        {/* 鳥 */}
        <Birds count={15} />

        {/* よりリアルな雲（少数） */}
        <Clouds count={5} />

        {/* 光源 */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <hemisphereLight args={['#aaaaff', '#ffffaa', 0.4]} />

        {/* より濃いフォグを追加して遠くの物体をぼかす */}
        <fog attach="fog" args={['#aabbcc', 30, 150]} />

        {/* カメラコントロール */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

export default Sky;