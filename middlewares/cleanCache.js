const { clearHash } = require('../services/cache');


module.exports = async (req, res, next) => {
  await next(); //this allows the middleware to run AFTER the route's callback has run.

  clearHash(req.user.id);
}