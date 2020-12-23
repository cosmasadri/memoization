const memoize = require('./memoization').memoize;
const expect = require('chai').expect;
const sinon = require('sinon');

// hint: use https://sinonjs.org/releases/v6.1.5/fake-timers/ for faking timeouts

describe('memoization', () => {

    describe('functionality', () => {
        var clock;

        beforeEach(() => {
            clock = sinon.useFakeTimers();
        });

        afterEach(() => {
            clock.restore();
        });

        it('should memoize function result', () => {
            let returnValue = 5;
            const testFunction = (key) => returnValue;

            const memoized = memoize(testFunction, (key) => key, 1000);

            const testArg = 'c544d3ae-a72d-4755-8ce5-d25db415b776';

            expect(memoized(testArg)).to.equal(5);

            returnValue = 10;

            // check if the returned value the same as the first function call
            expect(memoized(testArg)).to.equal(5);
        });

        it('should memoize function result without resolver', () => {
            let returnValue = 5;
            const testFunction = (key) => returnValue;

            // define memoize wrapper without resolver
            const memoized = memoize(testFunction, 1000);

            const testArg = 'c544d3ae-a72d-4755-8ce5-d25db415b776';

            expect(memoized(testArg)).to.equal(5);

            returnValue = 10;

            expect(memoized(testArg)).to.equal(5);
        });

        it('should memoize function result with defferent argument', () => {
            let returnValue = 5;
            const testFunction = (key) => returnValue;

            // add sinon spy decorator to check calls made on testFunction
            let testFunctionSpy = sinon.spy(testFunction);

            const memoized = memoize(testFunctionSpy, 1000);

            // function is not called yet
            expect(testFunctionSpy.callCount).to.equal(0);

            const testArg1 = 'c544d3ae-a72d-4755-8ce5-d25db415b776';

            expect(memoized(testArg1)).to.equal(5);
            expect(testFunctionSpy.callCount).to.equal(1);

            returnValue = 10;

            expect(memoized(testArg1)).to.equal(5);
            expect(testFunctionSpy.callCount).to.equal(1);

            const testArg2 = 'c544d3ae-a72d-4755-8ce5';

            // expect to call the function again, when different argument is given
            expect(memoized(testArg2)).to.equal(10);
            expect(testFunctionSpy.callCount).to.equal(2);
        });

        it('should retrieve memoized result if timeout is not exceeded (function should not be called)', () => {
            const returnValue = 5;
            const testFunction = (key) => returnValue;

            // add sinon spy decorator to check calls made on testFunction
            let testFunctionSpy = sinon.spy(testFunction);

            const memoized = memoize(testFunctionSpy, 1000);

            expect(testFunctionSpy.callCount).to.equal(0);

            const testArg = 'c544d3ae-a72d-4755-8ce5-d25db415b776';

            // function is called on the first time
            expect(memoized(testArg)).to.equal(5);
            expect(testFunctionSpy.callCount).to.equal(1);

            // expect to get the memoized result if the memoized called before timeout
            clock.tick(999);
            expect(memoized(testArg)).to.equal(5);
            expect(testFunctionSpy.callCount).to.equal(1);
        });

        it('should remove memoized result if timeout is exceeded (function must be called again to get result)', () => {
            const returnValue = 5;
            const testFunction = (key) => returnValue;

            let testFunctionSpy = sinon.spy(testFunction);

            const memoized = memoize(testFunctionSpy, 1000);

            expect(testFunctionSpy.callCount).to.equal(0);

            const testArg = 'c544d3ae-a72d-4755-8ce5-d25db415b776';

            expect(memoized(testArg)).to.equal(5);
            expect(testFunctionSpy.callCount).to.equal(1);

            // expect to call testFunction again after timeout 
            clock.tick(1000);
            expect(memoized(testArg)).to.equal(5);
            expect(testFunctionSpy.callCount).to.equal(2);
        });
    });

    describe('errors', () => {
        it('should throw error if given arguments are less than two', () => {

            // call memoize without any argument
            expect(function () { memoize() }).to.throw('memoize function should have at least two given arguments');

            const returnValue = 5;
            const testFunction = (key) => returnValue;

            // call memoize only with one argument
            expect(function () { memoize(testFunction) }).to.throw('memoize function should have at least two given arguments');
        });

        it('should throw error if given timeout argument is not a number', () => {
            const returnValue = 5;
            const testFunction = (key) => returnValue;

            // call memoize with timeout argument as string
            expect(function () { memoize(testFunction, (key) => key, 'test') }).to.throw('timeout must be a number');

            // call memoize without timeout argument
            expect(function () { memoize(testFunction, (key) => key) }).to.throw('timeout must be a number');
        });

        it('should throw error if given func argument is not a function', () => {
            const returnValue = 5;
            const testFunction = (key) => returnValue;

            // call memoize func argument as string
            expect(function () { memoize('test', (key) => key, 1000) }).to.throw('func must be a function');
        });

        it('should throw error if given resolver argument is not a function', () => {
            const returnValue = 5;
            const testFunction = (key) => returnValue;

            // call memoize resolver argument as string
            expect(function () { memoize(testFunction, 'test', 1000) }).to.throw('resolver must be a function');
        });
    });
});
