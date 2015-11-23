angular.module('app')
.controller('WrapController', ['$scope', 'sidebarDisplay', function($scope, sidebarDisplay) {
    $scope.toggle = sidebarDisplay.toggle;
}])
