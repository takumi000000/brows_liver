import React, {
  useEffect,
  useRef,
} from 'react';
import { Rnd } from 'react-rnd';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  Scene,
  SourceLayout,
} from '../types/scene';
import { MediaSourceItem } from '../types/media';

interface Props {
  scenes: Scene[];
  activeSceneIndex: number;
  sources: MediaSourceItem[];
  upsertLayout: (sceneId: string, layout: SourceLayout) => void;
  removeLayout: (sceneId: string, layoutId: string) => void;
  canvasRefForFullscreen?: React.RefObject<HTMLDivElement>;

  // 追加: 選択されたレイアウト
  selectedLayoutId: string | null;
  onSelectLayout: (layoutId: string | null) => void;
}

export const CanvasEditor: React.FC<Props> = ({
  scenes,
  activeSceneIndex,
  sources,
  upsertLayout,
  removeLayout,
  canvasRefForFullscreen,
  selectedLayoutId,
  onSelectLayout,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // クロスフェード用
  const [displaySceneIndex, setDisplaySceneIndex] = React.useState(
    activeSceneIndex,
  );
  const [prevSceneIndex, setPrevSceneIndex] = React.useState<number | null>(
    null,
  );
  const transitionStartRef = useRef<number | null>(null);
  const transitionDuration = 500;

  // ソースID -> HTMLVideoElement
  const videoMapRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  // クロマキー用オフスクリーンキャンバス
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeScene = scenes[displaySceneIndex];

  // アクティブシーン切り替えでクロスフェード開始
  useEffect(() => {
    if (activeSceneIndex === displaySceneIndex) return;
    setPrevSceneIndex(displaySceneIndex);
    setDisplaySceneIndex(activeSceneIndex);
    transitionStartRef.current = performance.now();
  }, [activeSceneIndex, displaySceneIndex]);

  // sources → video 要素を準備
  useEffect(() => {
    sources.forEach(source => {
      let video = videoMapRef.current.get(source.id);

      if (!video) {
        video = document.createElement('video');
        video.playsInline = true;
        video.muted = true;
        video.autoplay = true;

        if (source.stream) {
          video.srcObject = source.stream;
          video.onloadedmetadata = () => {
            video?.play().catch(err => console.error(err));
          };
        } else if (source.fileUrl) {
          video.src = source.fileUrl;
          video.onloadedmetadata = () => {
            video?.play().catch(err => console.error(err));
          };
        }

        videoMapRef.current.set(source.id, video);
      }

      // ループ設定を同期
      if (source.type === 'video') {
        video.loop = !!source.loop;
      }
    });
  }, [sources]);

  // 描画ループ
  useEffect(() => {
    let animationFrameId: number;

    const draw = (time: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const now = time;
      const start = transitionStartRef.current;
      let progress = 1;

      if (start != null && prevSceneIndex != null) {
        progress = Math.min(1, (now - start) / transitionDuration);
        if (progress >= 1) {
          transitionStartRef.current = null;
          setPrevSceneIndex(null);
        }
      }

      const currentScene = scenes[displaySceneIndex];
      const prevScene = prevSceneIndex != null ? scenes[prevSceneIndex] : null;

      if (prevScene && progress < 1) {
        drawScene(ctx, prevScene, sources, 1 - progress);
        drawScene(ctx, currentScene, sources, progress);
      } else {
        drawScene(ctx, currentScene, sources, 1);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameId);
  }, [scenes, displaySceneIndex, prevSceneIndex, sources]);

  // シーン描画（クロマキー対応）
  const drawScene = (
    ctx: CanvasRenderingContext2D,
    scene: Scene,
    allSources: MediaSourceItem[],
    sceneAlpha: number,
  ) => {
    ctx.save();
    ctx.globalAlpha = sceneAlpha;

    const sortedLayouts = [...scene.layouts].sort(
      (a, b) => a.zIndex - b.zIndex,
    );

    for (const layout of sortedLayouts) {
      const source = allSources.find(s => s.id === layout.sourceId);
      if (!source) continue;

      const video = videoMapRef.current.get(source.id);
      if (!video) continue;
      if (video.readyState < 2) continue;

      const opacity = sceneAlpha * layout.opacity;

      // クロマキーが有効で、動画ソースの時のみ処理
      if (layout.chromaKeyEnabled && source.type === 'video') {
        const offscreen =
          offscreenCanvasRef.current ??
          (offscreenCanvasRef.current = document.createElement('canvas'));

        offscreen.width = layout.width;
        offscreen.height = layout.height;
        const octx = offscreen.getContext('2d');
        if (!octx) continue;

        octx.clearRect(0, 0, layout.width, layout.height);
        octx.drawImage(video, 0, 0, layout.width, layout.height);

        const imageData = octx.getImageData(
          0,
          0,
          layout.width,
          layout.height,
        );
        const data = imageData.data;

        const color = layout.chromaKeyColor ?? { r: 0, g: 255, b: 0 };
        const tolerance = layout.chromaKeyTolerance ?? 120;
        const tolSq = tolerance * tolerance;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const dr = r - color.r;
          const dg = g - color.g;
          const db = b - color.b;
          const distSq = dr * dr + dg * dg + db * db;

          if (distSq < tolSq) {
            // キー色に近い画素を透明に
            data[i + 3] = 0;
          }
        }

        octx.putImageData(imageData, 0, 0);

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(offscreen, layout.x, layout.y, layout.width, layout.height);
        ctx.restore();
      } else {
        // 通常描画
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(
          video,
          layout.x,
          layout.y,
          layout.width,
          layout.height,
        );
        ctx.restore();
      }
    }

    ctx.restore();
  };

  const handleLayoutChange = (layout: SourceLayout) => {
    upsertLayout(activeScene.id, layout);
  };

  const handleRemoveLayout = (layoutId: string) => {
    removeLayout(activeScene.id, layoutId);
    if (selectedLayoutId === layoutId) {
      onSelectLayout(null);
    }
  };

  return (
    <div
      ref={canvasRefForFullscreen ?? wrapperRef}
      style={{
        position: 'relative',
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'black',
      }}
      onClick={() => onSelectLayout(null)}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ display: 'block' }}
      />
      {/* 編集用オーバーレイ */}
      {activeScene.layouts.map(layout => {
        const isSelected = layout.id === selectedLayoutId;
        return (
          <Rnd
            key={layout.id}
            size={{ width: layout.width, height: layout.height }}
            position={{ x: layout.x, y: layout.y }}
            bounds="parent"
            onDragStop={(_, data) =>
              handleLayoutChange({
                ...layout,
                x: data.x,
                y: data.y,
              })
            }
            onResizeStop={(_, __, ref, ___, position) =>
              handleLayoutChange({
                ...layout,
                x: position.x,
                y: position.y,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
              })
            }
            onClick={e => {
              e.stopPropagation();
              onSelectLayout(layout.id);
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                border: isSelected
                  ? '2px solid rgba(0, 150, 255, 0.9)'
                  : '2px dashed rgba(255,255,255,0.6)',
                boxSizing: 'border-box',
                pointerEvents: 'auto',
              }}
            />
            <button
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                zIndex: 10,
                fontSize: 10,
              }}
              onClick={e => {
                e.stopPropagation();
                handleRemoveLayout(layout.id);
              }}
            >
              ✕
            </button>
          </Rnd>
        );
      })}
    </div>
  );
};
