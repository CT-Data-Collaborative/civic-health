angular.module('app')
.filter('suppressions', function() {
  return function(input) {
    if (input === '-9999') {
        return 'NA';
    } else if (input === '-666666') {
        return ' &mdash; ';
    } else {
        return input;
    }
  };
})
.filter('sluggify', function() {
    return function(input) {
        return input.toLowerCase().replace(/[^a-zA-Z0-9_]/g, "_")
    };
})
.filter('safe', function($sce) {
    return $sce.trustAsHtml;
});