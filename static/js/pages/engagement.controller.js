angular.module('app')
.controller('EngagementPageController',
    ['$scope', '$http', '$log', '$location',/* '$anchorScroll', '$rootScope', '$routeParams',*/ 'sidebarDisplay',
    function($scope, $http, $log, $location,/* $anchorScroll, $rootScope, $routeParams,*/ sidebarDisplay){
        $scope.toggle = sidebarDisplay.toggle;

        $scope.$on('$viewContentLoaded', function(event) {
            $scope.toggle.open = false;
            sidebarDisplay.section = 'Civic Engagement';
            $scope.nextSection = 'Political Participation';
            $scope.nextSectionTeaser = "Stuff about political participation";
            $scope.nextSectionURL = '#/political-participation';
        });

}])

