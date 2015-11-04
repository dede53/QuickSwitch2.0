app.controller('favoritenController',  function($scope, $rootScope, socket) {

	$scope.sharedMessages = new Array;
	$scope.moreMessagesAvible = true;
	$scope.link = {};
	$scope.link.type = "1";
	$scope.newCountdowntimer = {};
	$scope.newCountdowntimer.time = "1";


	socket.emit('devices', {"type":"array"});
	socket.on('devices', function(data) {
		$scope.devices = data;
	});


	
	socket.emit('countdowns');
	socket.on('countdowns', function(data){
		$scope.activeCountdowns = data;
	});
	

	$scope.storedUser = getCookie("username");
	if ($scope.storedUser != "") {
		$scope.activeUser = JSON.parse($scope.storedUser);
		socket.emit('favoritDevices', $scope.activeUser);
	}

	
	$scope.activedeviceslist = [];
	socket.emit('sendActiveDevices');
	socket.on('activedevices', function(data){
		$scope.activedeviceslist = data.activedevices;
	});

	
	var now = Math.floor(Date.parse(new Date));
	socket.emit('loadOldMessages', now );
	socket.on('oldMessages', function(data){
		$scope.moreMessagesAvible = data.moreMessagesAvible;
		if(data.moreMessagesAvible == true){
			if(data.messages == ""){
				socket.emit('loadOldMessages', data.timestamp - (1000 * 60 * 60 * 24));
			}else{
				data.messages.forEach(function(message){
					$scope.sharedMessages.splice(0, 0, message);
				});
			}
		}
	});

	socket.on('newLinkMessage', function(data){
		$scope.sharedMessages.push(data);
	});

	socket.on('newCountdown', function(data){
		$scope.activeCountdowns.push(data);
	});
/**************************
**************************/
	socket.on('favoritDevices', function(data) {
		$scope.favoritDevices = data;
	});
	socket.on('switchDevice', function(data) {
		$scope.favoritDevices[data.device.deviceid].status = data.status;
	});

	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status":data.status});
	}
	$scope.switchdeviceSlider = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status":$scope.favoritDevices[data.id].status});
	}

/**************************
**************************/

	$scope.setUser = function() {
		socket.emit('favoritDevices', $scope.activeUser);
		setCookie("username", JSON.stringify($scope.activeUser), 365);
	}

	$scope.deleteCountdown = function(data) {
		socket.emit('deleteCountdown', {"id":data.id});	
	}
	$scope.loadOldMessages = function(){
		socket.emit('loadOldMessages', $scope.sharedMessages[0].time);
	}
	$scope.switchalldevices = function(data) {
		socket.emit('switchalldevices', {"status":data.status});
	}
});


app.controller('AccordionDemoCtrl', function ($scope) {
  $scope.oneAtATime = true;

  $scope.groups = [
    {
      title: 'Dynamic Group Header - 1',
      content: 'Dynamic Group Body - 1'
    },
    {
      title: 'Dynamic Group Header - 2',
      content: 'Dynamic Group Body - 2'
    }
  ];

  $scope.items = ['Item 1', 'Item 2', 'Item 3'];

  $scope.addItem = function() {
    var newItemNo = $scope.items.length + 1;
    $scope.items.push('Item ' + newItemNo);
  };

  $scope.status = {
    isFirstOpen: true,
    isFirstDisabled: false
  };
});