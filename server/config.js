// reads global configuration options
var PATH = require("path");

var CONFIG = module.exports = {
  WEBROOT: PATH.dirname(__filename),
  PORT: process.env.PORT || 9999,
  DB: {
    URL: process.env.CUBS_DB || process.env.CLOUDANT_URL,
    NAME: "cubs"
  },
  SITE: {
    title: "Season Tickets"
  }
};