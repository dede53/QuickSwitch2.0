app.controller('variableController', function($scope, $rootScope, socket){

<<<<<<< HEAD
=======
	$scope.variables = {};

	socket.emit('variables', $rootScope.activeUser);

	socket.on('variable', function(data){
		if($rootScope.activeUser.variables.indexOf(data.id) != "-1"){
			$scope.variables[data.name] = data;
			$rootScope.showVariables = true;
		}else{
			delete $scope.variables[data.name];
		}
		if($scope.variables !== null && typeof $scope.variables === 'object'){
			// $rootScope.showVariables = false;
		}
	});

	$scope.deleteVariable = function(data) {
		socket.emit('deleteVariable', {"id":data.id});	
	}
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
});