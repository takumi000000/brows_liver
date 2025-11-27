// キャンバスの論理解像度
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export interface SourceLayout {
  id: string;          // レイアウト自体のID
  sourceId: string;    // 紐付くMediaSourceItemのID
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  opacity: number;     // 0〜1
}

export interface Scene {
  id: string;
  name: string;
  layouts: SourceLayout[];
}
