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
                        list = lodash.map(
                            // sort categories by rank
                            lodash.sortBy(response, "rank"), function(o) {
                            // for each indicator in each category, sort 'levels' by a rank as well
                            o.data.forEach(function(indicator, ii, ia) {
                                o.data[ii].data = lodash.sortByAll(o.data[ii].data, "rank")
                            });
                            // extend each category to have a "selected" value, default to true
                            o = lodash.extend({}, o, {"selected" : true})
                            return o;
                        });
                        // set categories.list to a sorted array
                        categories.list = list;

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
