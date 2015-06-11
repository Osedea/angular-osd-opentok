(function() {

    'use strict';

    var osdOpentok = angular.module('osdOpentok');

    /*
     @ngInject
     */
    osdOpentok.provider('PublisherConfig', function () {
        var self = this;

        self.config = {
            width: 200,
            height: 150,
            name: "Me",
            onMediaAccessAllowed: null,
            onMediaAccessDenied: null,
        };

        self.setConfig = function(value) {
            self.config = value;

            return self;
        };

        self.$get = function () {
            return self.config;
        };

        return self;
    });
})();
