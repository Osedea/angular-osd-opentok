describe('osdOpentok', function() {
    var OpentokConfig;

    beforeEach(module('osdOpentok'));

    beforeEach(inject(function(_OpentokConfig_) {
        OpentokConfig = _OpentokConfig_;
    }));

    it('should have access to OpentokConfig', function() {
        expect(OpentokConfig).not.toBe(null);
    });
});
