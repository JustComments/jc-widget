const BASE_URL = `${PROTO}://${ENDPOINT}`;

export default function twitterCallback(apiKey, itemId, data) {
  const request = new Request(
    `${BASE_URL}/auth/twitter/callback?apiKey=${apiKey}`,
    {
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
    },
  );
  return fetch(request)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Twitter callback failed');
      }
      return response.json();
    })
    .then((json) => {
      const { jwt } = json;
      return {
        jwt,
      };
    })
    .catch((err) => {
      console.error('Error in twitterCallback', err);
      throw err;
    });
}
