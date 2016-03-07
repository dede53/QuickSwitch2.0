app.controller('variableController', function($scope, $rootScope, socket){

	socket.emit('variables');
	socket.on('variables', function(data) {
		$scope.variables = data;
	});
	
	$scope.deleteVariable = function(data) {
		socket.emit('deleteVariable', {"id":data.id});	
	}
});
app.controller('editVariableController', function($scope, $rootScope, socket, $routeParams){
	/***********************************************
	*	Daten anfordern
	***********************************************/
	if(!$routeParams.id){
			$scope.editVariable = {
				title: "Hinzufügen",
				variable: {
					name: "",
					value: ""
				}
			}
	}else{
		socket.emit('variable', {"id":  $routeParams.id});
	}
	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('variable', function(data) {
		if(data.constructor === Array){
			
			$scope.editVariable = {
				title: "Bearbeiten",
				variable: data[0]
			}

		}else{
			$scope.editVariable = {
				title: "Achtung: Fehler!",
				variable:{
					name: data
				}
			}
		}
	});


});
app.controller('saveVariableController', function($scope, socket, $location) {
		$scope.saveVariable = function() {
			// Validierung!!
			socket.emit('saveVariable', $scope.editVariable.variable);
			$location.url("/variables");
		};
		$scope.abortNewVariable = function(){
			$scope.editVariable = {
				title: "Bearbeiten",
				variable: {
					name: ""
				}
			}
		}
});