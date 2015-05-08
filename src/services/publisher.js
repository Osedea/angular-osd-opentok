(function () {

    'use strict';

    // @ngInject
    function Publisher() {
        var self = this;

        self.session = null;
        self.publishingVideo = false;
        self.stream = null;
        self.isFullscreen = true;
        self.divId = 'publisherDiv';

        self.options = {
            width: this.isFullscreen ? "100%" : "200px",
            height: this.isFullscreen ? "100%" : "150px",
            publishVideo: true,
            publishAudio: true,
            insertMode: "append",
            //videoSource: "screen",
            name: ""
        };

        self.toggleVideo = function () {
            if (!self.session) return;

            self.session.publishVideo(!self.publishingVideo);
            self.publishingVideo = !self.publishingVideo;

            return self.publishingVideo;
        };

        return self;
    }

    angular.module('chaya')
        .factory('Publisher', Publisher);
})();
