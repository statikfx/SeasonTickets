// reads global configuration options
var PATH = require("path");

var CONFIG = module.exports = {
  BASEPATH: "/cubs",
  WEBROOT: PATH.dirname(__filename),
  PORT: process.env.PORT || 3000,
  DB: {
    URL: "http://localhost:5984" || process.env.CLOUDANT_URL,
    NAME: "cubs"
  },
  SITE: {
    title: "Season Tickets"
  }
};
