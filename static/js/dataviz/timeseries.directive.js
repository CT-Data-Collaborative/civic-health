angular.module('app')
.directive('timeseries', [/*'$window', */function($window) {
    // This function should reflect whatever your d3 function is called.
    var chart = timeSeries();
    return  {
        restrict: 'E',
        scope: {
            data: "=data" // We can call this w/e we want.
        },
        link: function(scope, element, attrs) {
            scope.$watchCollection('data', function(data) {
                data = {
                    data : data,
                    config : {
                        "width" : element.parent()[0].getBoundingClientRect().width
                    }
                }

                d3.select(element[0]).datum(data).call(chart);
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

            // scope.render = function() {
            //     data = {
            //         data : scope.data,
            //         config : {
            //             "width" : element.parent()[0].getBoundingClientRect().width
            //         }
            //     };

            //     d3.select(element[0]).datum(data).call(chart);
            // }
        }
    }
}])
