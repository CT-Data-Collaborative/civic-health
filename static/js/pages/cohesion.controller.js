angular.module('app')
.controller('CohesionPageController',
    ['$scope', '$http', '$log', '$location', 'sidebarDisplay',
    function($scope, $http, $log, $location, sidebarDisplay){
        $scope.toggle = sidebarDisplay.toggle;

        $scope.$on('$viewContentLoaded', function(event) {
            $scope.toggle.open = false;
            sidebarDisplay.section = 'Social Networks and Community Cohesion';
            $scope.nextSection = 'Institutional Presence';
            $scope.nextSectionTeaser = "Institutions — government, news media, corporations, hospitals, and schools — " +
                "are the foundation of our society.";
            $scope.nextSectionURL = '#/institutional-presence';
        });
}])

