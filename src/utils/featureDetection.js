export function supportsServiceWorkers() {
  return 'serviceWorker' in navigator;
}