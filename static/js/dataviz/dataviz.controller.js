angular.module('app')
.controller('DataVizController',
    ['$scope', '$http', '$log', '$location', '$filter',/* '$anchorScroll', '$rootScope', '$routeParams', */'sidebarDisplay', 'categories', 'lodash',
    function($scope, $http, $log, $location, $filter,/* $anchorScroll, $rootScope, $routeParams, */sidebarDisplay, categories, lodash){
        var lo = lodash;
        $scope.toggle = sidebarDisplay.toggle;

        $scope.toggleChart = function(slug) {
            slug = $filter('sluggify')(slug);

            $("#"+slug).toggle();
        }

        // $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
        //     $location.hash($routeParams.scrollTo);
        //     $anchorScroll();
        // });

        var promise = categories.getCategories("all");
        promise.then(function(result) {
            $scope.categories = categories.list;
        }, function(rejection) {
            alert("promise rejected!");
        })

         $scope.$on('$viewContentLoaded', function(event) {
            $scope.toggle.open = true;
        });
}])
