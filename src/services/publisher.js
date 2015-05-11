(function () {

    'use strict';

    // @ngInject
    function Publisher(PublisherConfig) {
        var self = this;

        self.session = null;
        self.publishingVideo = false;
        self.stream = null;
        self.isFullscreen = true;
        self.divId = 'publisherDiv';

        self.options = {
            width: this.isFullscreen ? "100%" : PublisherConfig.width + "px",
            height: this.isFullscreen ? "100%" : PublisherConfig.height + "px",
            publishVideo: true,
            publishAudio: true,
            insertMode: "append",
            name: PublisherConfig.name
        };

        self.toggleVideo = function () {
            if (!self.session) return;

            self.session.publishVideo(!self.publishingVideo);
            self.publishingVideo = !self.publishingVideo;

            return self.publishingVideo;
        };

        return self;
    }

    angular.module("osdOpentok")
        .factory('Publisher', Publisher);
})();
