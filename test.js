const memoize = require('./memoization').memoize;
const expect = require('chai').expect;
const sinon = require('sinon');

// hint: use https://sinonjs.org/releases/v6.1.5/fake-timers/ for faking timeouts

describe('memoization', function () {
    var clock;

    beforeEach(function () {
        clock = sinon.useFakeTimers(new Date(2021, 1, 1));
    });

    afterEach(function () {
        clock.restore();
    });

    it('should memoize function result', () => {
        let returnValue = 5;
        const testFunction = (key) => returnValue;

        const memoized = memoize(testFunction, (key) => key, 1000);
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);

        returnValue = 10;

        // check if the returned value the same as the first function call
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
    });

    it('should memoize function result without resolver', () => {
        let returnValue = 5;
        const testFunction = (key) => returnValue;

        // define memoize wrapper without resolver
        const memoized = memoize(testFunction, 1000);
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);

        returnValue = 10;

        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
    });

    it('should retrieve memoized result if timeout is not exceeded (function should not be called)', () => {
        const returnValue = 5;
        const testFunction = (key) => returnValue;

        // add sinon spy decorator to check calls made on testFunction
        let hitCount = sinon.spy(testFunction);

        const memoized = memoize(hitCount, 1000);

        // function is not called yet
        expect(hitCount.callCount).to.equal(0);

        // function is called on the first time
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
        expect(hitCount.callCount).to.equal(1);

        // expect to get the memoized result if the memoized called before timeout
        clock.tick(999);
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
        expect(hitCount.callCount).to.equal(1);
    });

    it('should remove memoized result if timeout is exceeded (function must be called again to get result)', () => {
        const returnValue = 5;
        const testFunction = (key) => returnValue;

        let hitCount = sinon.spy(testFunction);

        const memoized = memoize(hitCount, 1000);

        expect(hitCount.callCount).to.equal(0);

        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
        expect(hitCount.callCount).to.equal(1);

        // expect to call testFunction again after timeout 
        clock.tick(1000);
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
        expect(hitCount.callCount).to.equal(2);
    });
});
