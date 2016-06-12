app.controller('activeUser', function($rootScope, $scope, socket){

	$scope.values = [];
	var admin = {name:"Admin", admin:"true"};
	$scope.values.push(admin);
	socket.emit('users');
	socket.on('user', function(data) {
		$scope.values.push(data);
	});
	$scope.setUser = function() {
		if($rootScope.activeUser.admin != 'true'){
			socket.emit('favoritDevices', $rootScope.activeUser);
			socket.emit('timers', $rootScope.activeUser);
			socket.emit('variables', $rootScope.activeUser);
			setCookie("username", JSON.stringify($rootScope.activeUser), 365);
		}
	}
});