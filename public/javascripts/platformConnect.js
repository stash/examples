
function onLoad() {

  var url = 'https://goinstant.net/' + config.accountName + '/' + config.appName + '/defaultSession';

  goinstant.connect(url, function(err, connection, defaultSession) {

    // Our sessions container {exampleSession: sessionInstance}
    // primed with our default session
    var sessions = {defaultSession: defaultSession};

    function makeSession(sessionName) {

      // Create or retrieve our session instance
      if (sessions[sessionName]) {
        return sessions[sessionName];
      }

      sessions[sessionName] = connection.session(sessionName);
      return sessions[sessionName];
    }

    // Now we can create platform session instances
    // to our hearts content
    var exampleSession = makeSession('exampleSession');
    var exampleSession2 = makeSession('exampleSession2');

    console.log(sessions); // Object {defaultSession: a, exampleSession: a, exampleSession2: a}

 });
}
