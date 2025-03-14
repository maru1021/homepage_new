/* eslint-disable react/no-unknown-property */
import React, { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';


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

export default Rain;