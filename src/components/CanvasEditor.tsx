import React, {
  useEffect,
  useRef,
  useState,
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
}

export const CanvasEditor: React.FC<Props> = ({
  scenes,
  activeSceneIndex,
  sources,
  upsertLayout,
  removeLayout,
  canvasRefForFullscreen,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 内部用：クロスフェード管理
  const [displaySceneIndex, setDisplaySceneIndex] = useState(activeSceneIndex);
  const [prevSceneIndex, setPrevSceneIndex] = useState<number | null>(null);
  const transitionStartRef = useRef<number | null>(null);
  const transitionDuration = 500; // ms

  // ソースID -> HTMLVideoElement
  const videoMapRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  const activeScene = scenes[displaySceneIndex];

  // アクティブシーンが変更されたらクロスフェード開始
  useEffect(() => {
    if (activeSceneIndex === displaySceneIndex) return;
    setPrevSceneIndex(displaySceneIndex);
    setDisplaySceneIndex(activeSceneIndex);
    transitionStartRef.current = performance.now();
  }, [activeSceneIndex, displaySceneIndex]);

  // sources から video 要素を準備
  useEffect(() => {
    sources.forEach(source => {
      if (videoMapRef.current.has(source.id)) return;

      const video = document.createElement('video');
      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;

      if (source.stream) {
        video.srcObject = source.stream;
        video.onloadedmetadata = () => {
          video.play().catch(err => console.error(err));
        };
      } else if (source.fileUrl) {
        video.src = source.fileUrl;
        video.onloadedmetadata = () => {
          video.play().catch(err => console.error(err));
        };
      }

      videoMapRef.current.set(source.id, video);
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
          // 終了後 prevScene は不要
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

  // シーン描画
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
      if (video.readyState < 2) continue; // enough data?

      ctx.save();
      ctx.globalAlpha = sceneAlpha * layout.opacity;
      ctx.drawImage(
        video,
        layout.x,
        layout.y,
        layout.width,
        layout.height,
      );
      ctx.restore();
    }

    ctx.restore();
  };

  // レイアウト更新
  const handleLayoutChange = (layout: SourceLayout) => {
    upsertLayout(activeScene.id, layout);
  };

  const handleRemoveLayout = (layoutId: string) => {
    removeLayout(activeScene.id, layoutId);
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
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ display: 'block' }}
      />
      {/* 編集用オーバーレイ */}
      {activeScene.layouts.map(layout => (
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
          onResizeStop={(_, __, ref, delta, position) =>
            handleLayoutChange({
              ...layout,
              x: position.x,
              y: position.y,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            })
          }
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              border: '2px dashed rgba(255,255,255,0.6)',
              boxSizing: 'border-box',
              pointerEvents: 'none',
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
      ))}
    </div>
  );
};
