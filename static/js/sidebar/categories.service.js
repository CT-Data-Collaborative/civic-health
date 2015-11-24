angular.module('app')
.service('categories', ['$http', '$q', 'lodash', function($http, $q, lodash) {
    var categories = {};
    categories.list = [];

    categories.toggle = function(category) {
        position = lodash.findIndex(categories.list, function(listcat) {
            return listcat.name == category.name;
        });
        categories.list[position].selected = !categories.list[position].selected;
    };

    categories.getCategories = function() {
        if (categories.list.length > 0) {
            // if this object already has data, just use what's currently available
            return $q(function(resolve){resolve(categories)});
        } else {
            // otherwise get data fresh from file
            return $q(function(resolve, reject) {
                $http.get('/static/dist/data/data.json')
                    .success(function(response) {
                        categories.list = lodash.map(lodash.sortBy(response, "rank"), function(o) {
                            return lodash.extend({}, o, {"selected" : true})
                        })
                        categories.list
                        resolve(categories);
                    })
                    .error(function() {
                        reject("There was an error getting categories");
                    });
            });
        }
    };

    return categories;
}])
