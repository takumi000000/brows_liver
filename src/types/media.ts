// 変更点：volume を追加

export type MediaSourceType = 'screen' | 'camera' | 'video';

export interface MediaSourceItem {
  id: string;
  type: MediaSourceType;
  label: string;
  // 画面 / カメラ
  stream?: MediaStream;
  // 動画ファイル
  fileUrl?: string;
  // 動画ループ再生フラグ（video の時だけ使用）
  loop?: boolean;

  // ★ 追加：音量（0〜1）, 動画のみ使用
  volume?: number;
}
