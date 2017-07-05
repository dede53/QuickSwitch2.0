app.directive("menuDirective", function(){
	return {
		restrict: "EA",
		templateUrl: "app/menu/menu.html"
	}
});
app.directive("favDirective", function(){
	return {
		restrict: "EA",
		templateUrl: "app/menu/favorits.html"
	}
});