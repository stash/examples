
function onLoad() {

  var url = 'https://goinstant.net/' + config.accountName + '/' + config.appName + '/defaultSession';

  goinstant.connect(url, function(err, connection, defaultSession) {

    var examplePlatformSession = connection.session('exampleSession');

    // called when a user joins.
    function joinListener(user, context) {
      console.log(user.displayName + ' just joined "' + context.session + '".');
      // Guest just joined "/exampleSession".
    }

    // just in case.
    function errorHandler(err) {
      if (err) {
        console.log('uh oh', err);
      }
    }

    // attach our listener to the join event
    examplePlatformSession.on('join', joinListener, errorHandler)

    // join the session.
    examplePlatformSession.join(function(err, session) {
      if (err) {
        errorHandler(err);
        return;
      }

      // now in session: Object {_name: "/exampleSession"}
    });

  });
}
