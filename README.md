# Comments Widget for just-comments.com

[Demo](https://just-comments.com/demo.html)

## Installation

```sh
npm install
```

## Configuration

The following environmental variables can configure the widget:

```
ENDPOINT=...      # endpoint pointing to a compatible API
PROTO=...         # protocol for the endpoint
NO_PIC_URL        # URL of a picture to be used for comments without one
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


