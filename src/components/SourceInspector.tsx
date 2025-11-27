import React from 'react';
import { MediaSourceItem } from '../types/media';
import { SourceLayout } from '../types/scene';

interface Props {
  layout: SourceLayout | null;
  source: MediaSourceItem | undefined;
  onChangeLayout: (layout: SourceLayout) => void;
  onChangeVideoLoop: (sourceId: string, loop: boolean) => void;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

export const SourceInspector: React.FC<Props> = ({
  layout,
  source,
  onChangeLayout,
  onChangeVideoLoop,
}) => {
  if (!layout || !source) {
    return (
      <div
        style={{
          fontSize: 12,
          opacity: 0.7,
          marginTop: 'auto',
        }}
      >
        キャンバス上のソースをクリックすると、
        <br />
        ここに設定が表示されます。
      </div>
    );
  }

  const chromaEnabled = !!layout.chromaKeyEnabled;
  const color = layout.chromaKeyColor ?? { r: 0, g: 255, b: 0 };
  const tolerance = layout.chromaKeyTolerance ?? 120;

  const handleToggleChroma = () => {
    onChangeLayout({
      ...layout,
      chromaKeyEnabled: !chromaEnabled,
    });
  };

  const handleColorChange = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    onChangeLayout({
      ...layout,
      chromaKeyColor: rgb,
    });
  };

  const handleToleranceChange = (value: number) => {
    onChangeLayout({
      ...layout,
      chromaKeyTolerance: value,
    });
  };

  const defaultHex = rgbToHex(color.r, color.g, color.b);

  return (
    <div
      style={{
        marginTop: 'auto',
        paddingTop: 8,
        borderTop: '1px solid #333',
        fontSize: 12,
      }}
    >
      <div style={{ marginBottom: 4, opacity: 0.8 }}>選択中ソース</div>
      <div
        style={{
          padding: 6,
          borderRadius: 4,
          backgroundColor: '#252525',
          marginBottom: 8,
        }}
      >
        <div>{source.label}</div>
        <div style={{ opacity: 0.7 }}>
          {source.type === 'screen' && '画面キャプチャ'}
          {source.type === 'camera' && 'カメラ'}
          {source.type === 'video' && '動画ファイル'}
        </div>
      </div>

      {/* 動画ループ */}
      {source.type === 'video' && (
        <div
          style={{
            marginBottom: 8,
            padding: 6,
            borderRadius: 4,
            backgroundColor: '#252525',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="checkbox"
              checked={!!source.loop}
              onChange={e =>
                onChangeVideoLoop(source.id, e.target.checked)
              }
            />
            動画をループ再生する
          </label>
        </div>
      )}

      {/* クロマキー設定（動画のみ想定だが他にも使いたければOK） */}
      {source.type === 'video' && (
        <div
          style={{
            padding: 6,
            borderRadius: 4,
            backgroundColor: '#252525',
          }}
        >
          <label
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <input
              type="checkbox"
              checked={chromaEnabled}
              onChange={handleToggleChroma}
            />
            クロマキー（背景色を抜く）
          </label>

          {chromaEnabled && (
            <>
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 4 }}>キー色</div>
                <input
                  type="color"
                  value={defaultHex}
                  onChange={e => handleColorChange(e.target.value)}
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 4 }}>
                  しきい値（{tolerance}）
                </div>
                <input
                  type="range"
                  min={10}
                  max={200}
                  value={tolerance}
                  onChange={e =>
                    handleToleranceChange(Number(e.target.value))
                  }
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
