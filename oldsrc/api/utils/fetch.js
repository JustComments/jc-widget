export function fetch(url, params) {
  const request = new Request(url, params);
  return window
    .fetch(request)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .catch((err) => {
      console.error(
        'Failed to fetch data. Check that your have enough credits on your account.',
        err,
      );
      throw err;
    });
}
