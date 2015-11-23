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
            templateUrl: 'static/templates/data.html',
            controller: 'DataVizController'
        })
        .when('/about', {
            templateUrl: 'static/templates/about.html'
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
        $scope.categories = categories.list;

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
.service('categories', ['$http', 'lodash', function($http, lodash) {
    var categories = {};
    categories.list = [
        // {'name': 'Category 1', 'selected': true, 'icon': 'fa fa-gavel'},
        // {'name': 'Category 2', 'selected': true, 'icon': 'fa fa-gavel'},
        // {'name': 'Category 3', 'selected': true, 'icon': 'fa fa-gavel'},
        // {'name': 'Category 4', 'selected': true, 'icon': 'fa fa-gavel'},
        // {'name': 'Category 5', 'selected': true, 'icon': 'fa fa-gavel'},
        // {'name': 'Category 6', 'selected': true, 'icon': 'fa fa-gavel'},
        // {'name': 'Category 7', 'selected': true, 'icon': 'fa fa-gavel'}
    ];

    $http.get('/static/dist/data/data.json')
        .success(function(response) {
            console.log(response);
            categories.list = lodash.map(response, function(cat) {
                return { "name" : cat.topic, "selected" : true, "icon" : cat.icon };
            });
        });

    categories.toggle = function(category) {
        position = lodash.findIndex(categories.list, function(listcat) {
            return listcat.name == category.name;
        });
        categories.list[position].selected = !categories.list[position].selected;
    }
    return categories;
}])

angular.module('app')
.controller('SidebarController',
    ['$scope', '$log', 'lodash', 'categories',
    function($scope, $log, lodash, categories) {
        $scope.status = {
            isopen: false
        };

        $scope.categories = categories.list;

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
