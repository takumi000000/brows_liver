export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

// クロマキー用の色
export interface ChromaKeyColor {
  r: number;
  g: number;
  b: number;
}

export interface SourceLayout {
  id: string;
  sourceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  opacity: number;     // 0〜1

  // クロマキー用設定（動画向け）
  chromaKeyEnabled?: boolean;
  chromaKeyColor?: ChromaKeyColor;   // デフォルトは {0,255,0} を想定
  chromaKeyTolerance?: number;       // 例: 80〜150 くらい
}

export interface Scene {
  id: string;
  name: string;
  layouts: SourceLayout[];
}
