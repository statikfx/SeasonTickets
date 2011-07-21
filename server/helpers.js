var URL = require("url");

module.exports = function(config) {
  return {
    
    buildPageContext: function(req, options) {
      var ctx = options || {};
      ctx.site = config.SITE;
      ctx.path = URL.parse(req.url).pathname;
      ctx.page = ctx.page || {};

      return { context: ctx };
    },
    
    dateToCouchString: function(date) {
      var str = [(date.getMonth() + 1), date.getDate(), date.getFullYear()];
      if (str[0] < 10) {
        str[0] = "0" + str[0];
      }
      if (str[1] < 10) {
        str[1] = "0" + str[1];
      }
      str = str.join("/");
      return str;
    }
  };
};