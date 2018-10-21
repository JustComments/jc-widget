export default function isBot() {
  return /bot|google|baidu|bing|msn|duckduckgo|teoma|slurp|yandex/i.test(
    navigator.userAgent || '',
  );
}
