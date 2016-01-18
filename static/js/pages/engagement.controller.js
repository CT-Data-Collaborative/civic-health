angular.module('app')
.controller('EngagementPageController',
    ['$scope', '$http', '$log', '$location',/* '$anchorScroll', '$rootScope', '$routeParams',*/ 'sidebarDisplay',
    function($scope, $http, $log, $location,/* $anchorScroll, $rootScope, $routeParams,*/ sidebarDisplay){
        $scope.toggle = sidebarDisplay.toggle;

        $scope.$on('$viewContentLoaded', function(event) {
            $scope.toggle.open = false;
            sidebarDisplay.section = 'Civic Engagement';
            $scope.nextSection = 'Political Participation';
            $scope.nextSectionTeaser = "A healthy democracy is based on a strong relationship between elected officials and their constituents.";
            $scope.nextSectionURL = '#/political-participation';
        });

}])

