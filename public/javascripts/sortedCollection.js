function SortedCollection (key, sortFunction) {
  this.collectionKey = key;
  this.sortedCollection = [];
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

        set.key.on('set', function(value) {
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
      //collection.sortedCollection[5].key.set('Numero Seven');
    });

    /*
    sortedCollection.add('Darth Maul', function(err, key) {
      console.log(arguments);
    });*/

  });

}
