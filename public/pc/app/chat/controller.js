app.controller("chatController", function($scope, socket, $location, $anchorScroll){
	if(typeof $scope.messages == 'undefined'){
		socket.emit("messages:loadOld", new Date().getTime());
	}
});

app.controller('sendNewMessage', function($scope, socket) {
	$scope.sendMessage = function() {
		$scope.linkMessage = {
			author: $scope.activeUser.name,
			message: $scope.link.message,
			type: $scope.link.type
		}
		$scope.link.message = "";
		$scope.link.type = "1";
		socket.emit('newLinkMessage', $scope.linkMessage);
	};
});