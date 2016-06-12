app.controller('variableController', function($scope, $rootScope, socket){

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
});