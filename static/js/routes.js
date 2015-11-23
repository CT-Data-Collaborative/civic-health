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