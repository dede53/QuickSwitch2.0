app.directive('countdownDirective', function(){
	return {
		restrict: "EA",
		templateUrl: "./app/countdown/index.html",
		controller: "countdownController"
	}
});