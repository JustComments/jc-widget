<h1 align="center">
  JustComments Widget
  <a href="https://travis-ci.org/JustComments/widget"><img src="https://travis-ci.org/JustComments/widget.svg?branch=master" alt="build"></a>
</h1>
<p align="center">
  <a href="https://just-comments.com/demo.html"> <img src="https://just-comments.com/static/screencast-c87b09b94fd7e1d0fc23a4462bc42f3f.gif" alt="JustComments demo"> </a>
</p>
<p align="center">
  Commenting widget for websites. <br />Hosting / easy integration / no ads / no tracking / small size.<br /><a href="https://just-comments.com/demo.html">Demo</a>
</p>



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
  --guestSecret=... \
  --pushUrl=... \
  --coreUrl=... \
  --twitterUrl=...
```
