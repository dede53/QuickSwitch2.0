app.directive('activeUserDirective', function ($rootScope) {
    return {
		restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
		templateUrl: './app/home/user.html',
		controller: 'activeUser' //Embed a custom controller in the directive
    };
});