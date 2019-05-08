export function twitterRedirect(twitterStartUrl, apiKey, itemId, callbackUrl) {
  return `${twitterStartUrl}#apiKey=${encodeURIComponent(
    apiKey,
  )}&callbackUrl=${encodeURIComponent(callbackUrl)}&itemId=${encodeURIComponent(
    itemId,
  )}`;
}
