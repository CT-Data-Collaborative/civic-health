angular.module('app')
.service('contributors', ['$http', '$q', function($http, $q) {
    var contributors = {};
    contributors.list = [];

    contributors.getContributors = function() {
        if (contributors.list.length > 0) {
            // if this object already has data, just use what's currently available
            return $q(function(resolve){resolve(contributors)});
        } else {
            // otherwise get data fresh from file
            return $q(function(resolve, reject) {
                $http.get('/static/dist/data/contributors.json')
                    .success(function(response) {
                        contributors.list = response;
                        resolve(contributors);
                    })
                    .error(function() {
                        reject("There was an error getting contributors");
                    });
            });
        }
    };

    return contributors;
}])
