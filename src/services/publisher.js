(function () {

    'use strict';

    // @ngInject
    function Publisher(PublisherConfig, OpentokConfig) {
        return function (isScreenshare) {
            var self = this;

            self.session = null;
            self.publishingVideo = false;
            self.stream = null;
            self.isFullscreen = true;
            self.divId = isScreenshare ? "screenshareDiv" : "publisherDiv";
            self.options = {};

            /* Config for sharing camera */
            self.setOptions = function () {
                self.options = {
                    name: OpentokConfig.credentials.name,
                    width: self.isFullscreen ? "100%" : PublisherConfig.width + "px",
                    height: self.isFullscreen ? "100%" : PublisherConfig.height + "px",
                    publishVideo: true,
                    publishAudio: true,
                    insertMode: "append",
                };
            };

            /* Config for screensharing */
            self.setScreenshareOptions = function () {
                self.options = {
                    name: 'Screenshare',
                    width: self.isFullscreen ? "100%" : PublisherConfig.width + "px",
                    height: self.isFullscreen ? "100%" : PublisherConfig.height + "px",
                    insertMode: "append",
                    videoSource: "screen",
                }
            };

            /* Toggle camera stream */
            self.toggleVideo = function () {
                if (!self.session) return;

                self.session.publishVideo(!self.publishingVideo);
                self.publishingVideo = !self.publishingVideo;

                return self.publishingVideo;
            };

            return self;
        }
    }

    angular.module("osdOpentok")
        .factory('Publisher', Publisher);
})();
