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