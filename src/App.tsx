// src/App.tsx
import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { Layout } from './components/Layout';
import { SourcePanel } from './components/SourcePanel';
import { ScenePanel } from './components/ScenePanel';
import { CanvasEditor } from './components/CanvasEditor';
import { SourceInspector } from './components/SourceInspector';
import { useMediaSources } from './hooks/useMediaSources';
import { useScenes } from './hooks/useScenes';
import { SourceLayout } from './types/scene';

const App: React.FC = () => {
  const {
    sources,
    startScreenCapture,
    startCamera,
    addVideoFile,
    setVideoLoop,
    setVideoVolume,
    clearAllSources,
  } = useMediaSources();

  const {
    scenes,
    activeSceneIndex,
    setActiveSceneIndex,
    setSceneName,
    upsertLayout,
    addLayoutForSource,
    removeLayout,
    clearAllLayouts,
  } = useScenes();

  // ★ フルスクリーン用にキャンバスへの ref を持つ
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(
    null,
  );

  const handleEnterFullscreen = () => {
    const el = previewCanvasRef.current;
    if (el && el.requestFullscreen) {
      el.requestFullscreen().catch(err => {
        console.error('Fullscreen failed', err);
      });
    }
  };

  const activeScene = scenes[activeSceneIndex];

  const selectedLayout: SourceLayout | null = useMemo(() => {
    if (!selectedLayoutId) return null;
    return activeScene.layouts.find(l => l.id === selectedLayoutId) ?? null;
  }, [activeScene, selectedLayoutId]);

  const selectedSource = useMemo(() => {
    if (!selectedLayout) return undefined;
    return sources.find(s => s.id === selectedLayout.sourceId);
  }, [sources, selectedLayout]);

  // 1/2/3キーでシーン切り替え
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const index = Number(e.key) - 1;
        if (index >= 0 && index < scenes.length) {
          setActiveSceneIndex(index);
          setSelectedLayoutId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scenes.length, setActiveSceneIndex]);

  return (
    <Layout
      left={
        <SourcePanel
          sources={sources}
          onStartScreen={startScreenCapture}
          onStartCamera={startCamera}
          onAddVideo={addVideoFile}
          onClearAllSources={clearAllSources}
          onClearAllLayouts={clearAllLayouts}
        />
      }
      center={
        <CanvasEditor
          scenes={scenes}
          activeSceneIndex={activeSceneIndex}
          sources={sources}
          upsertLayout={upsertLayout}
          removeLayout={removeLayout}
          fullscreenCanvasRef={previewCanvasRef} // ★ ここ
          selectedLayoutId={selectedLayoutId}
          onSelectLayout={setSelectedLayoutId}
        />
      }
      right={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <ScenePanel
            scenes={scenes}
            activeSceneIndex={activeSceneIndex}
            setActiveSceneIndex={index => {
              setActiveSceneIndex(index);
              setSelectedLayoutId(null);
            }}
            setSceneName={setSceneName}
            addLayoutForSource={addLayoutForSource}
            sources={sources}
            onEnterFullscreen={handleEnterFullscreen}
          />
          <SourceInspector
            layout={selectedLayout}
            source={selectedSource}
            onChangeLayout={layout => upsertLayout(activeScene.id, layout)}
            onChangeVideoLoop={setVideoLoop}
            onChangeVideoVolume={setVideoVolume}
            onDeleteLayout={layoutId => {
              removeLayout(activeScene.id, layoutId);
              setSelectedLayoutId(null);
            }}
          />
        </div>
      }
    />
  );
};

export default App;
