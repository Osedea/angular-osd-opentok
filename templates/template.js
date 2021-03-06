(function () {

    'use strict';

    // @ngInject
    function opentokTemplate($templateCache) {
        $templateCache.put("/templates/angular-osd-opentok.html", "" +
            "<div id=\"opentokDiv\" class=\"video-block\">" +
                "<div class=\"subscriber-list\">" +
                    "<div id=\"subscriber-{{ $index + 1 }}\" ng-repeat=\"subscriber in getSubscribers()\" ng-class=\"subscriber.isFullscreen ? 'main-subscriber' : 'thumbnail-subscriber'\" ng-click=\"switchFullscreen(subscriber)\" ng-style=\"subscriber.getStyle()\"></div>" +
                "</div>" +
                "<div id=\"screenshareDiv\" class=\"screenshare\"></div>" +
                "<div id=\"publisherDiv\" class=\"publisher\" ng-show=\"showPublisherTile\" ng-class=\"{ 'fullscreen' : isFullscreen() }\"></div>" +
                "<button class=\"btn btn-primary btn-screenshare\" ng-click=\"toggleScreenshare()\" ng-show=\"screenshareIsSupported()\">{{ getScreensharePublisher() ? 'Stop Sharing' : 'Share Screen' }}</button>" +
                "<div class=\"dropup\">" +
                    "<button id=\"dropdownMenu2\" class=\"btn btn-primary\" type=\"button\" data-toggle=\"dropdown\" aria-expanded=\"true\">" +
                        "Streams ( {{ getStreamsAvailable().length + 1 }} ) <span class=\"caret\"></span>" +
                    "</button>" +
                    "<ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"dropdownMenu2\">" +
                        "<li class=\"clearfix\">" +
                            "<span>You</span>" +
                            "<div class=\"pull-right inline-block\">" +
                                "<a ng-click=\"showPublisherTile = !showPublisherTile\"><i class=\"fa\" ng-class=\"showPublisherTile ? 'fa-compress' : 'fa-expand'\"></i></a>" +
                            "</div>" +
                        "</li>" +
                        "<li class=\"clearfix\" ng-repeat=\"stream in getStreamsAvailable()\">" +
                            "<span>{{ stream.name }}</span>" +
                            "<div class=\"pull-right inline-block\">" +
                                "<a ng-click=\"isBeingSubscribedTo(stream) ? unsubscribe(stream) : subscribe(stream)\"><i class=\"fa\" ng-class=\"isBeingSubscribedTo(stream) ? 'fa-stop' : 'fa-play'\"></i></a>" +
                                "<a ng-click=\"forceDisconnect(stream)\" ng-show=\"isModerator()\"><i class=\"fa fa-sign-out\"></i></a>" +
                            "</div>" +
                        "</li>" +
                    "</ul>" +
                "</div>" +
            "</div>" +
        "");
    }


    angular.module('osdOpentok')
        .run(opentokTemplate);
})();
