import { Scene } from '../types/scene';

const SCENES_KEY = 'obs-lite-scenes-v1';

export function loadScenes(): Scene[] | null {
  try {
    const raw = localStorage.getItem(SCENES_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Scene[];
  } catch {
    return null;
  }
}

export function saveScenes(scenes: Scene[]) {
  try {
    localStorage.setItem(SCENES_KEY, JSON.stringify(scenes));
  } catch {
    // 失敗しても致命的ではないので握りつぶす
  }
}
