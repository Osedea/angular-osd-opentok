(function () {

    'use strict';

    // @ngInject
    function LiveConsultationCtrl($scope, SessionManager, DataManager, Publisher, OpentokConfig) {
        $scope.config = OpentokConfig;
        $scope.publishingVideo = Publisher.publishingVideo;
        $scope.isModerator = true;
        $scope.showPublisherTile = true;
        $scope.publisher = Publisher;

        /* Streams that are in the session but not necessarily being subscribed to */
        $scope.getStreamsAvailable = function () {
            return DataManager.streamsAvailable;
        };

        /* Streams that are in the session and being subscribed to */
        $scope.getSubscribers = function () {
            return DataManager.subscribers;
        };

        $scope.screenshare = function () {
            OT.checkScreenSharingCapability(function (response) {
                if (!response.supported || response.extensionRegistered === false) {
                    alert('This browser does not support screen sharing.');
                } else if (response.extensionInstalled === false) {
                    alert('Please install the screen sharing extension and load this page over HTTPS.');
                } else {
                    SessionManager.publish();
                }
            });
        };

        $scope.subscribe = function (stream) {
            /* Access must be granted to camera and video to start subscribing */
            if (!$scope.mediaAccessAllowed) {
                $scope.onAccessRequired();
                return;
            }

            /* Only Moderators can subscribe to streams */
            if (!$scope.isModerator) {
                return;
            }

            /* Check to see if subscriber limit is reached */
            if (DataManager.subscribers.length >= OpentokConfig.maxSubscribers) {
                $scope.onSubscriberLimitReached();
                return;
            }

            SessionManager.subscribe(stream, true);
        };

        $scope.switchFullscreen = function (subscriber) {
            DataManager.switchFullscreen(subscriber);
        };

        $scope.forceDisconnect = function (stream) {
            SessionManager.unsubscribe(stream, true);
            DataManager.removeSubscriberByStream(stream);
        };

        $scope.isBeingSubscribedTo = function (stream) {
            return DataManager.subscribers.some(function (s) {
                return s.session && s.session.stream && s.session.stream.id == stream.id;
            });
        };

        /* Set publisher's callback methods */
        Publisher.onAccessAllowed = function () {
            $scope.mediaAccessAllowed = true;
            $scope.$apply();
        };

        Publisher.onAccessDenied = function () {
            $scope.mediaAccessAllowed = false;
            $scope.onAccessDenied();
            $scope.$apply();
        };
    }

    // @ngInject
    function liveConsultation() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/angular-osd-opentok.html',
            controller: 'LiveConsultationCtrl',
            controllerAs: 'liveCtrl',
            scope: {
                onAccessDenied: '&',
                onAccessRequired: '&',
                onSubscriberLimitReached: '&',
                mediaAccessAllowed: '='
            }
        };
    }

    angular.module('osdOpentok')
        .directive('liveConsultation', liveConsultation)
        .controller('LiveConsultationCtrl', LiveConsultationCtrl);
})();
