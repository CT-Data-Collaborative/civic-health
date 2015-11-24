angular.module('app')
.controller('DataVizController',
    ['$scope', '$http', '$log', 'sidebarDisplay', 'categories', 'lodash',
    function($scope, $http, $log, sidebarDisplay, categories, lodash){
        var lo = lodash;
        $scope.toggle = sidebarDisplay.toggle;

        var promise = categories.getCategories("all");
        promise.then(function(result) {
            $scope.categories = categories.list;
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
