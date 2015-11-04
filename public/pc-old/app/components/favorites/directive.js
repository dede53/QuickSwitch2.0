app.directive('devicelist', function ($rootScope) {
    return {
		restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
		scope: {
			//@ reads the attribute value, = provides two-way binding, & works with functions
			title: '@'
		},
		templateUrl: 'templates/devicelist.html',
		controller: 'favoritenController', //Embed a custom controller in the directive
		//controller: 'favoritDevices', //Embed a custom controller in the directive
		link: function ($scope, element, attrs) {
			element.bind('click', function () {
                element.addClass('hide');
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