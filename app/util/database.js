const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect("mongodb://localhost:27017")
    .then((client) => {
      _db = client.db("shop");
      callback(client);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No DB found";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
