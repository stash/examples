
function onLoad() {

  var url = 'https://goinstant.net/' + config.accountName + '/' + config.appName + '/defaultSession';

  goinstant.connect(url, function(err, connection, defaultSession) {

    var examplePlatformSession = connection.session('exampleSession');

    examplePlatformSession.users(function(err, users) {
      if (err) {
        // unable to access the users object.
        return;
      }

      users.forEach(function(user) {
        // user: user in session. id: guest:r-5nD6MwL6euNMWb0uuGgw display name: Guest
      });

    });
 });
}
