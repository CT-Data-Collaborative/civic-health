angular.module('app')
.controller('AboutPageController',
    ['$scope', '$http', '$log', 'sidebarDisplay', 'contributors', 'lodash',
    function($scope, $http, $log, sidebarDisplay, contributors, lodash){
        var lo = lodash;
        $scope.toggle = sidebarDisplay.toggle;

        var contributorPromise = contributors.getContributors("all");
        contributorPromise.then(function(result) {
            $scope.contributors = contributors.list;
        }, function(rejection) {
            alert("promise rejected!");
        })

        // Sample watch...doesn't do much, but demonstrates how
        // to watch object from a service.
        $scope.$watchCollection(function() {
            return $scope.contributors;
        }, function() {
            console.log("Selection Detected");
        }, true);
}])
