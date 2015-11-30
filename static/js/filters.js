angular.module('app')
.filter('suppressions', function() {
  return function(input) {
    if (input === "-9,999.0" || input === "-9999") {
        return 'NA';
    } else if (input === "-666,666.0" || input === "-666666") {
        return ' * ';
    } else {
        return input;
    }
  };
})
.filter('percent', function() {
    return function(str) {
        if (parseInt(str) > 0) {
            return str + "%";
        } else {
            return str;
        }
    }
})
.filter('sluggify', function() {
    return function(input) {
        return input.toLowerCase().replace(/[^a-zA-Z0-9_]/g, "_")
    };
})
.filter('safe', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val.toString());
    };
}]);