const mongoose = require('mongoose');

const exec = mongoose.Query.prototype.exec;

const dotenv = require('dotenv');
dotenv.config();

const redisClient = require('redis').createClient({
  port: 6379,
  host: '127.0.0.1',
  password: `${process.env.REDIS_PASSWORD}`,
});
const util = require('util');
redisClient.hget = util.promisify(redisClient.hget);

mongoose.Query.prototype.cache = async function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
}

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  console.log('I AM ABOUT TO RUN A QUERY');
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }));

  const cachedVal = await redisClient.hget(this.hashKey, key);

  if (cachedVal) {
    const doc = JSON.parse(cachedVal);

    return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);

  redisClient.hset(this.hashKey, key, JSON.stringify(result));

  return result;
}

module.exports = {
  clearHash(hashKey) {
    redisClient.del(JSON.stringify(hashKey));
  }
}