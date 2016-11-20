app.factory('socket', function ($rootScope) {
	var socket = io.connect();
<<<<<<< HEAD
	console.log(socket);
=======
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {  
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
});