app.directive('alertsDirective', function ($rootScope) {
    return {
        restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
<<<<<<< HEAD
        templateUrl: './app/alerts/index.html'
=======
        templateUrl: './app/alerts/index.html',
        controller: "alertsController"
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
    };
});