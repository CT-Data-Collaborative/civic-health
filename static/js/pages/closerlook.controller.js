angular.module('app')
.controller('CloserLookPageController',
    ['$scope', '$http', '$log', '$location', 'sidebarDisplay',
    function($scope, $http, $log, $location, sidebarDisplay){
        $scope.toggle = sidebarDisplay.toggle;

        $scope.$on('$viewContentLoaded', function(event) {
            $scope.toggle.open = false;
            sidebarDisplay.section = 'A Closer Look';
            $scope.nextSection = 'Conclusions';
            $scope.nextSectionTeaser = "As this report has shown, there are many efforts underway to improve the civic" +
                "health of our state. But even with important progress, urgent challenges remain.";
            $scope.nextSectionURL = '#/conclusions';
        });

}])

