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
redisClient.get = util.promisify(redisClient.get);

mongoose.Query.prototype.exec = async function () {
  console.log('I AM ABOUT TO RUN A QUERY');
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }));

  const cachedVal = await redisClient.get(key);

  if (cachedVal) {
    const doc =  JSON.parse(cachedVal);

    return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);

  redisClient.set(key, JSON.stringify(result));

  return result;
}