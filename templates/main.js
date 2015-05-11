(function () {

    'use strict';

    // @ngInject
    function osdOpentok($templateCache) {
        $templateCache.put("template/angular-osd-opentok.html", "" +
                "<div id=\"opentokDiv\" class=\"video-block\">" +
                    "<div class=\"subscriber-list\">" +
                        "<div id=\"subscriber-{{ $index + 1 }}\"" +
                             "ng-repeat=\"subscriber in subscribers\"" +
                             "ng-class=\"subscriber.isFullscreen ? 'main-subscriber' : 'thumbnail-subscriber'\"" +
                             "ng-click=\"switchFullscreen(subscriber)\"" +
                             "ng-style=\"getSubscriberStyle(subscriber)\">" +
                        "</div>" +
                    "</div>" +
                    "<div id=\"publisherDiv\"" +
                         "ng-show=\"showPublisherTile\"" +
                         "ng-class=\"{ 'fullscreen' : publisher.isFullscreen }\"" +
                         "class=\"publisher\">" +

                    "</div>" +
                    "<div class=\"dropup\">" +
                        "<button class=\"btn btn-primary\" type=\"button\" id=\"dropdownMenu2\" data-toggle=\"dropdown\"" +
                                "aria-expanded=\"true\">" +
                            "Users ( {{ streamsAvailable.length + 1 }} ) <span class=\"caret\"></span>" +
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
                            "<li ng-repeat=\"stream in streamsAvailable | streamsList:isModerator\">" +
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
