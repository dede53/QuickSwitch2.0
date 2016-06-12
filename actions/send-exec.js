var exec        = require('exec');

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	sendEXEC(status, data);
});


function sendEXEC(status, data){
	if(status == 1){
		var execString = data.CodeOn;
	}else{
		var execString = data.CodeOff;
	}
	exec(execString,function(error, stdout, stderr) { 
		// util.puts(stdout); 
		console.log(stdout); 
		console.log("Executing Done");
	});
}


