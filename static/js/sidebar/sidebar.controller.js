angular.module('app')
.controller('SidebarController',
    ['$scope', '$log', 'lodash', 'categories', 'contributors',
    function($scope, $log, lodash, categories, contributors) {
        $scope.status = {
            isopen: false
        };

        var categoryPromise = categories.getCategories();
        categoryPromise.then(function(result) {
            $scope.categories = categories.list;
        }, function(rejection) {
            alert("promise rejected!");
        })

        var contributorPromise = contributors.getContributors();
        contributorPromise.then(function(result) {
            $scope.contributors = contributors.list;
        }, function(rejection) {
            alert("promise rejected!");
        });

        // Functions for managing the presentation of the selected items in
        // the sidebar and propigating selections through the catgories service
        $scope.updateSelected = function(category) {
            categories.toggle(category);
            console.log(lodash.pluck(categories.list, "selected"))
        };
        $scope.checkSelected = function(bool) {
            if (bool) {
                return "selected";
            } else {
                return "deselected";
            }
        };
}])
