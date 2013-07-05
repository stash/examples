function SortedCollection (key, sortFunction) {
  this.collectionKey = key;
  this.sortedCollection = [];
  this.listeners = [];
  this.sortFunction = sortFunction || null;
}

SortedCollection.prototype = {
  init: function(cb) {
    self = this;

    // listen for platform collection add & remove events
    self.collectionKey.on('add', self._add(), self._errorHandler);
    self.collectionKey.on('remove', self._remove, self._errorHandler);

    // Prime our collection data
    // collection.get returns two arrays: data & keys
    self.collectionKey.get(function(err, data, keys) {

      self._errorHandler(cb)(err);

      // add the data to our collection
      keys.forEach(function(key, index) {
        // we don't want to trigger events on local changes
        // or sort inside our loop
        self._add({silence: true, sort: false})(key, data[index]);
      });

      // ok now we can sort our collection
      self.sort();

      cb(null, self);
    });
  },
  sort: function() {

    // we default to sorting by time stamp, but will accept a custom
    // sort function too
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

    // we make our timestamp the id, for easy sorting later
    this.collectionKey.add(timestamp, value, function(err, key, context) {
      self._errorHandler(cb)(err);
      // add the new value to our local collection, silencing the event
      self._add({silence: true})(key, value, context);
      cb(null, key, context);
    });

  },
  remove: function(cb) {
    this.collectionKey.remove(cb);
    this.sortedCollection = [];
  },
  get: function() {
    // this returns our sorted collection
    return _.pluck(this.sortedCollection, 'data');
  },
  on: function(event, cb) {
    // register new listeners
    this.listeners.push({event: event, cb: cb});
  },
  trigger: function(event, args) {
    var events = _.where(this.listeners, {event: event});

    _.forEach(events, function(event) {
      event.cb.apply(null, args);
    });
  },
  _add: function(options) {

    // We silence local events
    var optionDefaults = {silence: false, sort: true};
    var options = options || {};

    _.defaults(options, optionDefaults);

    return function(key, value, context) {

      // We sort by timestamp by default
      var stamp = key.name.split('/');

      var set = {
        stamp: stamp[stamp.length - 1],
        key: key,
        data: value
      };

      // Listen to changes to this key
      set.key.on('set', updateLocalData);
      set.key.on('update', updateLocalData);

      // Update our local collection data on a set or update event
      function updateLocalData(value, context) {
        var oldValue = set.data;
        var newValue = set.data = value || null;
        self.trigger('change', [newValue, oldValue, self.get(), context]);
      }

      // Add an item to our local collection
      self.sortedCollection.push(set);

      if (options.sort) self.sort();

      if (!options.silence) {
        self.trigger('add', [null, value, self.get(), context]);
      }
    }
  },
  _remove: function(value, context) {
    //  Clear our local collection when remote is removed
    self.sortedCollection = [];
    self.trigger('remove', [null, value, context]);
  },
  _errorHandler: function(cb) {
    return function(err) {
      if (err) return cb(err);
    }
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

      if (err) {
        // problem instantiating your collection
      }

      collection.add('Darth Vader', function(err, key, context) {
        // returns the collection & platform context
      });

      collection.get();
      // ['Darth Vader']

      collection.on('change', function(newValue, oldValue, entireArray, context) {
        console.log('on change:', newValue, oldValue);
      });

      collection.on('add', function(newValue, oldValue, entireArray, context) {
        console.log('on add:',  newValue, oldValue);
      });

      collection.on('remove', function(value, context) {
        console.log('on remove event');
      });

    });

  });
}
