angular.module('app')
.controller('SidebarController',
    ['$scope', '$log', 'lodash', 'categories',
    function($scope, $log, lodash, categories) {
        $scope.status = {
            isopen: false
        };

        var promise = categories.getCategories();
        promise.then(function(result) {
            $scope.categories = result;
        }, function(rejection) {
            alert("promise rejected!");
        })

        // Functions for managing the presentation of the selected items in
        // the sidebar and propigating selections through the catgories service
        $scope.updateSelected = function(category) {
            categories.toggle(category);
        };
        $scope.checkSelected = function(bool) {
            if (bool) {
                return "selected";
            } else {
                return "deselected";
            }
        };
}])
