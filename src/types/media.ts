// メディアソースの種類
export type MediaSourceType = 'screen' | 'camera' | 'video';

export interface MediaSourceItem {
  id: string;
  type: MediaSourceType;
  label: string;
  // stream: 画面キャプチャ / カメラ
  stream?: MediaStream;
  // 動画ファイル用
  fileUrl?: string;
}
