import React from 'react';
import { Scene } from '../types/scene';
import { MediaSourceItem } from '../types/media';

interface Props {
  scenes: Scene[];
  activeSceneIndex: number;
  setActiveSceneIndex: (index: number) => void;
  setSceneName: (sceneId: string, name: string) => void;
  addLayoutForSource: (sceneId: string, sourceId: string) => void;
  sources: MediaSourceItem[];
  onEnterFullscreen: () => void;
}

export const ScenePanel: React.FC<Props> = ({
  scenes,
  activeSceneIndex,
  setActiveSceneIndex,
  setSceneName,
  addLayoutForSource,
  sources,
  onEnterFullscreen,
}) => {
  const activeScene = scenes[activeSceneIndex];

  const handleAddSourceToScene = (sourceId: string) => {
    addLayoutForSource(activeScene.id, sourceId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h2 style={{ fontSize: 16, margin: 0 }}>シーン</h2>

      <div style={{ display: 'flex', gap: 4 }}>
        {scenes.map((scene, index) => (
          <button
            key={scene.id}
            onClick={() => setActiveSceneIndex(index)}
            style={{
              flex: 1,
              backgroundColor:
                index === activeSceneIndex ? '#0d47a1' : '#2a2a2a',
              color: '#fff',
            }}
          >
            {scene.name}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12 }}>
        シーン名:
        <input
          value={activeScene.name}
          onChange={e => setSceneName(activeScene.id, e.target.value)}
          style={{
            width: '100%',
            marginTop: 4,
            backgroundColor: '#252525',
            borderRadius: 4,
            border: '1px solid #333',
            color: '#fff',
          }}
        />
      </div>

      <hr style={{ borderColor: '#333' }} />

      <div style={{ fontSize: 12, marginBottom: 4 }}>
        アクティブシーンにソースを追加
      </div>
      <select
        onChange={e => {
          if (e.target.value) {
            handleAddSourceToScene(e.target.value);
            e.target.value = '';
          }
        }}
        style={{
          backgroundColor: '#252525',
          color: '#fff',
          borderRadius: 4,
          border: '1px solid #333',
        }}
        defaultValue=""
      >
        <option value="">ソースを選択...</option>
        {sources.map(src => (
          <option key={src.id} value={src.id}>
            {src.label}
          </option>
        ))}
      </select>

      <hr style={{ borderColor: '#333' }} />

      <button onClick={onEnterFullscreen}>プロジェクター表示（全画面）</button>
    </div>
  );
};
