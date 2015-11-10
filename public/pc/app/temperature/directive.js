app.directive('temperatureDirective', function ($rootScope) {
    return {
        restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
        template: '<highchart style="min-height: 600px; min-width: 310px" class="chart" config="chartConfig" class="span9"  ></highchart>',
        controller: 'temperatureController' //Embed a custom controller in the directive
    };
});