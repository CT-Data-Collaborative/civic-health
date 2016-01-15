angular.module('app')
.directive('dataviz', ['$window', '$http', 'timeseriesService', 'groupedBarChartService', 'barChartService', 'tableService', function($window, $http, timeseriesService, groupedBarChartService, barChartService, tableService) {
    // This function should reflect whatever your d3 function is called.
    var charts = {
        "line" : timeseriesService.chart,
        "bar" : barChartService.chart,
        "groupedBar" : groupedBarChartService.chart,
        "table" : tableService.chart
    };
    return  {
        restrict: 'E',
        scope: {
            which: "=which",
            type: "=type"
        },
        link: function(scope, element, attrs) {
            scope.render = function() {
                // data = {
                //     data : scope.data,
                //     config : scope.config
                // };

                if (scope.data) {
                    charts[scope.type](element[0], result.data, {}); //scope.config
                } else {
                    $http.get("/static/dist/data/csv/" + scope.which + ".csv")
                        .then(function(result) {
                            scope.data = result.data;
                            charts[scope.type](element[0], scope.data, {}); //scope.config
                        });
                }
                return;

            }

            scope.$watchCollection('which', function() {
                scope.render();
            });

            /**
                This code is intended to get the chart to redraw when the window is resized
                But as it stands, somehow this overrides the data and the chart becomes useless.
                I don't think this feature is worth the debug time now, but it's worth keeping in mind for the future.
            **/
            // $window.onresize = function() {
            //     scope.render()
            // };

            // scope.$watchCollection('data', function(data) {
            //     scope.render(data);
            // });

        }
    }
}])
