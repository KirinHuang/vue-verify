/*!
 * vue-verify 0.1.0
 * build in November 16th 2015, 17:20:46
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["vueVerify"] = factory();
	else
		root["vueVerify"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by peak on 15/11/14.
	 */
	exports.install = function (Vue) {
	    Vue.prototype.verify = function (rules, opts) {
	        var vm = this
	        var verifies = __webpack_require__(1)
	        var Verification = __webpack_require__(2)
	        opts = opts || {}
	        new Verification({
	            vm: vm,
	            rules: rules,
	            verifies: Vue.util.extend(vm.$options.verifies || {}, verifies),
	            namespace: opts.namespace,
	            debug: opts.debug
	        }).init()
	    }
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * Created by peak on 15/11/14.
	 */
	/**
	 * Fundamental validate functions,fork from offical vue-validation
	 */


	/**
	 * required
	 *
	 * This function validate whether the value has been filled out.
	 *
	 * @param val
	 * @return {Boolean}
	 */

	function required(val) {
	    if (Array.isArray(val)) {
	        return val.length > 0
	    } else if (typeof val === 'number') {
	        return true
	    } else if ((val !== null) && (typeof val === 'object')) {
	        return Object.keys(val).length > 0
	    } else {
	        return !val
	            ? false
	            : true
	    }
	}


	/**
	 * pattern
	 *
	 * This function validate whether the value matches the regex pattern
	 *
	 * @param val
	 * @param {String} pat
	 * @return {Boolean}
	 */

	function pattern(val, pat) {
	    if (typeof pat !== 'string') {
	        return false
	    }

	    var match = pat.match(new RegExp('^/(.*?)/([gimy]*)$'))
	    if (!match) {
	        return false
	    }

	    return new RegExp(match[1], match[2]).test(val)
	}


	/**
	 * minLength
	 *
	 * This function validate whether the minimum length of the string or array.
	 *
	 * @param {String} val
	 * @param {String|Number} min
	 * @return {Boolean}
	 */

	function minLength(val, min) {
	    return (typeof val === 'string' || Array.isArray(val)) &&
	        isInteger(min) &&
	        val.length >= parseInt(min, 10)
	}


	/**
	 * maxLength
	 *
	 * This function validate whether the maximum length of the string.
	 *
	 * @param {String} val
	 * @param {String|Number} max
	 * @return {Boolean}
	 */

	function maxLength(val, max) {
	    return (typeof val === 'string' || Array.isArray(val)) &&
	        isInteger(max, 10) &&
	        val.length <= parseInt(max, 10)
	}


	/**
	 * min
	 *
	 * This function validate whether the minimum value of the numberable value.
	 *
	 * @param {*} val
	 * @param {*} arg minimum
	 * @return {Boolean}
	 */

	function min(val, arg) {
	    return !isNaN(+(val)) && !isNaN(+(arg)) && (+(val) >= +(arg))
	}


	/**
	 * max
	 *
	 * This function validate whether the maximum value of the numberable value.
	 *
	 * @param {*} val
	 * @param {*} arg maximum
	 * @return {Boolean}
	 */

	function max(val, arg) {
	    return !isNaN(+(val)) && !isNaN(+(arg)) && (+(val) <= +(arg))
	}


	/**
	 * isInteger
	 *
	 * This function check whether the value of the string is integer.
	 *
	 * @param {String} val
	 * @return {Boolean}
	 * @private
	 */

	function isInteger(val) {
	    return /^(-?[1-9]\d*|0)$/.test(val)
	}


	/**
	 * export(s)
	 */
	module.exports = {
	    required: required,
	    pattern: pattern,
	    minLength: minLength,
	    maxLength: maxLength,
	    min: min,
	    max: max
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by peak on 15/11/15.
	 */
	"use strict"
	function Verification(opts) {
	    this.vm = opts.vm
	    this.rules = opts.rules
	    this.verifies = opts.verifies
	    this.namespace = opts.namespace || "verify"
	    this.debug = !!opts.debug
	}
	Verification.prototype.getVerifyModelPath = function (modelPath) {
	    return this.namespace + "." + modelPath
	}

	Verification.prototype.valid = function (modelPath, val) {
	    var self = this
	    var verifyModelPath = self.getVerifyModelPath(modelPath)
	    var ruleMap = self.rules[modelPath]
	    //required first
	    var requiredValid = self.verifies.required(val)

	    if (ruleMap.required) {
	        self.vm.$set(verifyModelPath + ".required", !requiredValid)
	        self.update$valid(modelPath)
	    }

	    //other verifications
	    Object.keys(ruleMap).forEach(function (rule) {
	        if ("required" === rule) {
	            return
	        }

	        if (!requiredValid) {
	            self.vm.$set(verifyModelPath + "." + rule, false)
	            self.update$valid(modelPath)
	            return
	        }

	        if (!self.verifies.hasOwnProperty(rule)) {
	            console.warn("unknown verify rule:" + rule + ",you can set it in verifies of Vue constructor options first")
	            return
	        }
	        var arg = ruleMap[rule]
	        var verifyFn = self.verifies[rule]
	        var result = verifyFn(val, arg)

	        if (typeof result === "boolean") {
	            self.vm.$set(verifyModelPath + "." + rule, !result)
	            self.update$valid(modelPath)
	            return
	        }
	        //promise
	        else if (result instanceof Function) {
	            var Promise = __webpack_require__(3)
	            new Promise(result).then(function () {
	                self.vm.$set(verifyModelPath + "." + rule, false)
	                self.update$valid(modelPath)
	            }, function (reason) {
	                self.vm.$set(verifyModelPath + "." + rule, true)
	                self.update$valid(modelPath)
	            })
	        } else {
	            throw "unsupported returned value of \"" + rule + "\" vrfity function"
	        }

	    })
	}


	Verification.prototype.update$valid = function (modelPath) {
	    var self = this
	    var verifyModelPath = self.getVerifyModelPath(modelPath)
	    var verifyModel = self.vm.$get(verifyModelPath)
	    var keyValid = true
	    for (var prop in verifyModel) {
	        //ignore $dirty and $valid
	        if ("$dirty" === prop || "$valid" === prop) {
	            continue
	        }
	        if (verifyModel[prop]) {
	            keyValid = false
	            break
	        }
	    }
	    self.vm.$set(verifyModelPath + ".$valid", keyValid)

	    //verify.$valid
	    var valid = true
	    var keys = Object.keys(self.rules)
	    for (var i = 0; i < keys.length; i++) {
	        if (!self.vm.$get(self.getVerifyModelPath(keys[i]) + ".$valid")) {
	            valid = false
	            break
	        }
	    }
	    self.vm.$set(self.namespace + ".$valid", valid)
	}

	Verification.prototype.init = function () {
	    var self = this
	    self.vm.$set(self.namespace + ".$dirty", false)
	    self.vm.$set(self.namespace + ".$valid", false)
	    Object.keys(self.rules).forEach(function (modelPath) {
	        self.vm.$set(self.getVerifyModelPath(modelPath) + ".$dirty", false)
	        self.valid(modelPath, self.vm.$get(modelPath))
	    })
	    self.watch()
	}

	Verification.prototype.watch = function () {
	    var self = this
	    Object.keys(self.rules).forEach(function (modelPath) {
	        self.vm.$watch(modelPath, function (newVal, oldVal) {
	            self.vm.$set(self.getVerifyModelPath(modelPath) + ".$dirty", true)
	            self.vm.$set(self.namespace + ".$dirty", true)
	            self.valid(modelPath, newVal)
	        })
	    })

	}

	module.exports = Verification


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, setImmediate, module) {(function () {
	  global = this

	  var queueId = 1
	  var queue = {}
	  var isRunningTask = false

	  if (!global.setImmediate)
	    global.addEventListener('message', function (e) {
	      if (e.source == global){
	        if (isRunningTask)
	          nextTick(queue[e.data])
	        else {
	          isRunningTask = true
	          try {
	            queue[e.data]()
	          } catch (e) {}

	          delete queue[e.data]
	          isRunningTask = false
	        }
	      }
	    })

	  function nextTick(fn) {
	    if (global.setImmediate) setImmediate(fn)
	    // if inside of web worker
	    else if (global.importScripts) setTimeout(fn)
	    else {
	      queueId++
	      queue[queueId] = fn
	      global.postMessage(queueId, '*')
	    }
	  }

	  Deferred.resolve = function (value) {
	    if (!(this._d == 1))
	      throw TypeError()

	    if (value instanceof Deferred)
	      return value

	    return new Deferred(function (resolve) {
	        resolve(value)
	    })
	  }

	  Deferred.reject = function (value) {
	    if (!(this._d == 1))
	      throw TypeError()

	    return new Deferred(function (resolve, reject) {
	        reject(value)
	    })
	  }

	  Deferred.all = function (arr) {
	    if (!(this._d == 1))
	      throw TypeError()

	    if (!(arr instanceof Array))
	      return Deferred.reject(TypeError())

	    var d = new Deferred()

	    function done(e, v) {
	      if (v)
	        return d.resolve(v)

	      if (e)
	        return d.reject(e)

	      var unresolved = arr.reduce(function (cnt, v) {
	        if (v && v.then)
	          return cnt + 1
	        return cnt
	      }, 0)

	      if(unresolved == 0)
	        d.resolve(arr)

	      arr.map(function (v, i) {
	        if (v && v.then)
	          v.then(function (r) {
	            arr[i] = r
	            done()
	            return r
	          }, done)
	      })
	    }

	    done()

	    return d
	  }

	  Deferred.race = function (arr) {
	    if (!(this._d == 1))
	      throw TypeError()

	    if (!(arr instanceof Array))
	      return Deferred.reject(TypeError())

	    if (arr.length == 0)
	      return new Deferred()

	    var d = new Deferred()

	    function done(e, v) {
	      if (v)
	        return d.resolve(v)

	      if (e)
	        return d.reject(e)

	      var unresolved = arr.reduce(function (cnt, v) {
	        if (v && v.then)
	          return cnt + 1
	        return cnt
	      }, 0)

	      if(unresolved == 0)
	        d.resolve(arr)

	      arr.map(function (v, i) {
	        if (v && v.then)
	          v.then(function (r) {
	            done(null, r)
	          }, done)
	      })
	    }

	    done()

	    return d
	  }

	  Deferred._d = 1


	  /**
	   * @constructor
	   */
	  function Deferred(resolver) {
	    'use strict'
	    if (typeof resolver != 'function' && resolver != undefined)
	      throw TypeError()

	    if (typeof this != 'object' || (this && this.then))
	      throw TypeError()

	    // states
	    // 0: pending
	    // 1: resolving
	    // 2: rejecting
	    // 3: resolved
	    // 4: rejected
	    var self = this,
	      state = 0,
	      val = 0,
	      next = [],
	      fn, er;

	    self['promise'] = self

	    self['resolve'] = function (v) {
	      fn = self.fn
	      er = self.er
	      if (!state) {
	        val = v
	        state = 1

	        nextTick(fire)
	      }
	      return self
	    }

	    self['reject'] = function (v) {
	      fn = self.fn
	      er = self.er
	      if (!state) {
	        val = v
	        state = 2

	        nextTick(fire)

	      }
	      return self
	    }

	    self['_d'] = 1

	    self['then'] = function (_fn, _er) {
	      if (!(this._d == 1))
	        throw TypeError()

	      var d = new Deferred()

	      d.fn = _fn
	      d.er = _er
	      if (state == 3) {
	        d.resolve(val)
	      }
	      else if (state == 4) {
	        d.reject(val)
	      }
	      else {
	        next.push(d)
	      }

	      return d
	    }

	    self['catch'] = function (_er) {
	      return self['then'](null, _er)
	    }

	    var finish = function (type) {
	      state = type || 4
	      next.map(function (p) {
	        state == 3 && p.resolve(val) || p.reject(val)
	      })
	    }

	    try {
	      if (typeof resolver == 'function')
	        resolver(self['resolve'], self['reject'])
	    } catch (e) {
	      self['reject'](e)
	    }

	    return self

	    // ref : reference to 'then' function
	    // cb, ec, cn : successCallback, failureCallback, notThennableCallback
	    function thennable (ref, cb, ec, cn) {
	      if ((typeof val == 'object' || typeof val == 'function') && typeof ref == 'function') {
	        try {

	          // cnt protects against abuse calls from spec checker
	          var cnt = 0
	          ref.call(val, function (v) {
	            if (cnt++) return
	            val = v
	            cb()
	          }, function (v) {
	            if (cnt++) return
	            val = v
	            ec()
	          })
	        } catch (e) {
	          val = e
	          ec()
	        }
	      } else {
	        cn()
	      }
	    };

	    function fire() {

	      // check if it's a thenable
	      var ref;
	      try {
	        ref = val && val.then
	      } catch (e) {
	        val = e
	        state = 2
	        return fire()
	      }

	      thennable(ref, function () {
	        state = 1
	        fire()
	      }, function () {
	        state = 2
	        fire()
	      }, function () {
	        try {
	          if (state == 1 && typeof fn == 'function') {
	            val = fn(val)
	          }

	          else if (state == 2 && typeof er == 'function') {
	            val = er(val)
	            state = 1
	          }
	        } catch (e) {
	          val = e
	          return finish()
	        }

	        if (val == self) {
	          val = TypeError()
	          finish()
	        } else thennable(ref, function () {
	            finish(3)
	          }, finish, function () {
	            finish(state == 1 && 3)
	          })

	      })
	    }


	  }

	  // Export our library object, either for node.js or as a globally scoped variable
	  if (true) {
	    module['exports'] = Deferred
	  } else {
	    global['Promise'] = global['Promise'] || Deferred
	  }
	})()

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(4).setImmediate, __webpack_require__(6)(module)))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(5).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4).setImmediate, __webpack_require__(4).clearImmediate))

/***/ },
/* 5 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ])
});
;