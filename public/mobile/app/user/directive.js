app.directive('activeUserDirective', function ($rootScope){
	return {
		restrict: 'EA',
		templateUrl: './app/user/index.html',
		controller: 'activeUser' 
	};
});