(function() {
    angular.module('osdOpentok')
        .constant('OPENTOK', {
            SCREENSHARE: {
                UNSUPPORTED: 1,
                EXTENSION_REQUIRED: 2,
                SUPPORTED: 3,
            }
        });
})();
