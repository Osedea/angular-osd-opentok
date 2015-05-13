(function () {

    'use strict';

    // @ngInject
    function Subscriber(SubscriberConfig) {
        return function (thumbnailCount) {
            var self = this;

            self.session = null;
            self.isFullscreen = thumbnailCount === 1;
            self.thumbnailCount = thumbnailCount;
            self.divId = "subscriber-" + thumbnailCount;

            self.options = {
                width: self.isFullscreen ? "100%" : SubscriberConfig.width + "px",
                height: self.isFullscreen ? "100%" : SubscriberConfig.height + "px",
                subscribeToVideo: true,
                subscribeToAudio: true,
                insertMode: "replace"
            };

            self.getStyle = function () {
                var marginLeft = -((SubscriberConfig.width + 5) * self.thumbnailCount);

                return {
                    width: self.isFullscreen ? "100%" : SubscriberConfig.width + "px",
                    height: self.isFullscreen ? "100%" : SubscriberConfig.height + "px",
                    'margin-left': self.isFullscreen ? 0 : marginLeft + "px"
                };
            };

            self.toggleVideo = function () {
                if (!self.session) {
                    return;
                }

                self.session.subscribeToVideo(!self.subscribingToVideo);
                self.subscribingToVideo = !self.subscribingToVideo;

                return self.subscribingToVideo;
            };
        };
    }

    angular.module("osdOpentok")
        .service("Subscriber", Subscriber);

})();
