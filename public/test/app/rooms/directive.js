app.directive("roomDirective", function(){
	return {
		restrict: "EA",
		templateUrl: "app/rooms/index.html",
		controller: "roomsController"
	}
});