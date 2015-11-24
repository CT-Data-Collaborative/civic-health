angular.module('app')
.service('categories', ['$http', '$q', 'lodash', function($http, $q, lodash) {
    var categories = {};
    categories.list = [
    ];

    categories.getCategories = function(keys) {
        if (typeof keys == "undefined") {
            keys = ["name", "icon"];
        } else if (keys == "all") {
            keys = ["name", "data", "icon"];
        }
        console.log(keys)
        return $q(function(resolve, reject) {
            $http.get('/static/dist/data/data.json')
                .success(function(response) {
                    resolve(
                        lodash.map(lodash.sortBy(response, "rank"), function(cat) {
                            var o = {}
                            for (var k in keys) {
                                o[keys[k]] = cat[keys[k]];
                            }
                            o.selected =  true;
                            return o;
                        })
                    );
                })
                .error(function() {
                    reject("There was an error getting categories");
                });
        });
    };

    categories.toggle = function(category) {
        position = lodash.findIndex(categories.list, function(listcat) {
            return listcat.name == category.name;
        });
        categories.list[position].selected = !categories.list[position].selected;
    };

    return categories;
}])
