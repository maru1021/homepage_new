/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// 最小限のマトリックスローディングコンポーネント
function MatrixLoad({ isLoading }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const activeRef = useRef(true);
  const dataRef = useRef(null);
  
  // 単一のuseEffectでアニメーションを管理
  useEffect(() => {
    activeRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // キャンバスサイズの設定とデータの初期化
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const fontSize = 16;
      const columns = Math.ceil(canvas.width / fontSize);
      
      // シンプルな配列を使用
      dataRef.current = {
        drops: Array(columns).fill(0).map(() => Math.random() * -100),
        colors: Array(columns).fill(0).map(() => {
          const g = 150 + Math.floor(Math.random() * 106);
          return `rgb(0, ${g}, 0)`;
        }),
        speeds: Array(columns).fill(0).map(() => 0.8 + Math.random() * 0.6),
        fontSize
      };
    };
    
    init();
    window.addEventListener('resize', init);
    
    // 最小限の描画関数
    const draw = () => {
      if (!activeRef.current) return;
      
      const { drops, colors, speeds, fontSize } = dataRef.current;
      
      // 背景クリア
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 文字の描画
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        // 1か0をランダムに選択
        const text = Math.random() > 0.5 ? '1' : '0';
        
        // 先頭の文字は明るく
        ctx.fillStyle = (drops[i] * fontSize > 0 && 
                          drops[i] * fontSize < canvas.height && 
                          Math.random() > 0.975) ? '#ffffff' : colors[i];
        
        // 文字を描画
        ctx.fillText(text, i * fontSize, Math.floor(drops[i]) * fontSize);
        
        // 画面外に出たらリセット
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // 位置を更新
        drops[i] += speeds[i];
      }
      
      // アニメーションを継続
      animationRef.current = requestAnimationFrame(draw);
    };
    
    // アニメーション開始
    animationRef.current = requestAnimationFrame(draw);
    
    // クリーンアップ
    return () => {
      activeRef.current = false;
      window.removeEventListener('resize', init);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <>
      {/* マトリックスレインキャンバス */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: isLoading ? 1 : 0,
          transition: 'opacity 1s ease-out',
          zIndex: 50
        }}
      />
      
      {/* ローディングテキスト */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#00ff00',
          textAlign: 'center',
          zIndex: 100,
          fontFamily: 'monospace',
          opacity: isLoading ? 1 : 0,
          transition: 'opacity 1s ease-out',
          textShadow: '0 0 10px #00ff00'
        }}
      >
        <h2 style={{ fontSize: '24px', letterSpacing: '3px' }}>LOADING</h2>
        <div className="dots">
          <span>.</span><span>.</span><span>.</span>
        </div>
        <style jsx="true">{`
          .dots span {
            animation: blink 1.4s infinite;
            animation-fill-mode: both;
            font-size: 24px;
          }
          .dots span:nth-child(2) {
            animation-delay: 0.2s;
          }
          .dots span:nth-child(3) {
            animation-delay: 0.4s;
          }
          @keyframes blink {
            0% { opacity: 0.2; }
            20% { opacity: 1; }
            100% { opacity: 0.2; }
          }
        `}</style>
      </div>
    </>
  );
}

MatrixLoad.propTypes = {
  isLoading: PropTypes.bool.isRequired
};

export { MatrixLoad };