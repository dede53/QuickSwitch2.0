var fs 				=	require('fs');
var exec			=	require('child_process').exec;

process.stdin.resume();
process.on('SIGINT', function () {
	// exec('forever stopall');
	process.exit();
});

fs.readdir('./app/events', function(err, data){
	if(err){
		console.log(err);
	}else{
		console.log(data);
		var plugins = {};
		var log_file = {};
		var log_stdout = {};
		
		data.forEach(function(file){
			var splitedfile = file.split(".");
			var filename = splitedfile[0];
			var debugFile = __dirname + '/log/debug-' + filename + '.log';

			log_file[filename]			=	fs.createWriteStream( debugFile, {flags : 'w'});
			log_stdout[filename]		=	process.stdout;

			plugins[filename] = exec('node ' + __dirname + "/app/events/" + file);
			plugins[filename].stdout.on('data', function(data) {
			    console.log(data);
			});
			plugins[filename].stderr.on('data', function(data) {
			    console.log(data);
			});
			plugins[filename].on('close', function(code) {
			    console.log(code);
			});
		});
	}
}); 