const memoize = require('./memoization').memoize;
const expect = require('chai').expect;
const assert = require('chai').assert;
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

        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
    });

    it('should return a result even if resolver is not defined', () => {
        let hitCount = 0;
        const returnValue = 5;
        const hitServer = (key) => {
            hitCount += 1;
            return returnValue;
        };

        // Function is not called yet
        expect(hitCount).to.equal(0);

        const memoized = memoize(hitServer, 1000);

        // Function is called on the first time
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
        expect(hitCount).to.equal(1);

        // Expect to get the memoized result if the memoized called before timeout.
        clock.tick(999);
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
        expect(hitCount).to.equal(1);
    });

    it('should retrieve result from memoized results if timeout is not exceeded (function should not be called)', () => {
        let hitCount = 0;
        const returnValue = 5;
        const hitServer = (key) => {
            hitCount += 1;
            return returnValue;
        };

        const memoized = memoize(hitServer, (key) => key, 1000);

        // Function is not called yet
        expect(hitCount).to.equal(0);

        // First function call
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
        expect(hitCount).to.equal(1);

        // Second function call. Below timeout time, function must be called one time only.
        clock.tick(999);
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
        expect(hitCount).to.equal(1);
    });

    it('should remove a memoized result if timeout is exceeded (function must be called again to get result)', () => {
        let hitCount = 0;
        const returnValue = 5;
        const hitServer = (key) => {
            hitCount += 1;
            return returnValue;
        };

        const memoized = memoize(hitServer, (key) => key, 1000);

        // Function is not called yet
        expect(hitCount).to.equal(0);

        // First function call
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
        expect(hitCount).to.equal(1);

        // Second function call. after timeout time, function must be called again.
        clock.tick(1000);
        expect(memoized('c544d3ae-a72d-4755-8ce5-d25db415b776')).to.equal(5);
        expect(hitCount).to.equal(2);
    });
});
