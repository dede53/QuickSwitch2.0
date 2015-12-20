app.directive('chatDirective', function ($rootScope) {
    return {
        restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
        templateUrl: './app/chat/index.html',
        controller: "chatController"
    };
});