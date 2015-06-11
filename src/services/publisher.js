(function () {

    'use strict';

    // @ngInject
    function Publisher(PublisherConfig, OpentokConfig) {
        var self = this;

        self.onAccessAllowed = null;
        self.onAccessDenied = null;
        self.session = null;
        self.publishingVideo = false;
        self.stream = null;
        self.isFullscreen = true;
        self.divId = "publisherDiv";
        self.options = {};

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

        self.setScreenshareOptions = function () {
            self.options = {
                name: OpentokConfig.credentials.name + ' - Screenshare',
                width: self.isFullscreen ? "100%" : PublisherConfig.width + "px",
                height: self.isFullscreen ? "100%" : PublisherConfig.height + "px",
                insertMode: "append",
                videoSource: "screen",
            }
        };


        self.setSession = function (session) {
            self.session = session;

            self.session.on({
                accessAllowed: self.onAccessAllowed,
                accessDenied: self.onAccessDenied
            });
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
