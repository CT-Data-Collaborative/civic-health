angular.module('app')
.controller('PartnersPageController',
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
            sidebarDisplay.section = 'Partners';
            $scope.nextSection = 'Raw Data';
            $scope.nextSectionTeaser = "Stuff about raw data";
            $scope.nextSectionURL = '#/raw-data';
        });

}])
