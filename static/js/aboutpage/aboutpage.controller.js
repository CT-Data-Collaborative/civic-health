angular.module('app')
.controller('AboutPageController',
    ['$scope', '$http', '$log', 'sidebarDisplay', 'contributors',
    function($scope, $http, $log, sidebarDisplay, contributors){
        $scope.toggle = sidebarDisplay.toggle;
        console.log($scope.toggle);

        var contributorPromise = contributors.getContributors("all");
        contributorPromise.then(function(result) {
            $scope.contributors = contributors.list;
        }, function(rejection) {
            alert("promise rejected!");
        });

        $scope.$on('$viewContentLoaded', function(event) {
            // I made changes to the sidebar display service, renaming the internal
            // setting to be "open", which makes it easier to interpret this. I made
            // corresponding changes in the about and data templates.
            // This listener ensures that the sidebar doesn't get closed, which somehow
            // resolves the issue of rendering the template underneat the slideout menu
            $scope.toggle.open = false;
        });

}])
