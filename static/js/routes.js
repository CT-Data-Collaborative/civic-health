angular.module('app')
.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/data', {
            templateUrl: 'static/dist/templates/data.html',
            controller: 'DataVizController'
        })
        .when('/about', {
            templateUrl: 'static/dist/templates/about.html',
            controller: 'AboutPageController'
        })
        .otherwise({
            redirectTo: '/data'
        });
});
