angular.module('app')
.controller('ParticipationPageController',
    ['$scope', '$http', '$log', '$location', 'sidebarDisplay',
    function($scope, $http, $log, $location, sidebarDisplay){
        $scope.toggle = sidebarDisplay.toggle;

        $scope.$on('$viewContentLoaded', function(event) {
            $scope.toggle.open = false;
            sidebarDisplay.section = 'Political Participation';
            $scope.nextSection = 'Community Cohesion';
            $scope.nextSectionTeaser = "Social networks, whose growth is linked with decreased neighborhood crime and " +
                "better individual well-being, enrich communities in many ways.";
            $scope.nextSectionURL = '#/community-cohesion';
        });

}])

