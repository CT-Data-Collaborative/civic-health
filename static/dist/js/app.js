var app = angular.module('app', [
    'ngAnimate',
    'ui.bootstrap',
    'ngLodash',
    'ngRoute'
    ]);

angular.module('app')
.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/data', {
            templateUrl: 'static/dist/templates/data.html',
            controller: 'DataVizController'
        })
        .when('/about', {
            templateUrl: 'static/dist/templates/about.html'
        })
        .otherwise({
            redirectTo: '/data'
        });
});
angular.module('app')
.controller('DataVizController',
    ['$scope', '$http', '$log', 'sidebarDisplay', 'categories', 'lodash',
    function($scope, $http, $log, sidebarDisplay, categories, lodash){
        var lo = lodash;
        $scope.toggle = sidebarDisplay.toggle;

        var promise = categories.getCategories("all");
        promise.then(function(result) {
            $scope.categories = result;
        }, function(rejection) {
            alert("promise rejected!");
        })

        // Sample watch...doesn't do much, but demonstrates how
        // to watch object from a service.
        $scope.$watchCollection(function() {
            return $scope.categories;
        }, function() {
            console.log("Selection Detected");
        }, true);
}])

angular.module('app')
.directive('simpletable', function() {
    // This function should reflect whatever your d3 table function is called.
    var chart = tableChart();
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

angular.module('app')
.service('categories', ['$http', '$q', 'lodash', function($http, $q, lodash) {
    var categories = {};
    categories.list = [
    ];

    categories.getCategories = function(keys) {
        if (typeof keys == "undefined") {
            keys = ["name", "icon"];
        } else if (keys == "all") {
            keys = ["name", "data", "icon"];
        }
        console.log(keys)
        return $q(function(resolve, reject) {
            $http.get('/static/dist/data/data.json')
                .success(function(response) {
                    resolve(
                        lodash.map(lodash.sortBy(response, "rank"), function(cat) {
                            var o = {}
                            for (var k in keys) {
                                o[keys[k]] = cat[keys[k]];
                            }
                            o.selected =  true;
                            return o;
                        })
                    );
                })
                .error(function() {
                    reject("There was an error getting categories");
                });
        });
    };

    categories.toggle = function(category) {
        position = lodash.findIndex(categories.list, function(listcat) {
            return listcat.name == category.name;
        });
        categories.list[position].selected = !categories.list[position].selected;
    };

    return categories;
}])

angular.module('app')
.controller('SidebarController',
    ['$scope', '$log', 'lodash', 'categories',
    function($scope, $log, lodash, categories) {
        $scope.status = {
            isopen: false
        };

        var promise = categories.getCategories();
        promise.then(function(result) {
            $scope.categories = result;
        }, function(rejection) {
            alert("promise rejected!");
        })

        // Functions for managing the presentation of the selected items in
        // the sidebar and propigating selections through the catgories service
        $scope.updateSelected = function(category) {
            categories.toggle(category);
        };
        $scope.checkSelected = function(bool) {
            if (bool) {
                return "selected";
            } else {
                return "deselected";
            }
        };
}])

angular.module('app')
.service('sidebarDisplay', function() {
    return {
        toggle: { toggled: false }
    }
})

angular.module('app')
.controller('WrapController', ['$scope', 'sidebarDisplay', function($scope, sidebarDisplay) {
    $scope.toggle = sidebarDisplay.toggle;
}])
