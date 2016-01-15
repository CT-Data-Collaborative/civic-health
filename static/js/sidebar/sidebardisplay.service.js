angular.module('app')
.service('sidebarDisplay', function() {
    return {
        toggle: { open: true },
        section: 'Introduction'
    }
})
