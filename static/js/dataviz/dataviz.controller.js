 angular.module('app')
 .controller('DataVizController',
     ['$scope', '$http', '$log', '$location', '$filter',/* '$anchorScroll', '$rootScope', '$routeParams', */'sidebarDisplay', 'categories', 'lodash',
     function($scope, $http, $log, $location, $filter,/* $anchorScroll, $rootScope, $routeParams, */sidebarDisplay, categories, lodash){
         $scope.toggle = sidebarDisplay.toggle;

         $scope.$on('$viewContentLoaded', function(event) {
             $scope.toggle.open = true;
             sidebarDisplay.section = 'Raw Data';
        });
}])
