// src/hooks/useScenes.ts
import { useEffect, useState } from 'react';
import { Scene, SourceLayout } from '../types/scene';
import { loadScenes, saveScenes } from '../utils/storage';

let layoutCounter = 1;

function createDefaultScenes(): Scene[] {
  return [1, 2, 3].map(i => ({
    id: `scene-${i}`,
    name: `Scene ${i}`,
    layouts: [],
  }));
}

export function useScenes() {
  const [scenes, setScenes] = useState<Scene[]>(() => {
    const loaded = loadScenes();
    const initial = loaded ?? createDefaultScenes();

    // ★ ここで既存レイアウトの最大番号を調べて layoutCounter を進める
    let maxIdNum = 0;
    initial.forEach(scene => {
      scene.layouts.forEach(layout => {
        const m = layout.id.match(/^layout-(\d+)$/);
        if (m) {
          const n = Number(m[1]);
          if (!Number.isNaN(n)) {
            maxIdNum = Math.max(maxIdNum, n);
          }
        }
      });
    });
    layoutCounter = maxIdNum + 1;

    return initial;
  });

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  useEffect(() => {
    saveScenes(scenes);
  }, [scenes]);

  const updateScene = (sceneId: string, updater: (scene: Scene) => Scene) => {
    setScenes(prev =>
      prev.map(s => (s.id === sceneId ? updater(s) : s)),
    );
  };

  const setSceneName = (sceneId: string, name: string) => {
    updateScene(sceneId, s => ({ ...s, name }));
  };

  const upsertLayout = (sceneId: string, layout: SourceLayout) => {
    updateScene(sceneId, scene => {
      const exists = scene.layouts.find(l => l.id === layout.id);
      if (exists) {
        return {
          ...scene,
          layouts: scene.layouts.map(l => (l.id === layout.id ? layout : l)),
        };
      }
      return { ...scene, layouts: [...scene.layouts, layout] };
    });
  };

  const addLayoutForSource = (sceneId: string, sourceId: string) => {
    const newLayout: SourceLayout = {
      id: `layout-${layoutCounter++}`,
      sourceId,
      x: 100,
      y: 100,
      width: 640,
      height: 360,
      zIndex: 1,
      opacity: 1,
      chromaKeyEnabled: false,
      chromaKeyColor: { r: 0, g: 255, b: 0 },
      chromaKeyTolerance: 120,
    };
    updateScene(sceneId, scene => ({
      ...scene,
      layouts: [...scene.layouts, newLayout],
    }));
  };

  const removeLayout = (sceneId: string, layoutId: string) => {
    updateScene(sceneId, scene => ({
      ...scene,
      layouts: scene.layouts.filter(l => l.id !== layoutId),
    }));
  };

  const clearAllLayouts = () => {
    setScenes(prev =>
      prev.map(scene => ({
        ...scene,
        layouts: [],
      })),
    );
  };

  return {
    scenes,
    activeSceneIndex,
    setActiveSceneIndex,
    setSceneName,
    upsertLayout,
    addLayoutForSource,
    removeLayout,
    clearAllLayouts,
  };
}
