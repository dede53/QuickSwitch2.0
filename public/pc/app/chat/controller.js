app.controller("chatController", function($scope, socket, $location, $anchorScroll){
<<<<<<< HEAD
	if(typeof $scope.messages == 'undefined'){
		socket.emit("messages:loadOld", new Date().getTime());
=======

	$scope.moreMessagesAvible = true;
	$scope.sharedMessages = new Array;
	$scope.link = {};
	$scope.link.type = "1";

	if($scope.sharedMessages.length == "0"){
		var now = Math.floor(Date.parse(new Date));
		socket.emit('loadOldMessages', now );
	}

	socket.on('linkMessage', function(data){
		if(data.moreMessagesAvible == true){
			$scope.moreMessagesAvible = true;
			data.messages.forEach(function(message){
				$scope.sharedMessages.splice(0, 0, message);
			});
		}else{
			$scope.moreMessagesAvible = false;
		}
	});
	socket.on('newLinkMessage', function(data){
		$scope.sharedMessages.push(data);
	});
	
	$scope.loadOldMessages = function(){
		socket.emit('loadOldMessages', $scope.sharedMessages[0].time);
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
	}
});

app.controller('sendNewMessage', function($scope, socket) {
	$scope.sendMessage = function() {
<<<<<<< HEAD
=======
		// Validierung!!
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		$scope.linkMessage = {
			author: $scope.activeUser.name,
			message: $scope.link.message,
			type: $scope.link.type
		}
		$scope.link.message = "";
		$scope.link.type = "1";
		socket.emit('newLinkMessage', $scope.linkMessage);
<<<<<<< HEAD
=======
		
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
	};
});