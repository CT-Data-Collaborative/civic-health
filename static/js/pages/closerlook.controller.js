angular.module('app')
.controller('CloserLookPageController',
    ['$scope', '$http', '$log', '$location', 'sidebarDisplay',
    function($scope, $http, $log, $location, sidebarDisplay){
        $scope.toggle = sidebarDisplay.toggle;

        $scope.$on('$viewContentLoaded', function(event) {
            $scope.toggle.open = true;
            sidebarDisplay.section = 'A Closer Look';
            $scope.nextSection = 'Institutional Presence';
            $scope.nextSectionTeaser = "Stuff about institutions";
            $scope.nextSectionURL = '#/institutional-presence';
        });

}])

