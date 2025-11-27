import React, { ChangeEvent } from 'react';
import { MediaSourceItem } from '../types/media';

interface Props {
  sources: MediaSourceItem[];
  onStartScreen: () => void;
  onStartCamera: () => void;
  onAddVideo: (file: File) => void;
}

export const SourcePanel: React.FC<Props> = ({
  sources,
  onStartScreen,
  onStartCamera,
  onAddVideo,
}) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddVideo(file);
      e.target.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h2 style={{ fontSize: 16, margin: 0 }}>ソース</h2>
      <button onClick={onStartScreen}>画面キャプチャを追加</button>
      <button onClick={onStartCamera}>カメラを追加</button>
      <label
        style={{
          display: 'inline-block',
          padding: '4px 8px',
          borderRadius: 4,
          backgroundColor: '#2a2a2a',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        動画ファイルを追加
        <input
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </label>

      <hr style={{ borderColor: '#333' }} />

      <div style={{ fontSize: 12, opacity: 0.8 }}>追加済みソース</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12 }}>
        {sources.map(src => (
          <li
            key={src.id}
            style={{
              padding: 4,
              borderRadius: 4,
              backgroundColor: '#252525',
              marginBottom: 4,
            }}
          >
            <div>{src.label}</div>
            <div style={{ opacity: 0.7 }}>
              {src.type === 'screen' && '画面キャプチャ'}
              {src.type === 'camera' && 'カメラ'}
              {src.type === 'video' && '動画ファイル'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
