app.controller('adapterController',  function($scope, $rootScope, socket, $uibModal) {
	$scope.switchServers = {};
	socket.emit("switchServer:get");
	socket.on("switchServer", function(list){

		var bla = function(server){
			var socket = io.connect("http://" + server.ip + ":" + server.port);
			socket.on("status", function(data){
				$rootScope.$apply(function(){
					console.log(data);
					$scope.switchServers[server.id].status = data;
					$scope.switchServers[server.id].message = "erreichbar";
				});
			});
			socket.emit("get:status", {}, function(){});
			$scope.switchServers[server.id].connection = socket;
		}

		list.forEach(function(server){
			console.log(server);
			server.message = "nicht erreichbar";
			$scope.switchServers[server.id] = server;
			bla(server);
			// $scope.switchServer[server.id].connection = bla(server);
		});

	});
	$scope.controlAdapter = function(action, switchServer, name){
		switchServer.connection.emit('adapter:' + action, name);
	}
	$scope.reload = function () {
		socket.emit("switchServer:get");
	}
	$scope.openSettings = function(adapter){
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: "./app/adapter/template-settings.html",
			controller: "adapterSettingsController",
			size: 'lg',
			resolve: {
				adapter: function(){return adapter}
			}
		});
		modalInstance.result.then(function(data) {
			console.log(data);
		}, function () {
			;
		});
	}
});
app.controller('adapterSettingsController', function($scope, adapter, $uibModalInstance){
	$scope.adapter = adapter;
	$scope.getTypeof = function(data){
		return typeof data;
	}
	$scope.save = function (data) {
		console.log($scope.adapter );
		console.log(data);
		$uibModalInstance.close(data);
	};
	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
})