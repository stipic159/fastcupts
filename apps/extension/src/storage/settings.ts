import { storage } from '#imports';

export const settingsStorage = storage.defineItem('sync:settings', {
  fallback: { eloD: 400, allowPartialPrediction: false },
});
