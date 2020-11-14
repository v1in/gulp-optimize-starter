# start-project-gulp-bootstrap
Starting files with gulp 4 and bootstrap 5.

#### Tech Stack:

- Gulp 4
- Bootstrap 5
- Prettier
- Stylelint

## Install

Installs package dependencies: 

`npm i`

## Development mode

Runs the app in development mode:

`npm run dev`

Open http://localhost:1010 to view it in the browser.

## Production mode

`npm run prod`

Builds the app in production mode with a hash to the filename. \
All files in the folder `build/`

> #### Example with hash: 
> ../js/main.min-deb6f3c5.js \
> ../css/main.min-9b392c97.css 

Your app is ready to be deployed 🤟

## Сlear build/ contents

`npm run clear`

## Some notes

The project uses a plugin [gulp-rigger](https://www.npmjs.com/package/gulp-rigger). \
For importing the required files using the following construction: \
`//= the_path_to_the_file`

