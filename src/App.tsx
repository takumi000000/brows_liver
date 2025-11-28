import React, { useRef, useMemo, useState } from 'react';
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
    setVideoVolume,   // ★ 追加
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

  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);

  const handleEnterFullscreen = () => {
    const el = canvasWrapperRef.current;
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
          canvasRefForFullscreen={canvasWrapperRef}
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
            onChangeVideoVolume={setVideoVolume}   // ★ ここで渡す
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
