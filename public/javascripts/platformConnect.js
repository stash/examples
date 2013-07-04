
function onLoad() {

 var url = 'https://goinstant.net/' + config.accountName + '/' + config.appName + '/exampleSession';

 goinstant.connect(url, function(err, connection) {

    if (err) {
      console.log(arguments);
      return;
    }

   console.log('Connected to Platform');

   var go = connection.session('exampleSession');

 });
}
