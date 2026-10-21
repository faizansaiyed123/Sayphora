// Service worker lifecycle for Sayphora. The worker itself is generated at build time by vite-plugin-pwa.
import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker(callbacks: { onOfflineReady?: () => void } = {}) {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  registerSW({
    immediate: true,
    onOfflineReady: callbacks.onOfflineReady,
    onRegisterError: (err) => console.warn('[Sayphora] service worker registration failed', err)
  });
}

/** Clears every Cache Storage bucket (used by the admin console's "purge caches" action). */
export async function clearAllCaches(): Promise<boolean> {
  if (!('caches' in window)) return false;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    return true;
  } catch {
    return false;
  }
}
