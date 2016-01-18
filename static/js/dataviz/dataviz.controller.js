angular.module('app')
    .controller('DataVizController',
        ['$scope', '$http', '$log', '$location', '$filter', 'sidebarDisplay', 'categories',
            function ($scope, $http, $log, $location, $filter, sidebarDisplay, categories) {
                $scope.toggle = sidebarDisplay.toggle;

                var promise = categories.getCategories("all");
                promise.then(function (result) {
                    $scope.categories = categories.list;
                }, function (rejection) {
                    alert("promise rejected!");
                });

                $scope.$on('$viewContentLoaded', function (event) {
                    $scope.toggle.open = false;
                    sidebarDisplay.section = 'Raw Data';
                });
            }])
