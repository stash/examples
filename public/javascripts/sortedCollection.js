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

      if (err) {
        cb(err);
        return;
      }

      self.collectionKey.on('remove', function(err, value, context) {
        self.sortedCollection = [];

        // fire add listeners on this object
        self.fireEvents('remove', [null, value, context]); // err, new val, array, context
      });

      // create a collection add listener
      self.collectionKey.on('add', function(key, value, context) {

        var stamp = key.name.split('/');

        var set = {
          stamp: stamp[stamp.length - 1],
          key: key,
          data: value
        };

        set.key.on('set', function(value, context) {
          // new val then old val
          self.fireEvents('change', [null, value, set.data, self.get(), context]);
          this.data = value;
        });

        set.key.on('update', function(value) {
          self.fireEvents('change', [null. value, set.data, self.get(), context]);
          this.data = value;
        });

        self.sortedCollection.push(set);

        self.sort();

        // fire add listeners on this object
        self.fireEvents('add', [null, value, self.get(), context]); // err, new val, array, context
      });

      keys.forEach(function(value, index) {

        var stamp = value.name.split('/');

        var set = {
          stamp: stamp[stamp.length - 1],
          key: value,
          data: data[index]
        };

        set.key.on('set', function(value, context) {
          // new val then old val
          self.fireEvents('change', [null, value, set.data, self.get(), context]);
          this.data = value;
        });

        set.key.on('update', function(value) {
          self.fireEvents('change', [null. value, set.data, self.get(), context]);
          this.data = value;
        });

        self.sortedCollection.push(set);

      });

      self.sort();

      cb(null, self);

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

    var self = this;
    var timestamp = new Date().getTime();

    this.collectionKey.add(timestamp, value, function(err, key) {

      if (err) {
        cb(err);
        return;
      }

      var stamp = key.name.split('/');

      var set = {
        stamp: timestamp,
        key: key,
        data: value
      };

      set.key.on('set', function(value, context) {
        // new val then old val
        self.fireEvents('change', [null, value, set.data, self.get(), context]);
        this.data = value;
      });

      set.key.on('update', function(value) {
        self.fireEvents('change', [null. value, set.data, self.get(), context]);
        this.data = value;
      });

      self.sortedCollection.push(set);

      self.sort();

      cb.apply([null, key]);
    });

  },

  remove: function(cb) {
    this.collectionKey.remove(cb);
    this.sortedCollection = [];
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
      event.cb.apply(null, args);
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

    sortedCollection.init(function(err, collection) {
      console.log('initial collection', collection.get());

      collection.on('change', function(err, newVal, oldVal, entireArray, context) {
        console.log('on change:', arguments);
      });

      collection.on('add', function(err, newVal, oldVal, entireArray, context) {
        console.log('on add: ', arguments);
      });

      collection.on('remove', function(err, contextwindow) {
        console.log('on remove event', arguments);
      });

      /*
      collection.remove(function(err, value, context) {
        console.log('remove collection ', arguments);
      })*/

      collection.sortedCollection[3].key.set('Numero Two');
    });

    /*
    sortedCollection.add('Nany Drew', function(err, val, entireArray, context) {
      console.log(arguments);
    });*/


  });

}
