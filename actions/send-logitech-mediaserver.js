var conf            = require('../config.json');

process.on('message', function(data) {
	sendLogitech(status, data);
});

var runCommand = function(player, cmd, cb){
	if(cmd.indexOf("status") === -1){
		console.log("running command " +cmd + (player ? " on player " + player : ""));
	}
	var cl = new telnet.Client(server.address,server.telnet,{},function(l){
		l.write((player ? player +" " : "") + cmd +"\n");
	})
	.on("data", function(d,e){
		cb(d);
		cl.socket.end();
	});
};
	
function sendLogitech(status, data){
	
}