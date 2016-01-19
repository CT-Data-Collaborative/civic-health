//TODO Consolidate controllers and abstract content loaded settings
//TODO Move section name, teaser, link, and next into json
//TODO Enable googledocs based content

angular.module('app')
.controller('AboutPageController',
    ['$scope', '$http', '$log', '$location',/* '$anchorScroll', '$rootScope',*/ '$routeParams', 'sidebarDisplay', 'contributors',
    function($scope, $http, $log, $location,/* $anchorScroll, $rootScope,*/ $routeParams, sidebarDisplay, contributors){
        $scope.toggle = sidebarDisplay.toggle;

        //var contributorPromise = contributors.getContributors("all");
        //contributorPromise.then(function(result) {
        //    $scope.contributors = contributors.list;
        //}, function(rejection) {
        //    alert("promise rejected!");
        //});

        $scope.$on('$viewContentLoaded', function(event) {
            $scope.toggle.open = false;
            sidebarDisplay.section = 'Introduction';
            $scope.nextSection = 'Civic Engagement';
            $scope.nextSectionTeaser = 'Participation in community life through different civic pathways \p' +
                'rovides opportunities for everyday civic contributions, allowing individuals to find personal ' +
                'enrichment while addressing local issues.';
            $scope.nextSectionURL = '#/civic-engagement';
            $scope.report2011URL = 'pdfs/2011 Connecticut Civic Health Index Report.pdf';
            $scope.report2016URL = 'pdfs/2016 Connecticut Civic Health Index Report.pdf'
        });

        $('#citation').tooltip('show');

}])
