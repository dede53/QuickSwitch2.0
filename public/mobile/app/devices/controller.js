app.controller('devicesController', function($rootScope, $scope, socket){
	/***********************************************
	*	Daten anfordern
	***********************************************/
<<<<<<< HEAD
	socket.emit('devices:get');
});

app.controller('activeDevices', function($rootScope, $scope, socket){
	$scope.activedeviceslist = [];
	socket.emit('devices:active');

	$scope.switchalldevices = function(data) {
		socket.emit('devices:switchAll', {"status":data.status});
	}
});
=======
	socket.emit('devices', {"type":"object"});

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('devices', function(data) {
		$rootScope.devicelist = data;
	});

	$scope.formatNumber = function(i) {
		return Math.round(i * 100); 
	}

	$scope.switchdeviceSlider = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status": data.status});
	}
	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', data);
	}
	$scope.switchdeviceMouseDown = function(data) {
		if(parseInt(data.sendMultiple) == 1){
			$scope.interval = setInterval(function(){
				socket.emit('switchdevice', data);
			}, 100);
		}
	}
	$scope.switchdeviceMouseUp = function(data){
		if(parseInt(data.sendMultiple) == 1){
			clearInterval($scope.interval);
		}
	}
	socket.on('switchDevice', function(data) {
		var device = data.device[data.device.type];
		$rootScope.devicelist[device.Raum].roomdevices[device.deviceid][data.device.type].status = parseFloat(data.status);
	});
	$scope.switchRoom = function(data){
		socket.emit('switchRoom', {"status": data.status, "room": data.room});
	}
});

app.controller('activeDevices', function($rootScope, $scope, socket){

	$scope.activedeviceslist = [];
	socket.emit('sendActiveDevices');
	socket.on('activedevices', function(data){
		$scope.activedeviceslist = data.activedevices;
	});
	$scope.switchalldevices = function(data) {
		socket.emit('switchalldevices', {"status":data.status});
	}
});

app.controller('favoritDevices', function($rootScope, $scope, socket){
	socket.emit('user', $rootScope.activeUser.id);
	socket.on('user', function(data){
		$rootScope.activeUser = data;
	});
	$scope.formatNumber = function(i) {
		return Math.round(i * 100); 
	}

	socket.on('switchDevice', function(data) {
		for(var i = 0; i < $rootScope.activeUser.favoritDevices.length; i++){
			if($rootScope.activeUser.favoritDevices[i][data.device.type].deviceid == data.device[data.device.type].deviceid){
				$rootScope.activeUser.favoritDevices[i][data.device.type].status = parseInt(data.status);
			}
		}
	});
	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', data);
	}
	$scope.switchdeviceMouseDown = function(data) {
		if(parseInt(data.sendMultiple) == 1){
			$scope.interval = setInterval(function(){
				socket.emit('switchdevice', data);
			}, 100);
		}
	}
	$scope.switchdeviceMouseUp = function(data){
		if(parseInt(data.sendMultiple) == 1){
			clearInterval($scope.interval);
		}
	}
	
	$scope.switchdeviceSlider = function(data) {
		socket.emit('switchdevice', {"id":data.device.deviceid,"status": data.device.status});
	}
});



/*
ioroutes| CLIENT:

'user': switch(){}
all


socket.on($rootScope.activeUser.name, function(data){
	switch(data.type){
		case "coundowns":
			$scope.countdowns = data.countdowns;
			break;
		case "favoritDevices":
			$scope.favoritDevices = data.favoritdevices;
			break;
		case "switchHistory":
		 	$scope.switchHistory = data.switchHistory;
			break;
		case "groups":
			$scope.groups = data.groups;
			break;
		case "phonelist":
			$scope.phonelist = data.phonelist;
			break;
		case "storedVariables":
			$scope.storedVariables = data.storedVariables;
			break;
		case "timer":
			$scope.timer = data.timer;
			break;
		case "newAlert":
			$scope.alerts[data.alert.id] = data.alert;
			break;
		case "removedAlert":
			delete $scope.alerts[data.alert.id];
			break;
	}	
});

socket.on('all', function(data){
	switch(data.type){
		case "users":
			$rootScope.users = data.users;
			break;
		case "rooms":
			$scope.rooms = data.rooms;
			break;
		case "devices":
			$scope.devices = data.devices;
			break;
		case "newMessage":
			break;
		case "newAlert":
			$scope.alerts[data.alert.id] = data.alert;
			break;
		case "switchDevice":
			break;
	}
});



ioroutes|SERVER

app.io.route('all', function(req, res){
	switch(req.data.type){
		case "users":
			userFunctions.getUsers(req,res,function(data){
				req.io.emit('all', new message('users', data));
			});
			break;

		case "devices":
			deviceFunctions.getDevices(req,res,function(data){
				req.io.emit('all', new message('devices', data));
			});
			break;
		
		case "rooms":
			roomFunctions.getRooms(req,res,function(data){
				req.io.emit('all', new message('rooms', data));
			});
			break;
		
		case "getUser":
			var user = req.data.getUser;
			
			countdownFunctions.getCountdowns(user.id, req, res, function(data){
				req.io.emit(user.name, new message('countdowns', data));
			});
			
			deviceFunctions.favoritDevices(user.favoritDevices, req, res, function(data){
				req.io.emit(user.name, new message('favoritDevices', data));
			});
			
			groupFunctions.getGroups(user.id, req, res, function(data){
				req.io.emit(user.name, new message('groups', data));
			});
			
			timerFunctions.getTimer(user.id, req, res, function(data){
				req.io.emit(user.name, new message('timers', data));
			});
			
			break;
	}
});


function message(type, data){
	var message = {};
	message.type = type;
	message[type] = data;
	return message;
}
*/
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
