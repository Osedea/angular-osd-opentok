(function () {

    'use strict';

    // @ngInject
    function LiveConsultationCtrl($scope, SessionManager, DataManager, Publisher, OpentokConfig, OPENTOK) {
        $scope.config = OpentokConfig;
        $scope.publishingVideo = Publisher.publishingVideo;
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

        /* Returns true if the given stream is being subscribed to */
        $scope.isBeingSubscribedTo = DataManager.isBeingSubscribedTo;

        /* Sets the given subscriber to fullscreen */
        $scope.switchFullscreen = DataManager.switchFullscreen;

        /* Starts a screensharing stream */
        $scope.toggleScreenshare = SessionManager.toggleScreenshare;

        /* Returns true if the local user is a moderator */
        $scope.isModerator = SessionManager.isModerator;

        /* Force remote stream to stop publishing and disconnect */
        $scope.forceDisconnect = SessionManager.forceDisconnect;

        /* Returns true if screensharing is supported */
        $scope.screenshareIsSupported = function() {
            return SessionManager.screenshareAbility == OPENTOK.SCREENSHARE.SUPPORTED;
        };

        $scope.subscribe = function (stream) {
            /* Access must be granted to camera and video to start subscribing */
            if (!$scope.mediaAccessAllowed) {
                $scope.onAccessRequired();
                return;
            }

            /* Check to see if subscriber limit is reached */
            if (DataManager.subscribers.length >= (OpentokConfig.maxVideoSubscribers + OpentokConfig.maxAudioSubscribers)) {
                $scope.onSubscriberLimitReached();
                return;
            }

            SessionManager.subscribe(stream, true);
        };

        /* Unsubscribe from stream and signal remote user to unsubscribe from you */
        $scope.unsubscribe = function(stream) {
            SessionManager.unsubscribe(stream, true);
        };
        /* Set publisher's callback methods */
        Publisher.onAccessAllowed = function () {
            $scope.mediaAccessAllowed = true;
            $scope.onMediaAccessAllowed();
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
                onMediaAccessAllowed: '&'
            }
        };
    }

    angular.module('osdOpentok')
        .directive('liveConsultation', liveConsultation)
        .controller('LiveConsultationCtrl', LiveConsultationCtrl);
})();
