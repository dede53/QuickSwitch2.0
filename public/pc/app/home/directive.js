app.directive('activeUserDirective', function ($rootScope){
	return {
		restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
		templateUrl: './app/home/user.html',
		controller: 'activeUser' //Embed a custom controller in the directive
	};
});

app.directive('myBackgroundImage', function ($rootScope) {
	return function ($scope, element, attrs) {
		element.css({
			'background-image': 'url(' + $rootScope.activeUser.background + ')',
			'background-size': 'cover',
			'background-repeat': 'no-repeat',
			'background-position': 'center center'
		});
	};
});