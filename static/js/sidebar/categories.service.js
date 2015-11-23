angular.module('app')
.service('categories', ['lodash', function(lodash) {
    var categories = {};
    categories.list = [
        {'name': 'Category 1', 'selected': true, 'icon': 'fa fa-gavel'},
        {'name': 'Category 2', 'selected': true, 'icon': 'fa fa-gavel'},
        {'name': 'Category 3', 'selected': true, 'icon': 'fa fa-gavel'},
        {'name': 'Category 4', 'selected': true, 'icon': 'fa fa-gavel'},
        {'name': 'Category 5', 'selected': true, 'icon': 'fa fa-gavel'},
        {'name': 'Category 6', 'selected': true, 'icon': 'fa fa-gavel'},
        {'name': 'Category 7', 'selected': true, 'icon': 'fa fa-gavel'}
    ];
    categories.toggle = function(category) {
        position = lodash.findIndex(categories.list, function(listcat) {
            return listcat.name == category.name;
        });
        categories.list[position].selected = !categories.list[position].selected;
    }
    return categories;
}])
