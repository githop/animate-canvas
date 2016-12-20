#!/bin/bash

rm app.bundle.js
rm app.bundle.js.map
rm vendor.bundle.js
rm vendor.bundle.js.map
npm run webpack:prod

cp -r dist/* .