app.controller('chatController', function($scope, socket){
	$scope.link = {};
	$scope.link.type = "1";
	$scope.moreMessagesAvible = true;
	$scope.sharedMessages = new Array;

	//if($scope.sharedMessages === undefined){
		console.log("undefined");
		console.log($scope.sharedMessages);
		
		var now = Math.floor(Date.parse(new Date));
		socket.emit('loadOldMessages', now );
	//}
	socket.on('oldMessages', function(data){
		$scope.moreMessagesAvible = data.moreMessagesAvible;
		if(data.moreMessagesAvible == true){
			console.log(data);
			if(data.messages == ""){
				console.log(data.timestamp -(1000 * 60 * 60 * 24));
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
	$scope.loadOldMessages = function(){
		socket.emit('loadOldMessages', $scope.sharedMessages[0].time);
	}
});

app.controller('sendNewMessage', function($scope, socket) {
		$scope.sendMessage = function() {
			// Validierung!!
			$scope.linkMessage = {
				author: $scope.activeUser.name,
				message: $scope.link.message,
				type: $scope.link.type
			}
			$scope.link.message = "";
			socket.emit('newLinkMessage', $scope.linkMessage);
			
		};

});