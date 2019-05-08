export function qs(p) {
  return Object.keys(p)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(p[k])}`)
    .join('&');
}
