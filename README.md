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

## Configuration

The following environmental variables can configure the widget:

```
ENDPOINT=...      # endpoint pointing to a compatible API
PROTO=...         # protocol for the endpoint
GUEST_SECRET      # the key which would identify gues users
PUSH_URL          # URL to set up push notifications
SELF_URL          # URL of the core.js
TWITTER_START_URL # URL to start Twitter login flow
```

## Running in development mode

```sh
npm start # starts a server at localhost:3333
```

## Build

```sh
npm run build
```
