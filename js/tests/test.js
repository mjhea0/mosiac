(function() {

  'use strict';

  const expect = chai.expect;       // jshint ignore:line

  describe('foo', () => {
    it('should always be followed by bar', () => {
      expect(1 + 1).to.eql(2);
    });
  });

}());
