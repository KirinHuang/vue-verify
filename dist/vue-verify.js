/*!
 * vue-verify 0.6.0
 * build in April 26th 2017, 15:39:49
 * https://github.com/PeakTai/vue-verify
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
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by peak on 15/11/14.
	 */
	exports.install = function (Vue, options) {

	    options = options || {}
	    var buildInMethods = Vue.util.extend(__webpack_require__(1), processMethod(options.methods))
	    var namespace = options.namespace || "verify"
	    var util = __webpack_require__(2)

	    Vue.mixin({
	        data: function () {
	            var obj = {}
	            obj[namespace] = {}
	            return obj
	        }
	    })

	    var vm = null
	    Vue.prototype.$verify = function (rules) {
	        vm = this
	        var verifier = vm.$options.verifier || {}
	        var methods = Vue.util.extend(processMethod(verifier.methods), buildInMethods)
	        var verifyObj = vm[namespace]

	        Vue.set(verifyObj, "$dirty", false)
	        Vue.set(verifyObj, "$valid", false)
	        Vue.set(verifyObj, "$rules", rules)

	        Object.keys(rules).forEach(function (modelPath) {
	            var model = getVerifyModel(modelPath)
	            Vue.set(model, "$dirty", false)
	            verify(modelPath, util.getModel(vm, modelPath))
	        })

	        Object.keys(rules).forEach(function (modelPath) {
	            vm.$watch(modelPath, function (val) {
	                var model = getVerifyModel(modelPath)
	                Vue.set(model, "$dirty", true)
	                Vue.set(verifyObj, "$dirty", true)
	                verify(modelPath, val)
	            })
	        })

	        function getVerifyModel(modelPath) {
	            var arr = modelPath.split(".")
	            var model = verifyObj[arr[0]]
	            if (!model) {
	                model = {}
	                Vue.set(verifyObj, arr[0], {})
	            }
	            for (var i = 1; i < arr.length; i++) {
	                if (!arr[i]) {
	                    continue
	                }
	                var m = model[arr[i]]
	                if (!m) {
	                    m = {}
	                    Vue.set(model, arr[i], m)
	                }
	                model = m
	            }
	            return model
	        }

	        function verify(modelPath, val) {
	            var ruleMap = rules[modelPath]

	            if (!ruleMap.required && !methods.required.fn(val)) {
	                //if model not required and value is blank,make it valid
	                Object.keys(ruleMap).forEach(function (rule) {
	                    if (methods.hasOwnProperty(rule)) {
	                        update(modelPath, rule, false)
	                    }
	                })
	                return
	            }

	            var keys = Object.keys(ruleMap).sort(function (a, b) {
	                var m1 = methods[a]
	                var m2 = methods[b]
	                var p1 = m1 ? m1.priority : 100
	                var p2 = m2 ? m2.priority : 100
	                return p1 - p2
	            })

	            stepVerify(modelPath, ruleMap, keys, 0, val)
	        }

	        function stepVerify(modelPath, ruleMap, keys, index, val) {
	            if (index >= keys.length) {
	                return
	            }
	            var rule = keys[index]
	            if (!rule) {
	                return
	            }
	            if (!methods.hasOwnProperty(rule)) {
	                console.warn("can not find verify method of rule \"" + rule + "\"")
	                return
	            }
	            var arg = ruleMap[rule]
	            var verifyFn = methods[rule].fn
	            var result = verifyFn.call(vm, val, arg)

	            if (typeof result === "boolean") {
	                update(modelPath, rule, !result)
	                if (result) {
	                    stepVerify(modelPath, ruleMap, keys, index + 1, val)
	                }
	                return
	            }
	            //promise
	            else if (result instanceof Function) {
	                var Promise = __webpack_require__(3)
	                new Promise(result).then(function () {
	                    update(modelPath, rule, false)
	                    stepVerify(modelPath, ruleMap, keys, index + 1, val)
	                }, function (reason) {
	                    update(modelPath, rule, true)
	                })
	            } else {
	                throw "unsupported returned value of the verify method \"" + rule + "\""
	            }

	        }

	        function update(modelPath, rule, inValid) {
	            var verifyModel = getVerifyModel(modelPath)
	            Vue.set(verifyModel, rule, inValid)

	            var modelValid = true
	            Object.keys(verifyModel).forEach(function (prop) {
	                //ignore $dirty and $valid
	                if ("$dirty" === prop || "$valid" === prop) {
	                    return
	                }
	                //keep only one rule has invalid flag
	                if (!modelValid) {
	                    Vue.set(verifyModel, prop, false)
	                } else if (verifyModel[prop]) {
	                    modelValid = false
	                }
	            })

	            Vue.set(verifyModel, "$valid", modelValid)

	            //verify.$valid
	            var valid = true
	            var keys = Object.keys(rules)
	            for (var i = 0; i < keys.length; i++) {
	                var model = getVerifyModel(keys[i])
	                if (!model.$valid) {
	                    valid = false
	                    break
	                }
	            }
	            Vue.set(verifyObj, "$valid", valid)
	        }
	    }

	    Vue.prototype.$verifyReset = function () {
	        var verify = this[namespace]

	        var rules = verify.$rules
	        if (rules) {
	            vm.$verify(rules)
	        }
	    }

	    function processMethod(methods) {
	        if (!methods) {
	            return {}
	        }

	        function process(method) {
	            if (!method) {
	                return null
	            }
	            if (typeof method === 'function') {
	                return {priority: 100, fn: method}
	            }

	            // Vue.util.isObject is vue internal medthod, you should't use
	            if (typeof method !== 'object') {
	                return null
	            }
	            if (typeof method.fn != "function") {
	                return null
	            }
	            var priority = method.priority
	            if (!priority) {
	                return {priority: 100, fn: method.fn}
	            }
	            if (typeof priority != 'number' || priority < 1 || priority > 100) {
	                return null
	            }
	            return {priority: priority, fn: method.fn}

	        }

	        var result = {}
	        Object.keys(methods).forEach(function (key) {
	            var value = methods[key]
	            var method = process(value)
	            if (!method) {
	                console.log("can not accept method \"" + key + "\"", value)
	                throw "can not accept method \"" + key + "\""
	            } else {
	                result[key] = method
	            }
	        })
	        return result
	    }

	}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

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
	 * @param {RegExp} pat
	 * @return {Boolean}
	 */

	function pattern(val, pat) {
	    if (!(pat instanceof RegExp)) {
	        return false
	    }

	    return pat.test(val)
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

	function equalTo(val, modelPath) {
	    var util = __webpack_require__(2)
	    var model = util.getModel(this, modelPath)
	    return val === model
	}


	/**
	 * export(s)
	 */
	module.exports = {
	    required: {
	        fn: required,
	        priority: 1
	    },
	    minLength: {
	        fn: minLength,
	        priority: 2
	    },
	    maxLength: {
	        fn: maxLength,
	        priority: 3
	    },
	    min: {
	        fn: min,
	        priority: 4
	    },
	    max: {
	        fn: max,
	        priority: 5
	    },
	    pattern: {
	        fn: pattern,
	        priority: 6
	    },
	    equalTo: {
	        fn: equalTo,
	        priority: 7
	    }
	}


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	/**
	 * Created by peak on 2016/10/14.
	 */
	exports.getModel = function (vm, path) {
	    var arr = path.split(".")
	    var model = vm[arr[0]]
	    if (!model) {
	        return null
	    }
	    for (var i = 1; i < arr.length; i++) {
	        if (!arr[i]) {
	            continue
	        }
	        var m = model[arr[i]]
	        if (!m) {
	            return null
	        }
	        model = m
	    }
	    return model
	}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

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
	      // Promises can be rejected with other promises, which should pass through
	      if (state == 2) {
	        return cn()
	      }
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

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(4).setImmediate, __webpack_require__(7)(module)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var apply = Function.prototype.apply;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};

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

	// setimmediate attaches itself to the global object
	__webpack_require__(5);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4).setImmediate, __webpack_require__(4).clearImmediate))

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";

	    if (global.setImmediate) {
	        return;
	    }

	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;

	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }

	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }

	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }

	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }

	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }

	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }

	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };

	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }

	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }

	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };

	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }

	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }

	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }

	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();

	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();

	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();

	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();

	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }

	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(6)))

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
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
	    var timeout = runTimeout(cleanUpNextTick);
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
	    runClearTimeout(timeout);
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
	        runTimeout(drainQueue);
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


/***/ }),
/* 7 */
/***/ (function(module, exports) {

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


/***/ })
/******/ ])
});
;