(function () {

    'use strict';

    // @ngInject
    function LiveConsultationCtrl($scope, SessionManager, DataManager, OpentokConfig, OPENTOK) {
        $scope.config = OpentokConfig;

        /* Streams that are in the session but not necessarily being subscribed to */
        $scope.getStreamsAvailable = DataManager.getStreamsAvailable;

        /* Streams that are in the session and being subscribed to */
        $scope.getSubscribers = DataManager.getSubscribers;

        /* Returns the camera publisher if it exists */
        $scope.isFullscreen = function() {
            var publishers = DataManager.getPublishers();
            return publishers.length ? publishers[0].isFullscreen : false;
        };

        /* Returns the screenshare publisher if it exists */
        $scope.getScreensharePublisher = function() {
            var publishers = DataManager.getPublishers();
            return publishers.length ? publishers[1] : null;
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
            if (!SessionManager.getMediaAccessAllowed()) {
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
                onAccessRequired: '&',
                onSubscriberLimitReached: '&',
            }
        };
    }

    angular.module('osdOpentok')
        .directive('liveConsultation', liveConsultation)
        .controller('LiveConsultationCtrl', LiveConsultationCtrl);
})();
