// angular.module('app')
// .controller('DataVizController',
//     ['$scope', '$http', '$log', '$location', '$filter',/* '$anchorScroll', '$rootScope', '$routeParams', */'sidebarDisplay', 'categories', 'lodash',
//     function($scope, $http, $log, $location, $filter,/* $anchorScroll, $rootScope, $routeParams, */sidebarDisplay, categories, lodash){
//         var lo = lodash;
//         $scope.charts = {};
//         $scope.toggle = sidebarDisplay.toggle;

//         $scope.aboutCollapsed = false;

//         $scope.checkChart = function(slug) {
//             slug = $filter('sluggify')(slug);

//             if (!(slug in $scope.charts)) {
//                 $scope.charts[slug] = false;
//                 return false;
//             } else {
//                 return $scope.charts[slug];
//             }
//         }
//         $scope.toggleChart = function(slug) {
//             slug = $filter('sluggify')(slug);

//             if (!(slug in $scope.charts)) {
//                 alert("Somehow, \""+slug+"\" was not in scope.charts!")
//                 $scope.charts[slug] = false;
//                 // return false;
//             } else {
//                 // return $scope.charts[slug];
//                 $scope.charts[slug] = !$scope.charts[slug];
//             }
//         }

//         // $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
//         //     $location.hash($routeParams.scrollTo);
//         //     $anchorScroll();
//         // });

//         var promise = categories.getCategories("all");
//         promise.then(function(result) {
//             $scope.categories = categories.list;
//         }, function(rejection) {
//             alert("promise rejected!");
//         })

//          $scope.$on('$viewContentLoaded', function(event) {
//             $scope.toggle.open = true;
//         });
// }])
