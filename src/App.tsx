import React, { useRef } from 'react';
import { Layout } from './components/Layout';
import { SourcePanel } from './components/SourcePanel';
import { ScenePanel } from './components/ScenePanel';
import { CanvasEditor } from './components/CanvasEditor';
import { useMediaSources } from './hooks/useMediaSources';
import { useScenes } from './hooks/useScenes';

const App: React.FC = () => {
  const { sources, startScreenCapture, startCamera, addVideoFile } =
    useMediaSources();
  const {
    scenes,
    activeSceneIndex,
    setActiveSceneIndex,
    setSceneName,
    upsertLayout,
    addLayoutForSource,
    removeLayout,
  } = useScenes();

  // フルスクリーン用のラッパ
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleEnterFullscreen = () => {
    const el = canvasWrapperRef.current;
    if (el && el.requestFullscreen) {
      el.requestFullscreen().catch(err => {
        console.error('Fullscreen failed', err);
      });
    }
  };

  return (
    <Layout
      left={
        <SourcePanel
          sources={sources}
          onStartScreen={startScreenCapture}
          onStartCamera={startCamera}
          onAddVideo={addVideoFile}
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
        />
      }
      right={
        <ScenePanel
          scenes={scenes}
          activeSceneIndex={activeSceneIndex}
          setActiveSceneIndex={setActiveSceneIndex}
          setSceneName={setSceneName}
          addLayoutForSource={addLayoutForSource}
          sources={sources}
          onEnterFullscreen={handleEnterFullscreen}
        />
      }
    />
  );
};

export default App;
