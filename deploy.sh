#!/bin/bash

rm app.bundle.js
rm app.bundle.js.map
rm vender.bundle.js
rm vender.bundle.js.map
npm run webpack:prod

cp -r dist/* .