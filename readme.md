# Environment Setup

## node.js

I am running the latest stable version (0.4.9), but Heroku currently supports 0.4.7. I don't think we will run into major trouble if you also install the latest stable.

With Homebrew (recommended):

    $ brew install node

Otherwise, download the zip from [nodejs.org](http://nodejs.org/#download) and follow [installation instructions](https://github.com/joyent/node/wiki/Installation).

## npm

npm is a simple install:

    $ curl http://npmjs.org/install.sh | sh

I am running 1.0.15, which I think is what you'll get with that:

    $ npm -v
      1.0.15
      
The app's node dependencies are declared in the package.json file. With the new version of npm, dependencies can be installed locally to the project, which is recommended (in /node_modules). However, this folder is added to .gitignore and will not be committed. To get any dependencies which may have been added to the package.json and are not installed locally, just do
    
    $ npm install
    
All dependencies declared in package.json and not available on your local system will be installed.

## foreman

foreman is required to run our app locally like it will be run on Heroku.

    $ gem install foreman

In a directory with a proper `Procfile`, you can run

    $ foreman start

to start the application.

## heroku

If you don't have the heroku gem, or haven't updated it in a while, you should:

    $ gem install heroku
    $ heroku version
      heroku-gem/2.3.6

## Environment Setup

Application expects an environment variable is setup pointing to the location of where CouchDB can be accessed. This is set by the following command:

    $ export CUBS_DB='http://localhost:5984'
    
The application will throw an error on startup if this variable is not present.

## Database Setup

Once the database is up and running, you can utilize helper files to setup the database and the corresponding views that are needed.

From command line, run the following inside your project directory:
    
    $ node servers/db/init.js

That should create the database and setup the views that are under 'servers/db/views/'.

## Jade

For express views, [jade](https://github.com/visionmedia/jade) is used.

# More information

* [Getting started with node.js on Heroku](http://devcenter.heroku.com/articles/node-js)