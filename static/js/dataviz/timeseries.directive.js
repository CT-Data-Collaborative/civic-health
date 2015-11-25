angular.module('app')
.directive('timeseries', function() {
    // This function should reflect whatever your d3 function is called.
    var chart = timeSeries();
    return  {
        restrict: 'E',
        scope: {
            data: "=data" // We can call this w/e we want.
        },
        link: function(scope, element, attrs) {
            scope.$watchCollection('data', function(data) {
                d3.select(element[0]).datum(data).call(chart);
            });
        }
    }
})
