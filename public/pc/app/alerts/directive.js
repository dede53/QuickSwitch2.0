app.directive('alertsDirective', function ($rootScope) {
    return {
        restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
        templateUrl: './app/alerts/index.html',
        controller: "alertsController"
    };
});