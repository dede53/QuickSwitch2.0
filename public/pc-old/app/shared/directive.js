app.directive('devicelist', function ($rootScope) {
    return {
		restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
		scope: {
			//@ reads the attribute value, = provides two-way binding, & works with functions
			title: '@'
		},
		templateUrl: './app/shared/devicelist.html',
		controller: 'favoritenController', //Embed a custom controller in the directive
		// controller: 'favoritDevices', //Embed a custom controller in the directive
		link: function ($scope, element, attrs) {
			element.bind('click', function () {
                //element.addClass('hide');
            });
            element.bind('mouseenter', function () {
                //element.css('background-color', 'yellow');
            });
            element.bind('mouseleave', function () {
                //element.css('background-color', 'white');
            });
		} //DOM manipulation
    };
});
app.directive('switchstatus', function ($rootScope) {
    return {
		restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
		templateUrl: './app/shared/switchstatus.html',
		scope: {
			//@ reads the attribute value, = provides two-way binding, & works with functions
			devices: '='
		},
		transclude: true
		//template: "<bla>{{devices.name}}</bla>",
		//templateUrl: './app/shared/devicelist.html',
		//controller: 'favoritenController', //Embed a custom controller in the directive
		// controller: 'favoritDevices', //Embed a custom controller in the directive

    };
});
/*
app.directive('switchstatus', function($rootScope){
	return{
		restrict: 'E',
		scope: {
			position: '='
		},
		//templateURL:'./app/shared/switchstatus.html'
		template: "<bla>{{devices}}</bla>"
	}
});*/