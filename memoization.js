exports.memoize = (func, resolver, timeout) => {
  /**
 * Creates a function that memoizes the result of func. If resolver is provided,
 * it determines the cache key for storing the result based on the arguments provided to the memorized function.
 * By default, the first argument provided to the memorized function is used as the map cache key. The memorized values
 * timeout after the timeout exceeds. The timeout is in defined in milliseconds.
 *
 * Example:
 * function addToTime(year, month, day) {
 *  return Date.now() + Date(year, month, day);
 * }
 *
 * const memoized = memoization.memoize(addToTime, (year, month, day) => year + month + day, 5000)
 *
 * // call the provided function cache the result and return the value
 * const result = memoized(1, 11, 26); // result = 1534252012350
 *
 * // because there was no timeout this call should return the memorized value from the first call
 * const secondResult = memoized(1, 11, 26); // secondResult = 1534252012350
 *
 * // after 5000 ms the value is not valid anymore and the original function should be called again
 * const thirdResult = memoized(1, 11, 26); // thirdResult = 1534252159271
 *
 * @param func      the function for which the return values should be cached
 * @param resolver  if provided gets called for each function call with the exact same set of parameters as the
 *                  original function, the resolver function should provide the memoization key.
 * @param timeout   timeout for cached values in milliseconds
 */

  // cache object to store the cached results
  let cache = {};

  if (timeout == null)
  {
    if (resolver == null)
    {
      // if both timeout and resolver are null or undefined, throw error
      throw new Error('memoize function should have at least two given arguments');
    } else
    {
      // set timeout as the second argument if there are only two arguments provided, resolver ignored
      timeout = resolver;
      resolver = null;
    }
  }

  // error handling on arguments (func, resolver, timeout) type
  if (typeof timeout != 'number')
  {
    throw new Error('timeout must be a number');
  }

  if (typeof func != 'function')
  {
    throw new Error('func must be a function');
  }

  if (resolver != null && typeof resolver != 'function')
  {
    throw new Error('resolver must be a function');
  }

  return (...args) => {

    // create cache key with resolver function if provided, otherwise stringify the args for the key
    let cacheKey = resolver == null ? JSON.stringify(args) : resolver(...args);

    // retrieving result from cache object
    let memoizedValue = cache[cacheKey];

    // will return the memoized value if it exists, otherwise generate new and save it in cache
    if (memoizedValue != null)
    {
      return memoizedValue;
    } else
    {
      const result = func(...args);
      cache[cacheKey] = result;

      // set timeout to delete cache key
      setTimeout(() => { delete cache[cacheKey] }, timeout);
      return result;
    }
  }
};