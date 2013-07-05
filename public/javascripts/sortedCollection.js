function SortedCollection (key, sortFunction) {
  this.collectionKey = key;
  this.sortedCollection = [];
  this.listeners = [];
  this.sortFunction = sortFunction || null;
}

SortedCollection.prototype = {

  init: function(cb) {

    self = this;

    self.collectionKey.get(function(err, data, keys) {

      keys.forEach(function(value, index) {

        var stamp = value.name.split('/');

        var set = {
          stamp: stamp[stamp.length - 1],
          key: value,
          data: data[index]
        };

        set.key.on('set', function(value, context) {
          // new val then old val
          self.fireEvents('change', [value, set.data, context]);
          this.data = value;
        });

        set.key.on('update', function(value) {
          this.data = value;
        });

        console.log(set);

        self.sortedCollection.push(set);

      });

      self.sort();

      cb(self);

    });
  },

  sort: function() {
    if (this.sortFunction) {
      this.sortedCollection.sort(this.sortFunction);
    } else {
      this.sortedCollection.sort(function(obj1, obj2) {
        if (obj1.stamp < obj2.stamp ) return -1;
        if (obj1.stamp > obj2.stamp) return 1;
        return 0;
      });
    }
  },

  add: function(value, cb) {

    var timestamp = new Date().getTime();

    this.collectionKey.add(timestamp, value, function(err, key) {
      console.log(key);
    });

  },

  get: function() {
    return _.pluck(this.sortedCollection, 'data');
  },

  on: function(event, cb) {
    this.listeners.push({event: event, cb: cb});
  },

  fireEvents: function(event, args) {
    var events = _.where(this.listeners, {event: event});

    _.forEach(events, function(event) {
      event.cb(null, args);
    });
  }
}


function onLoad() {

  var url = 'https://goinstant.net/' + config.accountName + '/' + config.appName + '/defaultSession';

  goinstant.connect(url, function(err, connection, defaultSession) {

    var examplePlatformSession = connection.session('exampleSession');

    // create a collection
    var myCollection = examplePlatformSession.collection('exampleCollection');

    var sortedCollection = new SortedCollection(myCollection);

    sortedCollection.init(function(collection) {
      console.log(collection.get());

      collection.on('change', function() {
        console.log(arguments);
      })

      collection.sortedCollection[5].key.set('Numero Two');
    });

    /*
    sortedCollection.add('Darth Maul', function(err, key) {
      console.log(arguments);
    });*/

  });

}
