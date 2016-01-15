angular.module('app')
    .controller('WrapController', ['$scope', 'sidebarDisplay', function ($scope, sidebarDisplay) {
        $scope.toggle = sidebarDisplay.toggle;
        $scope.section = sidebarDisplay.section;

        $scope.$watchCollection(function () {
            return sidebarDisplay.section;
        }, function () {
            $scope.section = sidebarDisplay.section;
        });
    }])
