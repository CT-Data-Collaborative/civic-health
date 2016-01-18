angular.module('app')
.controller('ConclusionsPageController',
    ['$scope', '$http', '$log', '$location', 'sidebarDisplay',
    function($scope, $http, $log, $location, sidebarDisplay){
        $scope.toggle = sidebarDisplay.toggle;

        $scope.$on('$viewContentLoaded', function(event) {
            $scope.toggle.open = false;
            sidebarDisplay.section = 'Conclusions';
            $scope.nextSection = 'Partners';
            //$scope.nextSectionTeaser = "A deeper analysis reveals notable differences in civic engagement based on " +
            //    "demographic characteristics, including age, gender, and race or ethnicity.";
            $scope.nextSectionURL = '#/partners';
        });

}])

