app.controller('activeUser', function($rootScope, $scope, socket){

	socket.emit('newuser');
	socket.on('newuser', function(data) {
		$scope.values = data;
		var admin = {name:"Admin", admin:"true"};
		$scope.values.push(admin);
	});
	$scope.setUser = function() {
		if($rootScope.activeUser.admin != 'true'){

			socket.emit('favoritDevices', $rootScope.activeUser);
			setCookie("username", JSON.stringify($rootScope.activeUser), 365);
		}
	}
});