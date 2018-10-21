import { fetch } from './utils/fetch';

export function twitterCallback(url, apiKey, itemId, data) {
  return fetch(`${url}?apiKey=${apiKey}`, {
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    headers: new Headers({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    }),
    body: JSON.stringify({
      itemId,
      ...data,
    }),
  }).then((json) => {
    const { jwt } = json;
    return {
      jwt,
    };
  });
}
