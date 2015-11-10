app.directive('chatListDirective', function ($rootScope) {
    return {
        restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
        templateUrl: './app/chat/index.html',
        controller: 'chatController' //Embed a custom controller in the directive
    };
});