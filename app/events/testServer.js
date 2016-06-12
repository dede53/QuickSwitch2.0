var express 		= require('express');
var helper 			= require('../functions/helper.js');
var app 			= express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  helper.log.info('Example app listening at http://' + host + ":" + port, "info");
});
