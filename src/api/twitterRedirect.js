const startUrl = TWITTER_START_URL;

export default function getTwitterRedirectUrl(apiKey, itemId, callbackUrl) {
  return `${startUrl}#apiKey=${encodeURIComponent(
    apiKey,
  )}&callbackUrl=${encodeURIComponent(callbackUrl)}&itemId=${encodeURIComponent(
    itemId,
  )}`;
}
