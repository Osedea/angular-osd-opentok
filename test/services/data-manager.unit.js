describe('LiveConsultationCtrl', function () {
    var DataManager, Publisher, subscribers;

    beforeEach(module('osdOpentok'));


    beforeEach(inject(function (_DataManager_) {
        DataManager = _DataManager_;
    }));

    beforeEach(function () {
        subscribers = [
            {
                id: 1,
                session: {
                    stream:  {
                        id: 1,
                        connection: {
                            id: 1,
                        }
                    }
                },
            },
            {
                id: 2,
                session: {
                    stream:  {
                        id: 2,
                        connection: {
                            id: 2,
                        }
                    }
                },
            },
            {
                id: 3,
                session: {
                    stream:  {
                        id: 3,
                        connection: {
                            id: 3,
                        }
                    }
                },
            },
            {
                id: 4,
                session: {
                    stream:  {
                        id: 4,
                        connection: {
                            id: 4,
                        }
                    }
                },
            }
        ];

        DataManager.streamsAvailable = [
            subscribers[0].session.stream,
            subscribers[1].session.stream,
            subscribers[2].session.stream
        ];
    });

    it('can be instantiated', function () {
        expect(DataManager).not.toBe(null);
    });

    describe('removeSubscriberByStream', function() {

      beforeEach(function() {
        DataManager.subscribers = [subscribers[0]];
      });

      it('should remove the correct subscriber if it exists', function() {
        DataManager.removeSubscriberByStream(subscribers[0].session.stream);

        expect(DataManager.subscribers.length).toBe(0);
      });

      it('should not remove a subscriber if the one passed is not being subscribed to', function() {
        DataManager.removeSubscriberByStream(subscribers[1].session.stream);

        expect(DataManager.subscribers.length).toBe(1);
      });
    });

    describe('getStreamByConnection', function() {
      beforeEach(function() {
        DataManager.subscribers = [subscribers[0]];
      });

      it('should return the correct stream when given a valid connection', function() {
        var stream = subscribers[0].session.stream;
        var connection = subscribers[0].session.stream.connection;

        var responseStream = DataManager.getStreamByConnection(connection);

        expect(responseStream).toEqual(stream);
      });

      it('should return the correct stream even if we are not subscribing to it', function() {
        var stream = subscribers[1].session.stream;
        var connection = subscribers[1].session.stream.connection;

        var responseStream = DataManager.getStreamByConnection(connection);

        expect(responseStream).toEqual(stream);
      });

      it('should return null if the connection is not part of an available stream', function() {
        var stream = subscribers[3].session.stream;
        var connection = subscribers[3].session.stream.connection;

        var responseStream = DataManager.getStreamByConnection(connection);

        expect(responseStream).toEqual(null);
      });

    });

    describe('switchFullscreen', function() {
      beforeEach(function() {
        DataManager.subscribers = [subscribers[0], subscribers[1]];
      });
    });

});
