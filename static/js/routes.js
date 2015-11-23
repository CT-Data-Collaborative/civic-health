angular.module('app')
.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'index.html'
    }).when('/about.html', {
        templateUrl: 'about.html'
    });
});