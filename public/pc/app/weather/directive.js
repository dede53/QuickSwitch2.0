app.directive("weatherDirective", function(){
	return {
		restrict: "EA",
		templateUrl: "./app/weather/index.html",
		controller: "weatherController"
	}
});