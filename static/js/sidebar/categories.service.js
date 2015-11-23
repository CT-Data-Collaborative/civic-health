angular.module('app')
.service('categories', ['$http', 'lodash', function($http, lodash) {
    var categories = {};
    categories.list = [
        // {'name': 'Category 1', 'selected': true, 'icon': 'fa fa-gavel'},
        // {'name': 'Category 2', 'selected': true, 'icon': 'fa fa-gavel'},
        // {'name': 'Category 3', 'selected': true, 'icon': 'fa fa-gavel'},
        // {'name': 'Category 4', 'selected': true, 'icon': 'fa fa-gavel'},
        // {'name': 'Category 5', 'selected': true, 'icon': 'fa fa-gavel'},
        // {'name': 'Category 6', 'selected': true, 'icon': 'fa fa-gavel'},
        // {'name': 'Category 7', 'selected': true, 'icon': 'fa fa-gavel'}
    ];

    $http.get('/static/dist/data/data.json')
        .success(function(response) {
            console.log(response);
            categories.list = lodash.map(response, function(cat) {
                return { "name" : cat.topic, "selected" : true, "icon" : cat.icon };
            });
        });

    categories.toggle = function(category) {
        position = lodash.findIndex(categories.list, function(listcat) {
            return listcat.name == category.name;
        });
        categories.list[position].selected = !categories.list[position].selected;
    }
    return categories;
}])
