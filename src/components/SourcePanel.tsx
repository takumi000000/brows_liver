// src/components/SourcePanel.tsx
import React from 'react';
import { MediaSourceItem } from '../types/media';

interface Props {
  sources: MediaSourceItem[];
  onStartScreen: () => void;
  onStartCamera: () => void;
  onAddVideo: (file: File) => void;
  onClearAllSources: () => void;
  onClearAllLayouts: () => void;
}

export const SourcePanel: React.FC<Props> = ({
  sources,
  onStartScreen,
  onStartCamera,
  onAddVideo,
  onClearAllSources,
  onClearAllLayouts,
}) => {
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    onAddVideo(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'すべてのソースとキャンバス上のレイアウトを削除します。\nよろしいですか？',
      )
    ) {
      onClearAllLayouts();
      onClearAllSources();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h2 style={{ fontSize: 14, margin: 0, marginBottom: 4 }}>ソース管理</h2>

      {/* ソース追加ボタン群 */}
      <button className="btn btn-accent" onClick={onStartScreen}>
        画面キャプチャを追加
      </button>
      <button className="btn" onClick={onStartCamera}>
        カメラを追加
      </button>

      {/* 動画ファイルを追加（見た目は完全にボタン） */}
      <div
        style={{
          position: 'relative',
          marginTop: 2,
        }}
      >
        <button
          type="button"
          className="btn"
          style={{
            width: '100%',
            justifyContent: 'center',
          }}
        >
          動画ファイルを追加
        </button>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer',
          }}
        />
      </div>

      <button
        className="btn btn-danger"
        onClick={handleClearAll}
        style={{ marginTop: 8 }}
      >
        すべてのソース・レイアウトを削除
      </button>

      <hr style={{ borderColor: '#33415560', margin: '10px 0' }} />

      {/* 追加済みソース一覧 */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        追加済みソース
      </div>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '4px 0 0',
          fontSize: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {sources.map(src => (
          <li
            key={src.id}
            style={{
              padding: 6,
              borderRadius: 999,
              background: 'rgba(15,23,42,0.85)',
              border: '1px solid rgba(148,163,184,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div>{src.label}</div>
            <div style={{ opacity: 0.7, fontSize: 11 }}>
              {src.type === 'screen' && '画面キャプチャ'}
              {src.type === 'camera' && 'カメラ'}
              {src.type === 'video' && '動画ファイル'}
            </div>
          </li>
        ))}
        {sources.length === 0 && (
          <li
            style={{
              marginTop: 4,
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            まだソースが追加されていません。
          </li>
        )}
      </ul>
    </div>
  );
};
