var fs 				=	require('fs');
var spawn			=	require('child_process').spawn;


fs.readdir('./app/events', function(err, data){
	if(err){
		console.log(err);
	}else{
		var plugins = {};
		var log_file = {};
		console.log("Installierte Eventlistener:");
		data.forEach(function(file){
			console.log('	' + file);
			if(file.includes('.')){
				var splitedfile = file.split(".");
				var filename = splitedfile[0];
				var adapterName = filename;
			}else{
				var adapterName = file;
				var file = file + '/index.js';
			}
			var debugFile = __dirname + '/log/debug-' + adapterName + '.log';

			log_file[adapterName]			=	fs.createWriteStream( debugFile, {flags : 'w'});

			plugins[adapterName] = spawn( process.execPath, ['app/events/' + file]);
			
			plugins[adapterName].stdout.on('data', function(data) {
				log_file[adapterName].write(data.toString());
			    console.log(data.toString().trim());
			});
			plugins[adapterName].stderr.on('data', function(data) {
				log_file[adapterName].write(data.toString());
			    //console.log(data.toString());
			});
			plugins[adapterName].on('close', function(code) {
				log_file[adapterName].write(code.toString());
			    //console.log(code.toString());
			});
		});
	}
}); 