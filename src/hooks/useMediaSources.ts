import { useState } from 'react';
import { MediaSourceItem } from '../types/media';

let sourceCounter = 1;

function cleanupSource(source: MediaSourceItem) {
  if (source.stream) {
    source.stream.getTracks().forEach(t => t.stop());
  }
  if (source.fileUrl) {
    URL.revokeObjectURL(source.fileUrl);
  }
}

export function useMediaSources() {
  const [sources, setSources] = useState<MediaSourceItem[]>([]);

  const addSource = (source: MediaSourceItem) => {
    setSources(prev => [...prev, source]);
  };

  const startScreenCapture = async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: false,
      });

      const id = `screen-${sourceCounter++}`;
      addSource({
        id,
        type: 'screen',
        label: `画面キャプチャ ${sourceCounter - 1}`,
        stream,
      });
    } catch (e) {
      console.error('画面キャプチャの取得に失敗しました', e);
      alert('画面キャプチャの取得に失敗しました。権限を確認してください。');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      const id = `camera-${sourceCounter++}`;
      addSource({
        id,
        type: 'camera',
        label: `カメラ ${sourceCounter - 1}`,
        stream,
      });
    } catch (e) {
      console.error('カメラの取得に失敗しました', e);
      alert('カメラの取得に失敗しました。権限を確認してください。');
    }
  };

  const addVideoFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const id = `video-${sourceCounter++}`;
    addSource({
      id,
      type: 'video',
      label: file.name,
      fileUrl: url,
      loop: true,   // デフォルトでループON
      volume: 1,    // ★ デフォルト音量 100%
    });
  };

  // 動画ループフラグ更新
  const setVideoLoop = (sourceId: string, loop: boolean) => {
    setSources(prev =>
      prev.map(s =>
        s.id === sourceId && s.type === 'video' ? { ...s, loop } : s,
      ),
    );
  };

  // ★ 動画音量更新（0〜1）
  const setVideoVolume = (sourceId: string, volume: number) => {
    setSources(prev =>
      prev.map(s =>
        s.id === sourceId && s.type === 'video' ? { ...s, volume } : s,
      ),
    );
  };

  // 一括削除などはそのまま
  const clearAllSources = () => {
    setSources(prev => {
      prev.forEach(cleanupSource);
      return [];
    });
  };

  return {
    sources,
    startScreenCapture,
    startCamera,
    addVideoFile,
    setVideoLoop,
    setVideoVolume,
    clearAllSources,
  };
}
