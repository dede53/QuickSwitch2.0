app.controller('homeController', function($scope, socket){
	socket.emit('settings');
	socket.on('settings', function(data){
		console.log(data);
		$scope.settings = data;
	});
	$scope.save = function(data){
		console.log(data);
		socket.emit('saveSettings', data);
	}
});