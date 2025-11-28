// src/components/ScenePanel.tsx
import React, { useState } from 'react';
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
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');

  const handleStartEdit = (scene: Scene) => {
    setEditingSceneId(scene.id);
    setTempName(scene.name);
  };

  const handleFinishEdit = (scene: Scene) => {
    setSceneName(scene.id, tempName || scene.name);
    setEditingSceneId(null);
  };

  const handleAddSourceToScene = () => {
    if (!selectedSourceId) return;
    const activeScene = scenes[activeSceneIndex];
    if (!activeScene) return;
    addLayoutForSource(activeScene.id, selectedSourceId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* タイトル */}
      <div className="panel-title">シーン</div>

      {/* シーン一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {scenes.map((scene, index) => {
          const active = index === activeSceneIndex;
          const isEditing = editingSceneId === scene.id;

          return (
            <div
              key={scene.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {/* シーンのチップ */}
              <button
                className={`scene-chip ${
                  active ? 'scene-chip-active' : 'scene-chip-inactive'
                }`}
                onClick={() => setActiveSceneIndex(index)}
                style={{
                  flex: 1,
                  justifyContent: 'flex-start',
                  paddingInline: 10,
                }}
              >
                {isEditing ? (
                  <input
                    className="input"
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                    value={tempName}
                    autoFocus
                    onChange={e => setTempName(e.target.value)}
                    onBlur={() => handleFinishEdit(scene)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleFinishEdit(scene);
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    {scene.name}
                  </span>
                )}
              </button>

              {/* 編集ボタン */}
              <button
                className="btn"
                style={{
                  padding: '4px 8px',
                  borderRadius: 8,
                  fontSize: 10,
                  opacity: isEditing ? 0.5 : 1,
                }}
                disabled={isEditing}
                onClick={() => handleStartEdit(scene)}
              >
                名前
              </button>
            </div>
          );
        })}
      </div>

      <hr style={{ borderColor: '#33415560', margin: '8px 0' }} />

      {/* シーンにソースを追加：プルダウン */}
      <div className="panel-title" style={{ marginTop: 4 }}>
        シーンにソースを追加
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <select
          className="input"
          style={{ borderRadius: 10 }}
          value={selectedSourceId}
          onChange={e => setSelectedSourceId(e.target.value)}
        >
          <option value="">ソースを選択してください</option>
          {sources.map(src => (
            <option key={src.id} value={src.id}>
              {src.label}　
              {src.type === 'screen' && '(画面)'}
              {src.type === 'camera' && '(カメラ)'}
              {src.type === 'video' && '(動画)'}
            </option>
          ))}
        </select>

        <button
          className="btn"
          disabled={!selectedSourceId || sources.length === 0}
          onClick={handleAddSourceToScene}
        >
          このシーンに追加
        </button>
      </div>

      <hr style={{ borderColor: '#33415560', margin: '8px 0' }} />

      {/* プロジェクター表示 */}
      <button
        className="btn btn-accent"
        onClick={onEnterFullscreen}
        style={{
          width: '100%',
          marginTop: 4,
          fontSize: 13,
          padding: '8px 12px',
          borderRadius: 12,
        }}
      >
        プロジェクター表示（フルスクリーン）
      </button>
    </div>
  );
};
