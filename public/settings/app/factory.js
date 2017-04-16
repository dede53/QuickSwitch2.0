app.factory('socket', function ($rootScope) {
	var socket = io.connect();
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

app.directive('json', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ngModelCtrl) {
			function fromUser(text) {
				if (!text || text.trim() === '')
					return {}
				else
					return angular.fromJson(text);
			}

			function toUser(object) {
					return angular.toJson(object, true);
			}
			ngModelCtrl.$parsers.push(fromUser);
			ngModelCtrl.$formatters.push(toUser);
			scope.$watch(attrs.ngModel, function(newValue, oldValue) {
				if (newValue != oldValue) {
					ngModelCtrl.$setViewValue(toUser(newValue));
					ngModelCtrl.$render();
				}
			}, true);
		}
	};  
});