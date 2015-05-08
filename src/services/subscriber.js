(function() {

    'use strict';

    // @ngInject
    function Subscriber() {
        return function (count) {
            var self = this;

            self.isFullscreen = count === 1;
            self.session = null;
            self.count = count;
            self.divId = "subscriber-" + count;

            self.options = {
                width: self.isFullscreen ? "100%" : "200px",
                height: self.isFullscreen ? "100%" : "150px",
                subscribeToVideo: true,
                subscribeToAudio: true,
                insertMode: "replace",
            };

            self.getStyle = function () {
                var marginLeft = (-205 * self.count);

                return {
                    width: self.isFullscreen ? "100%" : "200px",
                    height: self.isFullscreen ? "100%" : "150px",
                    'margin-left': self.isFullscreen ? 0 : marginLeft + "px",
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

    angular.module('chaya')
        .service("Subscriber", Subscriber);

})();
