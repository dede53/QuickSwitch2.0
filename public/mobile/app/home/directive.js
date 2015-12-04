app.directive('favoritenDirective', function ($rootScope) {
    return {
        restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
        templateUrl: './app/home/devicelist.html',
        controller: 'favoritDevices'
    };
});

app.directive('activeDevicesDirective', function ($rootScope) {
    return {
        restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
        templateUrl: './app/home/activedevicelist.html',
        controller: 'activeDevices' //Embed a custom controller in the directive
    };
});

app.directive('activeUserDirective', function ($rootScope) {
    return {
		restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
		templateUrl: './app/home/user.html',
		controller: 'activeUser' //Embed a custom controller in the directive
    };
});