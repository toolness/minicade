function MemStorage() {
  var cache = {};

  return {
    cache: cache,
    get: function(key, cb) {
      process.nextTick(function() {
        if (!(key in cache)) return cb(null, null);
        cb(null, cache[key]);
      });
    },
    set: function(key, content, cb) {
      process.nextTick(function() {
        cache[key] = content;
        cb(null);
      });
    }
  };
}

function MongoStorage(db, options) {
  if (!(this instanceof MongoStorage)) return new MongoStorage(db, options);
  this.db = db;
  this.contentKey = options.contentKey;
  this.collection = this.db.collection(options.collection);
}

MongoStorage.prototype = {
  get: function(key, cb) {
    this.collection.findOne({key: key}, function(err, doc) {
      if (err) return cb(err);
      cb(null, doc ? doc[this.contentKey] : null);
    }.bind(this));
  },
  set: function(key, content, cb) {
    var setOptions = {lastModified: new Date()};
    setOptions[this.contentKey] = content;
    this.collection.update({key: key}, {
      $set: setOptions
    }, {upsert: true}, cb);
  }
};

exports.MemStorage = MemStorage;
exports.MongoStorage = MongoStorage;

exports.findUnique = function findUnique(storage, candidateGenerator, cb) {
  var candidate = candidateGenerator();
  storage.get(candidate, function(err, data) {
    if (err) return cb(err);
    if (data !== null)
      return findUnique(storage, candidateGenerator, cb);
    cb(null, candidate);
  }.bind(this));
};
