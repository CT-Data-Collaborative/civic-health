angular.module('app')
.controller('AboutPageController',
    ['$scope', '$http', '$log', '$location',/* '$anchorScroll', '$rootScope',*/ '$routeParams', 'sidebarDisplay', 'contributors',
    function($scope, $http, $log, $location,/* $anchorScroll, $rootScope,*/ $routeParams, sidebarDisplay, contributors){
        $scope.toggle = sidebarDisplay.toggle;

        var contributorPromise = contributors.getContributors("all");
        contributorPromise.then(function(result) {
            $scope.contributors = contributors.list;
        }, function(rejection) {
            alert("promise rejected!");
        });

        $scope.$on('$viewContentLoaded', function(event) {
            $scope.toggle.open = false;
            sidebarDisplay.section = 'Introduction';
            $scope.nextSection = 'Civic Engagement';
            $scope.nextSectionTeaser = 'Testing';
            $scope.nextSectionURL = '#/civic-engagement';
        });

}])
