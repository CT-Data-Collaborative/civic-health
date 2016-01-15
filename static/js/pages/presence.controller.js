angular.module('app')
.controller('InstitutionPageController',
    ['$scope', '$http', '$log', '$location', 'sidebarDisplay',
    function($scope, $http, $log, $location, sidebarDisplay){
        $scope.toggle = sidebarDisplay.toggle;

        $scope.$on('$viewContentLoaded', function(event) {
            $scope.toggle.open = true;
            sidebarDisplay.section = 'Institutional Presence';
            $scope.nextSection = 'Call to Action';
            $scope.nextSectionTeaser = "Stuff about call to action";
            $scope.nextSectionURL = '#/call-to-action';
        });

}])

