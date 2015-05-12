(function () {

    'use strict';

    // @ngInject
    function osdOpentok($templateCache) {
        $templateCache.put("/templates/angular-osd-opentok.html", "" +

            "<div id=\"opentokDiv\" class=\"video-block\">" +
                    //"<button class=\"btn btn-primary\" ng-click=\"publishScreen()\" style=\"position: relative; z-index: 100;\">Screenshare</button>" +
                "<div class=\"subscriber-list\">" +
                    "<div id=\"subscriber-{{ $index + 1 }}\"" +
                         "ng-repeat=\"subscriber in getSubscribers()\"" +
                         "ng-class=\"subscriber.isFullscreen ? 'main-subscriber' : 'thumbnail-subscriber'\"" +
                         "ng-click=\"switchFullscreen(subscriber)\"" +
                         "ng-style=\"subscriber.getStyle()\">" +
                    "</div>" +
                "</div>" +
                "<div id=\"publisherDiv\"" +
                     "ng-show=\"showPublisherTile\"" +
                     "ng-class=\"{ 'fullscreen' : publisher.isFullscreen }\"" +
                     "class=\"publisher\">" +
                "</div>" +
                "<div id=\"publisherScreenDiv\"" +
                    "class=\"publisher\">" +
                "</div>" +
                "<div class=\"dropup\">" +
                    "<button class=\"btn btn-primary\" type=\"button\" id=\"dropdownMenu2\" data-toggle=\"dropdown\"" +
                            "aria-expanded=\"true\">" +
                        "Users ( {{ getStreamsAvailable().length + 1 }} ) <span class=\"caret\"></span>" +
                    "</button>" +
                    "<ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"dropdownMenu2\">" +
                        "<li>" +
                            "<a ng-click=\"showPublisherTile = !showPublisherTile\"" +
                               "ng-disabled=\"isSubscribing() && !isBeingSubscribedTo(stream)\">" +
                                "<span>You</span>" +

                                "<div class=\"pull-right\">" +
                                    "<i class=\"fa\" ng-class=\"showPublisherTile ? 'fa-compress' : 'fa-expand'\"></i>" +
                                "</div>" +
                            "</a>" +
                        "</li>" +
                        "<li ng-repeat=\"stream in getStreamsAvailable()\">" +
                            "<a ng-click=\"isBeingSubscribedTo(stream) ? forceDisconnect(stream) : subscribe(stream)\"" +
                               "ng-show=\"isModerator\">" +
                                "<span>{{ stream.name }}</span>" +

                                "<div class=\"pull-right\">" +
                                    "<i class=\"fa\" ng-class=\"isBeingSubscribedTo(stream) ? 'fa-stop' : 'fa-play'\"></i>" +
                                "</div>" +
                            "</a>" +
                        "</li>" +
                    "</ul>" +
                "</div>" +
            "</div>" +
        "");
    }

    angular.module('osdOpentok')
        .run(osdOpentok);
})();
