angular.module('app')
.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/introduction', {
            templateUrl: 'static/dist/templates/introduction.html',
            controller: 'AboutPageController'
        })
        .when('/civic-engagement', {
            templateUrl: 'static/dist/templates/civic-engagement.html',
            controller: 'EngagementPageController'
        })
        .when('/political-participation', {
            templateUrl: 'static/dist/templates/political-participation.html',
            controller: 'ParticipationPageController'
        })
        .when('/community-cohesion', {
            templateUrl: 'static/dist/templates/community-cohesion.html',
            controller: 'CohesionPageController'
        })
        .when('/institutional-presence', {
            templateUrl: 'static/dist/templates/institutional-presence.html',
            controller: 'InstitutionPageController'
        })
        .when('/a-closer-look', {
            templateUrl: 'static/dist/templates/closer-look.html',
            controller: 'CloserLookPageController'
        })
        .when('/call-to-action', {
            templateUrl: 'static/dist/templates/call-to-action.html',
            controller: 'CallToActionPageController'
        })
        .when('/partners', {
            templateUrl: 'static/dist/templates/partners.html',
            controller: 'PartnersPageController'
        })
        .when('/raw-data', {
            templateUrl: 'static/dist/templates/data.html',
            controller: 'DataVizController'
        })
        .otherwise({
            redirectTo: '/introduction'
        });
});
