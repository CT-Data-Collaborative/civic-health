angular.module('app')
.controller('ParticipationPageController',
    ['$scope', '$http', '$log', '$location', 'sidebarDisplay',
    function($scope, $http, $log, $location, sidebarDisplay){
        $scope.toggle = sidebarDisplay.toggle;

        $scope.$on('$viewContentLoaded', function(event) {
            $scope.toggle.open = false;
            sidebarDisplay.section = 'Political Participation';
            $scope.nextSection = 'Community Cohesion';
            $scope.nextSectionTeaser = "Stuff about cohesion";
            $scope.nextSectionURL = '#/community-cohesion';
        });

}])

