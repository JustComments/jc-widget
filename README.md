# Comment widget for just-comments.com

[Demo](https://just-comments.com/demo.html)

This project contains the source code of the commenting widget used by
JustComments. The widget is designed to be embedded into 3rd party websites to
provide the functionaility to discuss the content on a page. The backend is not
included in this repository.

## Installation

Checkout the project and install dependencies:

```sh
npm install
```

## Running in development mode

```sh
npm start # starts a server at localhost:3333
```

## Build

```sh
npm run build -- \
  --endpoint=.. \
  --proto=http \
  --guestSecret=... \
  --pushUrl=... \
  --selfUrl=... \
  --twitterStartUrl=...
```
