app.controller('timerController',function($scope, $rootScope, socket){
	localUser = [];
	$rootScope.users = [];
	$rootScope.users.push({name:"system"});
	$rootScope.users.push({name:"urlaub"});
	socket.emit('users');
	socket.on('user', function(data) {
		if(!inArray(data.id, localUser)){
			$rootScope.users.push(data);
		}
	});
	$scope.days = {
		"0":"Sonntag",
		"1":"Montag",
		"2":"Dienstag",
		"3":"Mittwoch",
		"4":"Donnerstag",
		"5":"Freitag",
		"6":"Samstag"
	}
	$scope.deleteTimer = function(data) {
		// delete $scope.timers[data.name];
		socket.emit('deleteTimer', {"id":data.id});	
	}
	$scope.switchTimer = function(data) {
		if(data.active == "true"){
			data.active = "false";
		}else{
			data.active = "true";
		}
		socket.emit('switchTimer', data);
	    if ($scope.timers[data.name].clickIcon === 'notifications') {
	        $scope.timers[data.name].clickIcon = 'notifications_off';
	        $scope.timers[data.name].fill = '#ffc0c0';
	    }
	    else {
	        $scope.timers[data.name].clickIcon = 'notifications';
	        $scope.timers[data.name].fill = 'lightgreen';
	    }
	};

	socket.emit('timers');
	$scope.timers = {};
	socket.on('reloadTimer', function(){
		socket.emit('timers');
		$scope.timers = {};
	});
	socket.on('timer', function(data){
		if(data.active == "true"){
			data.clickIcon = "notifications";
			data.fill = 'lightgreen';
		}else{
			data.clickIcon = "notifications_off";
			data.fill = '#ffc0c0';
		}
		$scope.timers[data.name] = data;
	});
});

app.controller('addNewTimerController', function($scope, $uibModal, socket, $routeParams, $location, $rootScope) {
	if($routeParams.id){
		console.log($routeParams.id);
		$scope.headline = "Timer bearbeiten";
		socket.emit('timer', $routeParams.id);
	}else{
		$scope.headline = "Timer hinzufügen";
		$scope.timer = {
			active:true,
			variables:false,
			conditions:false,
			actions:false,
			clickIcon:"notifications",
			fill:'lightgreen',
		};	
	}
	socket.on('timer', function(data){
		if(data.id == $routeParams.id && $scope.timer != ""){
			console.log(data.id);
			$scope.timer = data;
		}
	});
	$scope.addAction = {
		variable:{
			id: Math.floor((Math.random() * 1000) + 1) * Math.floor((Math.random() * 1000) + 1)
		}
	};
	$scope.addCondition = {
		range:{},
		weekdays:{}
	};
	$scope.openVariable = function(){
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: "./app/timer/template-timer-edit-variables.html",
			controller: "editVariablesController",
			size: 'lg',
			resolve: {}
		});
		modalInstance.result.then(function (data) {
			if(!$scope.timer.variables){
				$scope.timer.variables = {};
			}
			if($scope.timer.variables[data.variable]){
				$scope.timer.variables[data.variable].push({
					name:data.variable,
					mode:data.mode,
					status:data.status
				});
			}else{
				$scope.timer.variables[data.variable] = [];
				$scope.timer.variables[data.variable].push({
					name:data.variable,
					mode:data.mode,
					status:data.status
				});
			}
		}, function () {
		});
	}
	$scope.openCondition = function(){
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: "./app/timer/template-timer-edit-conditions.html",
			controller: "editConditionsController",
			size: 'lg',
			resolve: {}
		});

		modalInstance.result.then(function (data) {
			if(!$scope.timer.conditions){
				$scope.timer.conditions = {};
			}
			switch(data.type){
				case "time":
					console.log(data);
					var condition = {}
					switch(data.mode){
						case 'sunset':
							condition.time = 'sunset';
							break;
						case "sunrise":
							condition.time = 'sunrise';
							break;
						default:
							condition.time = data.time.getHours() + ":" + data.time.getMinutes();
							break;
					}
					condition.offset = data.offset;
					break;
				case "range":
					var condition = {
						start:data.range.start,
						stop:data.range.stop		
					}
					break;
				case "weekdays":
					var condition = {
						0:data.weekdays[0],
						1:data.weekdays[1],
						2:data.weekdays[2],
						3:data.weekdays[3],
						4:data.weekdays[4],
						5:data.weekdays[5],
						6:data.weekdays[6]
					}
					break;
			}
			if($scope.timer.conditions[data.type]){
				$scope.timer.conditions[data.type].push(condition);
			}else{
				$scope.timer.conditions[data.type] = [];
				$scope.timer.conditions[data.type].push(condition);
			}
		}, function () {
		});
	}
	$scope.openAction = function (mode) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: "./app/timer/template-timer-edit-actions.html",
			controller: "editActionsController",
			size: 'lg',
			resolve: {}
		});

		modalInstance.result.then(function (data) {
			if(!$scope.timer.actions){
				$scope.timer.actions = {};
			}
			switch(data.type){
				case "devices":
					var device = data.device;
					var action = {
						name: device.name + ' (' + device.Raum + ')',
						id: device.deviceid,
						action: data.switchstatus
					}
					console.log(action);
					break;
				case "alerts":
					var action = data.alert;
					break;
				case "pushbullets":
					var action = data.pushbullet;
					break;
				case "storeVariables":
					var action = {
						name:data.saveVariable
					}
					break;
				case "intervals":
					var action = data.interval;
					break;
				case "urls":
					var action = data.url;
					break;
				default:
					console.log(data);
					break;
			}
			if($scope.timer.actions[data.type]){
				$scope.timer.actions[data.type].push(action);
			}else{
				$scope.timer.actions[data.type] = [];
				$scope.timer.actions[data.type].push(action);
			}
			$scope.addAction = {
				variable:{
					id: Math.floor((Math.random() * 1000) + 1) * Math.floor((Math.random() * 1000) + 1)
				}
			};
		}, function () {
		});
	};


	$scope.removeAction = function(data){
		for(var i = 0; i<$scope.timer.actions[data.type].length; i++){
			if($scope.timer.actions[data.type][i] == data.action){
				$scope.timer.actions[data.type].splice(i, 1);
				if($scope.timer.actions[data.type].length == 0){
					delete $scope.timer.actions[data.type];
					if(Object.keys($scope.timer.actions).length == 0){
						$scope.timer.actions = false;
					}
				}
				break;
			}
		}
	}
	$scope.removeVariable = function(data){
		for(var i = 0; i<$scope.timer.variables[data.type].length; i++){
			if($scope.timer.variables[data.type][i] == data.action){
				$scope.timer.variables[data.type].splice(i, 1);
				if($scope.timer.variables[data.type].length == 0){
					delete $scope.timer.variables[data.type];
					if(Object.keys($scope.timer.variables).length == 0){
						$scope.timer.variables = false;
					}
				}
				break;
			}
		}
	}
	$scope.removeCondition = function(data){
		for(var i = 0; i<$scope.timer.conditions[data.type].length; i++){
			if($scope.timer.conditions[data.type][i] == data.condition){
				$scope.timer.conditions[data.type].splice(i, 1);
				if($scope.timer.conditions[data.type].length == 0){
					delete $scope.timer.conditions[data.type];
					if(Object.keys($scope.timer.conditions).length == 0){
						$scope.timer.conditions = false;
					}
				}
				break;
			}
		}
	}

	$scope.saveTimer = function(){
		console.log($scope.timer);
		$scope.timer.user = $rootScope.activeUser;
		socket.emit('saveTimer', $scope.timer);
		$scope.timer = {
			active:true,
			variables:false,
			conditions:false,
			actions:false,
			clickIcon:"notifications",
			fill:'lightgreen',
		};
		$location.url("/timer");
	}
});

app.controller('editActionsController', function($scope, $uibModalInstance, socket){

	$scope.alertTypen = [
		{value:'primary', name:'Blau/Primary'},
		{value:'info', name:'Hellblau/Info'},
		{value:'success', name:'Grün/Success'},
		{value:'warning', name:'Gelb/Warning'},
		{value:'danger', name:'Rot/Danger'},
		{value:'default', name:'Weiß/Default'},
	];
	$scope.addAction = {
		interval:{
			type: false
		},
		switchstatus: '1'
	}
	socket.emit('devices', 'objects');
	socket.on('devices', function(data){
		$scope.devices = data;
	});
	$scope.variables = {};
	socket.emit('variables');
	socket.on('variable', function(data){
		$scope.variables[data.name] = data;
	});
	$scope.actions = [
		{value:"devices", name:"Geräte"},
		{value:"urls", name:"Url aufrufen"},
		{value:"saveSensors", name:"Speichere Sensoren"},
		{value:"alerts", name:"Alert"},
		{value:"pushbullets", name:"Pushbulletbenachrichigung"},
		{value:"storeVariables", name:"Variable speichern"},
		{value:"intervals", name:"Interval"}
	];
	$scope.intervalActions = [
		{value:"devices", name:"Gerät"},
		{value:"urls", name:"Url aufrufen"},
		{value:"saveSensors", name:"Speichere Sensor"},
		{value:"alerts", name:"Alert"},
		{value:"pushbullets", name:"Pushbulletbenachrichigung"},
		{value:"storeVariables", name:"Variable speichern"}
	];
	$scope.save = function () {
		$scope.addAction.saveType = "addAction";
		console.log($scope.addAction);
		$uibModalInstance.close($scope.addAction);
	};
	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
	$scope.isSame = function(addAction, pattern){
		if(addAction.type == pattern || (addAction.interval.type == pattern && addAction.type == "intervals")){
			return true;		
		}
	}
});

app.controller('editVariablesController', 	function($scope, $uibModalInstance, socket) {
	socket.emit('variables');
	$scope.variables = {};

	socket.on('variable', function(data){
		$scope.variables[data.name] = data;
	});
	$scope.addVariable = {};
	$scope.save = function () {
		$scope.addVariable.saveType = "addVariable";
		$uibModalInstance.close($scope.addVariable);
	};
	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

app.controller('editConditionsController', function($scope, $uibModalInstance, socket){
	$scope.conditions = [
		{value:"range", name:"Zeitraum"},
		{value:"weekdays", name:"Wochentage"},
		{value:"time", name:"Zeitpunkt"},
	];

	$scope.addCondition = {
		offset:{
			unit:"+",
			number:0
		},
		range:{
			start:new Date(),
			stop:new Date(new Date().getTime() + 60000 * 60)
		},
		time:new Date(),
		mode:"time",
		weekdays: {"0":false,"1":false,"2":false,"3":false,"4":false,"5":false,"6":false}
	}

	$scope.days = {
		"0":"Sonntag",
		"1":"Montag",
		"2":"Dienstag",
		"3":"Mittwoch",
		"4":"Donnerstag",
		"5":"Freitag",
		"6":"Samstag"
	}

	$scope.save = function () {
		$scope.addCondition.saveType = "addCondition";
		$uibModalInstance.close($scope.addCondition);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});