<<<<<<< HEAD
// app.directive('myBackgroundImage', function ($rootScope) {
// 	return function ($scope, element, attrs) {
// 		element.css({
// 			'background-image': 'url(' + $rootScope.activeUser.background + ')',
// 			'background-size': 'cover',
// 			'background-repeat': 'no-repeat',
// 			'background-position': 'center center'
// 		});
// 	};
// });
app.directive('onKeydown', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
             // this next line will convert the string
             // function name into an actual function
             var functionToCall = scope.$eval(attrs.ngKeydown);
             elem.on('keydown', function(e){
             	console.log(e);
                  // on the keydown event, call my function
                  // and pass it the keycode of the key
                  // that was pressed
                  // ex: if ENTER was pressed, e.which == 13
                  functionToCall(e.which);
             });
        }
    };
=======
app.directive('myBackgroundImage', function ($rootScope) {
	return function ($scope, element, attrs) {
		element.css({
			'background-image': 'url(' + $rootScope.activeUser.background + ')',
			'background-size': 'cover',
			'background-repeat': 'no-repeat',
			'background-position': 'center center'
		});
	};
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
});