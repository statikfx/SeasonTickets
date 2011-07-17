# Environment Setup

## node.js

I am running the latest stable version (0.4.9), but Heroku currently supports 0.4.7. I don't think we will run into major trouble if you also install the latest stable.

With Homebrew (recommended):

`brew install node`

Otherwise, download the zip from [nodejs.org](http://nodejs.org/#download) and follow [installation instructions](https://github.com/joyent/node/wiki/Installation).

## npm

npm is a simple install:

`curl http://npmjs.org/install.sh | sh`

I am running 1.0.15, which I think is what you'll get with that:

`npm -v`
`1.0.15`

## foreman

foreman is required to run our app locally like it will be run on Heroku.

`gem install foreman`

In a directory with a proper `Procfile`, you can run

`foreman start`

to start the application.

## heroku

If you don't have the heroku gem, or haven't updated it in a while, you should:

`gem install heroku`
`heroku version`
`heroku-gem/2.3.6`

# More information

* [Getting started with node.js on Heroku](http://devcenter.heroku.com/articles/node-js)