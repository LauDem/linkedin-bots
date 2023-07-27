/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/chrome-promise/chrome-promise.js":
/*!*******************************************************!*\
  !*** ./node_modules/chrome-promise/chrome-promise.js ***!
  \*******************************************************/
/***/ (function(module) {

/*!
 * chrome-promise
 * https://github.com/tfoxy/chrome-promise
 *
 * Copyright 2015 Tomás Fox
 * Released under the MIT license
 */

(function(root, factory) {
  if (true) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(this || root);
  } else { var name, script; }
}(typeof self !== 'undefined' ? self : this, function(root) {
  'use strict';
  var slice = Array.prototype.slice,
      hasOwnProperty = Object.prototype.hasOwnProperty;

  // Temporary hacky fix to make TypeScript `import` work
  ChromePromise.default = ChromePromise;

  return ChromePromise;

  ////////////////

  function ChromePromise(options) {
    options = options || {};
    var chrome = options.chrome || root.chrome;
    var Promise = options.Promise || root.Promise;
    var runtime = chrome.runtime;
    var self = this;
    if (!self) throw new Error('ChromePromise must be called with new keyword');

    fillProperties(chrome, self);

    if (chrome.permissions) {
      chrome.permissions.onAdded.addListener(permissionsAddedListener);
    }

    ////////////////

    function setPromiseFunction(fn, thisArg) {

      return function() {
        var args = slice.call(arguments);

        return new Promise(function(resolve, reject) {
          args.push(callback);

          fn.apply(thisArg, args);

          function callback() {
            var err = runtime.lastError;
            var results = slice.call(arguments);
            if (err) {
              reject(err);
            } else {
              switch (results.length) {
                case 0:
                  resolve();
                  break;
                case 1:
                  resolve(results[0]);
                  break;
                default:
                  resolve(results);
              }
            }
          }
        });

      };

    }

    function fillProperties(source, target) {
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          var val;
          // Sometime around Chrome v71, certain deprecated methods on the
          // extension APIs started using proxies to throw an error if the
          // deprecated methods were accessed, regardless of whether they
          // were invoked or not.  That would cause this code to throw, even
          // if no one was actually invoking that method.
          try {
            val = source[key];
          } catch(err) {
           continue;
          }
          var type = typeof val;

          if (type === 'object' && !(val instanceof ChromePromise)) {
            target[key] = {};
            fillProperties(val, target[key]);
          } else if (type === 'function') {
            target[key] = setPromiseFunction(val, source);
          } else {
            target[key] = val;
          }
        }
      }
    }

    function permissionsAddedListener(perms) {
      if (perms.permissions && perms.permissions.length) {
        var approvedPerms = {};
        perms.permissions.forEach(function(permission) {
          var api = /^[^.]+/.exec(permission);
          if (api in chrome) {
            approvedPerms[api] = chrome[api];
          }
        });
        fillProperties(approvedPerms, self);
      }
    }
  }
}));


/***/ }),

/***/ "./node_modules/chrome-promise/index.js":
/*!**********************************************!*\
  !*** ./node_modules/chrome-promise/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var ChromePromise = __webpack_require__(/*! ./chrome-promise */ "./node_modules/chrome-promise/chrome-promise.js");

var chromep = new ChromePromise();
// Temporary hacky fix to make TypeScript `import` work
chromep.default = chromep;

module.exports = chromep;


/***/ }),

/***/ "./node_modules/loglevel/lib/loglevel.js":
/*!***********************************************!*\
  !*** ./node_modules/loglevel/lib/loglevel.js ***!
  \***********************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";
    if (true) {
        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
		__WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function () {
    "use strict";

    // Slightly dubious tricks to cut down minimized file size
    var noop = function() {};
    var undefinedType = "undefined";
    var isIE = (typeof window !== undefinedType) && (typeof window.navigator !== undefinedType) && (
        /Trident\/|MSIE /.test(window.navigator.userAgent)
    );

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    // Cross-browser bind equivalent that works at least back to IE6
    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // Trace() doesn't print the message in IE, so for that case we need to wrap it
    function traceForIE() {
        if (console.log) {
            if (console.log.apply) {
                console.log.apply(console, arguments);
            } else {
                // In old IE, native console methods themselves don't have apply().
                Function.prototype.apply.apply(console.log, [console, arguments]);
            }
        }
        if (console.trace) console.trace();
    }

    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    function realMethod(methodName) {
        if (methodName === 'debug') {
            methodName = 'log';
        }

        if (typeof console === undefinedType) {
            return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
        } else if (methodName === 'trace' && isIE) {
            return traceForIE;
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    // These private functions always need `this` to be set properly

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }

        // Define log.log as an alias for log.debug
        this.log = this.debug;
    }

    // In old IE versions, the console isn't present until you first open it.
    // We build realMethod() replacements here that regenerate logging methods
    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    // By default, we use closely bound real methods wherever possible, and
    // otherwise we wait for a console to appear, and then try again.
    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      defaultLevel = defaultLevel == null ? "WARN" : defaultLevel;

      var storageKey = "loglevel";
      if (typeof name === "string") {
        storageKey += ":" + name;
      } else if (typeof name === "symbol") {
        storageKey = undefined;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          if (typeof window === undefinedType || !storageKey) return;

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          if (typeof window === undefinedType || !storageKey) return;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          // Fallback to cookies if local storage gives us nothing
          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location !== -1) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      function clearPersistedLevel() {
          if (typeof window === undefinedType || !storageKey) return;

          // Use localStorage if available
          try {
              window.localStorage.removeItem(storageKey);
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          } catch (ignore) {}
      }

      /*
       *
       * Public logger API - see https://github.com/pimterry/loglevel for details
       *
       */

      self.name = name;

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          defaultLevel = level;
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.resetLevel = function () {
          self.setLevel(defaultLevel, false);
          clearPersistedLevel();
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Top-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if ((typeof name !== "symbol" && typeof name !== "string") || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
    };

    // ES6 default export, for compatibility
    defaultLogger['default'] = defaultLogger;

    return defaultLogger;
}));


/***/ }),

/***/ "./src/utilities/common_utilities.js":
/*!*******************************************!*\
  !*** ./src/utilities/common_utilities.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getFetchParameters": () => (/* binding */ getFetchParameters),
/* harmony export */   "getJSON": () => (/* binding */ getJSON),
/* harmony export */   "logger": () => (/* binding */ logger)
/* harmony export */ });
/* harmony import */ var loglevel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! loglevel */ "./node_modules/loglevel/lib/loglevel.js");
/* harmony import */ var loglevel__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(loglevel__WEBPACK_IMPORTED_MODULE_0__);
/*************************************************************************
*
*  [2010] - [2023] KnowBe4 Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of KnowBe4 Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to KnowBe4 Incorporated
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from KnowBe4 Incorporated.
*/

// Global instance of the logger module, defaulting to ERROR-mode logging.
let logger = loglevel__WEBPACK_IMPORTED_MODULE_0___default().noConflict()
logger.setDefaultLevel('ERROR')

/**
 * Utility function to report a campaign ID to KMSAT. 
 *
 * @param {string} method HTTP method to use (POST, GET, PUT, others)
 * @param {Array.<Object>} headerSet an array of objects to be used as HTTP headers.
 * 
 * @return {Object} requestParameters an object that is usable as input to the HTTP-fetch call.
 */
 function getFetchParameters(method, headerSet = null) {
  let requestParameters = {
    method: method,
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }
  if (headerSet) {
    requestParameters.headers = headerSet
  }
  return requestParameters
}

/**
 * Helper method for Promisified ajax call.
 * @param {string} method HTTP VERB
 * @param {string} url request endpoint
 * @param {Object} data params to set
 * @param {Array.<object>} additionalHeaderSet additional headers for use with the HTTP request.
 * 
 * @return {Object} json object containing the response.
 */
function getJSON(method, url, data, additionalHeaderSet = null) {
  let headerSet = { ...additionalHeaderSet, 'Content-Type': 'application/json' }
  let fetchParams = getFetchParameters(method, headerSet)
  let finalURL = url
  // We need to process the data and use it appropriately depending on the method. 
  if (data) {
    // For non-GET requests, we use the JSON format of the data.
    if (method.toLowerCase() !== 'get') {
      fetchParams.body = JSON.stringify(data) // body data type must match "Content-Type" header
    } else {
      // For GET-requests, we add it as part of the url search query.
      finalURL = url + '?' + new URLSearchParams(data)
    }
  }
  // Next we execute the fetch request, and wait for its response.
  return fetch(finalURL, fetchParams).then((res) => {
    return res.json()
  }).then((json) => {
    // The upper function calls for a json response. If the response is a string, we parse it.
    if (typeof json === 'string') {
      return JSON.parse(json)
    }
    return json
  })
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!******************************************!*\
  !*** ./src/utilities/gmail_utilities.js ***!
  \******************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getAttachments": () => (/* binding */ getAttachments),
/* harmony export */   "getEmailData": () => (/* binding */ getEmailData),
/* harmony export */   "getLocalStorageItem": () => (/* binding */ getLocalStorageItem),
/* harmony export */   "getManagedStorageItem": () => (/* binding */ getManagedStorageItem),
/* harmony export */   "getMessageBody": () => (/* binding */ getMessageBody),
/* harmony export */   "getMessageDataFromThread": () => (/* binding */ getMessageDataFromThread),
/* harmony export */   "getMessageDetails": () => (/* binding */ getMessageDetails),
/* harmony export */   "getUserInfo": () => (/* binding */ getUserInfo),
/* harmony export */   "gmailAPIRequest": () => (/* binding */ gmailAPIRequest),
/* harmony export */   "moveThreadToTrash": () => (/* binding */ moveThreadToTrash),
/* harmony export */   "sendReportEmailToRecipients": () => (/* binding */ sendReportEmailToRecipients)
/* harmony export */ });
/* harmony import */ var _common_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common_utilities */ "./src/utilities/common_utilities.js");
/* harmony import */ var chrome_promise__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! chrome-promise */ "./node_modules/chrome-promise/index.js");
/* harmony import */ var chrome_promise__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(chrome_promise__WEBPACK_IMPORTED_MODULE_1__);
/*************************************************************************
*
*  [2010] - [2023] KnowBe4 Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of KnowBe4 Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to KnowBe4 Incorporated
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from KnowBe4 Incorporated.
*/




// Global constants (urls) for use with the GMAIL API requests.
const GMAIL_API_THREADS = 'https://www.googleapis.com/gmail/v1/users/me/threads/'
const GMAIL_API_MESSAGES = 'https://www.googleapis.com/gmail/v1/users/me/messages/'
const GMAIL_API_USERINFO = 'https://www.googleapis.com/oauth2/v1/userinfo?access_token='
const GMAIL_API_ATTACHMENTS = '/attachments/'

/**
* Get All email headers from a message
* @param {number} messageID the message ID which we want to get the headers of.
* @returns https://developers.google.com/gmail/api/v1/reference/users/messages#resource
*/
function getAllEmailHeaders(messageID) {
  return chrome_promise__WEBPACK_IMPORTED_MODULE_1___default().identity.getAuthToken({ interactive: false }).then(function (token) {
    return gmailAPIRequest(
      'GET',
      GMAIL_API_MESSAGES + messageID,
      token,
      { format: 'metadata' }
    )
  })
}

/**
* Get raw message data
* https://developers.google.com/gmail/api/v1/reference/users/messages#resource
* @param id of the message in which to get the raw formatted data for
* @returns https://developers.google.com/gmail/api/v1/reference/users/messages#resource
*/
function getRawMessage(id) {
  return chrome_promise__WEBPACK_IMPORTED_MODULE_1___default().identity.getAuthToken({ interactive: false }).then(function (token) {
    return gmailAPIRequest(
      'GET',
      GMAIL_API_MESSAGES + id,
      token,
      { format: 'raw' }
    )
  })
}

/**
 * Helper method to execute GMAIL API (requests) without user provided data.
 * @param {string} method HTTP VERB
 * @param {string} url request endpoint
 * @param {string} token authorization key for transaction with GMail Servers
 * 
 * @return {Object} a json object representing the result of the GMAIL API request.
 */
function gmailAPIRequestSimple(method, url, token) {
  let finalURL = url + token
  return (0,_common_utilities__WEBPACK_IMPORTED_MODULE_0__.getJSON)(
    method,
    finalURL,
    null,
    { 'Authorization': 'Bearer ' + token }
  )
}

/**
 * Helper method to execute GMAIL API (requests) with user provided data.
 * @param {string} method HTTP VERB
 * @param {string} url request endpoint
 * @param {string} token authorization key for transaction with GMail Servers
 * @param {Object} data payload to be sent to the remote GMAIL server.
 * 
 * @return {Object} a json object representing the result of the GMAIL API request.
 */
function gmailAPIRequest(method, url, token, data) {
  return (0,_common_utilities__WEBPACK_IMPORTED_MODULE_0__.getJSON)(
    method,
    url,
    data,
    { 'Authorization': 'Bearer ' + token }
  )
}

/**
* https://developers.google.com/gmail/api/v1/reference/users/threads/trash
* @param id of the thread to move to trash i.e. apply trash label
* @returns response from gmail api in the form of a promise
*/
function moveThreadToTrash(id) {
  return chrome_promise__WEBPACK_IMPORTED_MODULE_1___default().identity.getAuthToken({ interactive: false }).then(function (token) {
    return gmailAPIRequest(
      'POST',
      GMAIL_API_THREADS + id + '/trash',
      token,
      null
    )
  })
}



/**
* Get User Info
* https://stackoverflow.com/questions/7130648/get-user-info-via-google-api
* @param id of the message in which to get the raw formatted data for
* @returns JSON-blob containing name and other info on the user.
*/
function getUserInfo() {
  return chrome_promise__WEBPACK_IMPORTED_MODULE_1___default().identity.getAuthToken({ interactive: false }).then(function (token) {
    return gmailAPIRequestSimple(
      'GET',
      GMAIL_API_USERINFO,
      token,
      { format: 'raw' }
    )
  })
}

/**
* Get FULL message data, allows retrieval of message body in html
* https://developers.google.com/gmail/api/v1/reference/users/messages#resource
* @param id of the message in which to get the raw formatted data for
* @returns https://developers.google.com/gmail/api/v1/reference/users/messages#resource
*/
function getMessageBody(id) {
  return chrome_promise__WEBPACK_IMPORTED_MODULE_1___default().identity.getAuthToken({ interactive: false }).then(function (token) {
    return gmailAPIRequest(
      'GET',
      GMAIL_API_MESSAGES + id,
      token,
      { format: 'full' }
    )
  })
}

/**
* Get raw attachment resource
* https://developers.google.com/gmail/api/v1/reference/users/messages/attachments/get
* @param msgId of the message whose attachment we would like to get.
* @param attachmentId id of the attachment to acquire.
* @returns https://developers.google.com/gmail/api/v1/reference/users/messages/attachments#resource
*/
function getAttachments(msgId, attachmentId) {
  let finalURL = GMAIL_API_MESSAGES + msgId + GMAIL_API_ATTACHMENTS + attachmentId
  return chrome_promise__WEBPACK_IMPORTED_MODULE_1___default().identity.getAuthToken({ interactive: false }).then(function (token) {
    return gmailAPIRequest(
      'GET',
      finalURL,
      token
    )
  })
}

/**
 * Utility function to get stored parameters from the local storage.
 * 
 * @param {string} item the parameter we wish to retrieve from local storage.
 * 
 * @return {Promise} promise that yields the value of the item requested upon resolution.
 */
 function getLocalStorageItem(item) {
  return chrome_promise__WEBPACK_IMPORTED_MODULE_1___default().storage.local.get(item)
}

/**
 * Utility function to get stored parameters from the managed storage.
 * 
 * @param {string} item the parameter we wish to retrieve from managed storage.
 * 
 * @return {Promise} promise that yields the value of the item requested upon resolution.
 */
function getManagedStorageItem(item) {
  return chrome_promise__WEBPACK_IMPORTED_MODULE_1___default().storage.managed.get(item)
}

/**
* Get metadata for thread, and only give headers which match X-PHISH-CRID
* https://developers.google.com/gmail/api/v1/reference/users/threads/get
* @param threadID
* @returns https://developers.google.com/gmail/api/v1/reference/users/threads#resource
*          https://developers.google.com/gmail/api/v1/reference/users/messages#resource
*/
function getEmailData(threadID) {
  return chrome_promise__WEBPACK_IMPORTED_MODULE_1___default().identity.getAuthToken({ interactive: false }).then(function (token) {
    return gmailAPIRequest(
      'GET',
      GMAIL_API_THREADS + threadID,
      token,
      { format: 'metadata', metadataHeaders: 'X-PHISH-CRID' }
    )
  })
}

/**
* Get Raw Messages From the Thread. This function returns a promise with the results from all gmail api calls.
* The first result is the request for the email headers and all other promises are the raw email results
* from the gmail messages api
* @param thread to get message data on
* @returns {*} promise that contains all promises for each message in the thread
*/
function getMessageDataFromThread(thread) {
  let promises = []
  // first promise in the array will be the subject request
  // promises.push(getMessageSubject(thread.messages[0].id))
  promises.push(getAllEmailHeaders(thread.messages[thread.messages.length - 1].id))
  // then the rest of the promises will be raw message requests
  // these are separate requests because Format cannot be used when accessing the api using the gmail.metadata scope.
  // see https://developers.google.com/gmail/api/v1/reference/users/messages/get for more details
  thread.messages.forEach(function (message) {
    promises.push(getRawMessage(message.id))
  })
  return Promise.all(promises)
}

/**
* Forward a RFC822 formatted message
* https://developers.google.com/gmail/api/v1/reference/users/messages/send
* https://developers.google.com/gmail/api/guides/uploads#multipart
* @param message to send
* @returns https://developers.google.com/gmail/api/v1/reference/users/messages#resource
*/
function sendReportEmailToRecipients(message) {
  return chrome_promise__WEBPACK_IMPORTED_MODULE_1___default().identity.getAuthToken({ interactive: false }).then(function (token) {
    let uploadEmailURL = 'https://www.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=multipart'
    let bearerToken = `Bearer ${token}`
    let headerSet = { 'Authorization': bearerToken, 'Content-Type': 'message/rfc822' }
    let fetchParams = (0,_common_utilities__WEBPACK_IMPORTED_MODULE_0__.getFetchParameters)('POST', headerSet)
    // We now set the body of fetchParams.
    fetchParams.body = message
    // We now use fetch to request the data we need.
    return fetch(uploadEmailURL, fetchParams).then((res) => {
      return res.json()
    }).then((json) => {
      // We parse the son if it comes in string form.
      if (typeof json === 'string') {
        return JSON.parse(json)
      }
      return json
    })
  })
}

/**
* Get minimum Message Details or information using GMAIL API.
* https://stackoverflow.com/questions/7130648/get-user-info-via-google-api
* @param {string} messageID of the message in which we need to get info for.
* @returns JSON-blob containing name and other info on the user.
*/
function getMessageDetails(messageID) {
  return chrome_promise__WEBPACK_IMPORTED_MODULE_1___default().identity.getAuthToken({ interactive: false }).then(function (token) {
    return gmailAPIRequest(
      'GET',
      GMAIL_API_MESSAGES + messageID,
      token,
      { format: 'minimal' }
    )
  })
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxHQUFHO0FBQ2Y7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUCxTQUFTLDJFQUE2QixHQUFHLG9CQUFvQjtBQUM3RDtBQUNBLGdDQUFnQyxNQUFNO0FBQ3RDLHNCQUFzQjtBQUN0QixzQkFBc0IscUVBQWtCO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVSxRQUFRO0FBQ2xCO0FBQ0E7QUFDTztBQUNQLFNBQVMsMkVBQTZCLEdBQUcsb0JBQW9CO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsR0FBRztBQUNIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcGhpc2gtYWxlcnQtYnV0dG9uLy4vbm9kZV9tb2R1bGVzL2Nocm9tZS1wcm9taXNlL2Nocm9tZS1wcm9taXNlLmpzIiwid2VicGFjazovL3BoaXNoLWFsZXJ0LWJ1dHRvbi8uL25vZGVfbW9kdWxlcy9jaHJvbWUtcHJvbWlzZS9pbmRleC5qcyIsIndlYnBhY2s6Ly9waGlzaC1hbGVydC1idXR0b24vLi9ub2RlX21vZHVsZXMvbG9nbGV2ZWwvbGliL2xvZ2xldmVsLmpzIiwid2VicGFjazovL3BoaXNoLWFsZXJ0LWJ1dHRvbi8uL3NyYy91dGlsaXRpZXMvY29tbW9uX3V0aWxpdGllcy5qcyIsIndlYnBhY2s6Ly9waGlzaC1hbGVydC1idXR0b24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcGhpc2gtYWxlcnQtYnV0dG9uL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL3BoaXNoLWFsZXJ0LWJ1dHRvbi93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vcGhpc2gtYWxlcnQtYnV0dG9uL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vcGhpc2gtYWxlcnQtYnV0dG9uL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vcGhpc2gtYWxlcnQtYnV0dG9uLy4vc3JjL3V0aWxpdGllcy9nbWFpbF91dGlsaXRpZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBjaHJvbWUtcHJvbWlzZVxuICogaHR0cHM6Ly9naXRodWIuY29tL3Rmb3h5L2Nocm9tZS1wcm9taXNlXG4gKlxuICogQ29weXJpZ2h0IDIwMTUgVG9tw6FzIEZveFxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cblxuKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgIC8vIGxpa2UgTm9kZS5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkodGhpcyB8fCByb290KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5LmJpbmQobnVsbCwgdGhpcyB8fCByb290KSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzIChyb290IGlzIHdpbmRvdylcbiAgICByb290LkNocm9tZVByb21pc2UgPSBmYWN0b3J5KHJvb3QpO1xuICAgIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0O1xuICAgIGlmIChzY3JpcHQpIHtcbiAgICAgIHZhciBuYW1lID0gc2NyaXB0LmRhdGFzZXQuaW5zdGFuY2U7XG4gICAgICBpZiAobmFtZSkge1xuICAgICAgICByb290W25hbWVdID0gbmV3IHJvb3QuQ2hyb21lUHJvbWlzZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcywgZnVuY3Rpb24ocm9vdCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZSxcbiAgICAgIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuICAvLyBUZW1wb3JhcnkgaGFja3kgZml4IHRvIG1ha2UgVHlwZVNjcmlwdCBgaW1wb3J0YCB3b3JrXG4gIENocm9tZVByb21pc2UuZGVmYXVsdCA9IENocm9tZVByb21pc2U7XG5cbiAgcmV0dXJuIENocm9tZVByb21pc2U7XG5cbiAgLy8vLy8vLy8vLy8vLy8vL1xuXG4gIGZ1bmN0aW9uIENocm9tZVByb21pc2Uob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBjaHJvbWUgPSBvcHRpb25zLmNocm9tZSB8fCByb290LmNocm9tZTtcbiAgICB2YXIgUHJvbWlzZSA9IG9wdGlvbnMuUHJvbWlzZSB8fCByb290LlByb21pc2U7XG4gICAgdmFyIHJ1bnRpbWUgPSBjaHJvbWUucnVudGltZTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCFzZWxmKSB0aHJvdyBuZXcgRXJyb3IoJ0Nocm9tZVByb21pc2UgbXVzdCBiZSBjYWxsZWQgd2l0aCBuZXcga2V5d29yZCcpO1xuXG4gICAgZmlsbFByb3BlcnRpZXMoY2hyb21lLCBzZWxmKTtcblxuICAgIGlmIChjaHJvbWUucGVybWlzc2lvbnMpIHtcbiAgICAgIGNocm9tZS5wZXJtaXNzaW9ucy5vbkFkZGVkLmFkZExpc3RlbmVyKHBlcm1pc3Npb25zQWRkZWRMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgZnVuY3Rpb24gc2V0UHJvbWlzZUZ1bmN0aW9uKGZuLCB0aGlzQXJnKSB7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGFyZ3MucHVzaChjYWxsYmFjayk7XG5cbiAgICAgICAgICBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcblxuICAgICAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrKCkge1xuICAgICAgICAgICAgdmFyIGVyciA9IHJ1bnRpbWUubGFzdEVycm9yO1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3dpdGNoIChyZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0c1swXSk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIH07XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaWxsUHJvcGVydGllcyhzb3VyY2UsIHRhcmdldCkge1xuICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcbiAgICAgICAgICB2YXIgdmFsO1xuICAgICAgICAgIC8vIFNvbWV0aW1lIGFyb3VuZCBDaHJvbWUgdjcxLCBjZXJ0YWluIGRlcHJlY2F0ZWQgbWV0aG9kcyBvbiB0aGVcbiAgICAgICAgICAvLyBleHRlbnNpb24gQVBJcyBzdGFydGVkIHVzaW5nIHByb3hpZXMgdG8gdGhyb3cgYW4gZXJyb3IgaWYgdGhlXG4gICAgICAgICAgLy8gZGVwcmVjYXRlZCBtZXRob2RzIHdlcmUgYWNjZXNzZWQsIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGV5XG4gICAgICAgICAgLy8gd2VyZSBpbnZva2VkIG9yIG5vdC4gIFRoYXQgd291bGQgY2F1c2UgdGhpcyBjb2RlIHRvIHRocm93LCBldmVuXG4gICAgICAgICAgLy8gaWYgbm8gb25lIHdhcyBhY3R1YWxseSBpbnZva2luZyB0aGF0IG1ldGhvZC5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFsID0gc291cmNlW2tleV07XG4gICAgICAgICAgfSBjYXRjaChlcnIpIHtcbiAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcblxuICAgICAgICAgIGlmICh0eXBlID09PSAnb2JqZWN0JyAmJiAhKHZhbCBpbnN0YW5jZW9mIENocm9tZVByb21pc2UpKSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHt9O1xuICAgICAgICAgICAgZmlsbFByb3BlcnRpZXModmFsLCB0YXJnZXRba2V5XSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNldFByb21pc2VGdW5jdGlvbih2YWwsIHNvdXJjZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gdmFsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlcm1pc3Npb25zQWRkZWRMaXN0ZW5lcihwZXJtcykge1xuICAgICAgaWYgKHBlcm1zLnBlcm1pc3Npb25zICYmIHBlcm1zLnBlcm1pc3Npb25zLmxlbmd0aCkge1xuICAgICAgICB2YXIgYXBwcm92ZWRQZXJtcyA9IHt9O1xuICAgICAgICBwZXJtcy5wZXJtaXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHBlcm1pc3Npb24pIHtcbiAgICAgICAgICB2YXIgYXBpID0gL15bXi5dKy8uZXhlYyhwZXJtaXNzaW9uKTtcbiAgICAgICAgICBpZiAoYXBpIGluIGNocm9tZSkge1xuICAgICAgICAgICAgYXBwcm92ZWRQZXJtc1thcGldID0gY2hyb21lW2FwaV07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZmlsbFByb3BlcnRpZXMoYXBwcm92ZWRQZXJtcywgc2VsZik7XG4gICAgICB9XG4gICAgfVxuICB9XG59KSk7XG4iLCJ2YXIgQ2hyb21lUHJvbWlzZSA9IHJlcXVpcmUoJy4vY2hyb21lLXByb21pc2UnKTtcblxudmFyIGNocm9tZXAgPSBuZXcgQ2hyb21lUHJvbWlzZSgpO1xuLy8gVGVtcG9yYXJ5IGhhY2t5IGZpeCB0byBtYWtlIFR5cGVTY3JpcHQgYGltcG9ydGAgd29ya1xuY2hyb21lcC5kZWZhdWx0ID0gY2hyb21lcDtcblxubW9kdWxlLmV4cG9ydHMgPSBjaHJvbWVwO1xuIiwiLypcbiogbG9nbGV2ZWwgLSBodHRwczovL2dpdGh1Yi5jb20vcGltdGVycnkvbG9nbGV2ZWxcbipcbiogQ29weXJpZ2h0IChjKSAyMDEzIFRpbSBQZXJyeVxuKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4qL1xuKGZ1bmN0aW9uIChyb290LCBkZWZpbml0aW9uKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoZGVmaW5pdGlvbik7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LmxvZyA9IGRlZmluaXRpb24oKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIFNsaWdodGx5IGR1YmlvdXMgdHJpY2tzIHRvIGN1dCBkb3duIG1pbmltaXplZCBmaWxlIHNpemVcbiAgICB2YXIgbm9vcCA9IGZ1bmN0aW9uKCkge307XG4gICAgdmFyIHVuZGVmaW5lZFR5cGUgPSBcInVuZGVmaW5lZFwiO1xuICAgIHZhciBpc0lFID0gKHR5cGVvZiB3aW5kb3cgIT09IHVuZGVmaW5lZFR5cGUpICYmICh0eXBlb2Ygd2luZG93Lm5hdmlnYXRvciAhPT0gdW5kZWZpbmVkVHlwZSkgJiYgKFxuICAgICAgICAvVHJpZGVudFxcL3xNU0lFIC8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICApO1xuXG4gICAgdmFyIGxvZ01ldGhvZHMgPSBbXG4gICAgICAgIFwidHJhY2VcIixcbiAgICAgICAgXCJkZWJ1Z1wiLFxuICAgICAgICBcImluZm9cIixcbiAgICAgICAgXCJ3YXJuXCIsXG4gICAgICAgIFwiZXJyb3JcIlxuICAgIF07XG5cbiAgICAvLyBDcm9zcy1icm93c2VyIGJpbmQgZXF1aXZhbGVudCB0aGF0IHdvcmtzIGF0IGxlYXN0IGJhY2sgdG8gSUU2XG4gICAgZnVuY3Rpb24gYmluZE1ldGhvZChvYmosIG1ldGhvZE5hbWUpIHtcbiAgICAgICAgdmFyIG1ldGhvZCA9IG9ialttZXRob2ROYW1lXTtcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QuYmluZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZC5iaW5kKG9iaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5jYWxsKG1ldGhvZCwgb2JqKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBNaXNzaW5nIGJpbmQgc2hpbSBvciBJRTggKyBNb2Rlcm5penIsIGZhbGxiYWNrIHRvIHdyYXBwaW5nXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmFwcGx5KG1ldGhvZCwgW29iaiwgYXJndW1lbnRzXSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRyYWNlKCkgZG9lc24ndCBwcmludCB0aGUgbWVzc2FnZSBpbiBJRSwgc28gZm9yIHRoYXQgY2FzZSB3ZSBuZWVkIHRvIHdyYXAgaXRcbiAgICBmdW5jdGlvbiB0cmFjZUZvcklFKCkge1xuICAgICAgICBpZiAoY29uc29sZS5sb2cpIHtcbiAgICAgICAgICAgIGlmIChjb25zb2xlLmxvZy5hcHBseSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEluIG9sZCBJRSwgbmF0aXZlIGNvbnNvbGUgbWV0aG9kcyB0aGVtc2VsdmVzIGRvbid0IGhhdmUgYXBwbHkoKS5cbiAgICAgICAgICAgICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuYXBwbHkoY29uc29sZS5sb2csIFtjb25zb2xlLCBhcmd1bWVudHNdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29uc29sZS50cmFjZSkgY29uc29sZS50cmFjZSgpO1xuICAgIH1cblxuICAgIC8vIEJ1aWxkIHRoZSBiZXN0IGxvZ2dpbmcgbWV0aG9kIHBvc3NpYmxlIGZvciB0aGlzIGVudlxuICAgIC8vIFdoZXJldmVyIHBvc3NpYmxlIHdlIHdhbnQgdG8gYmluZCwgbm90IHdyYXAsIHRvIHByZXNlcnZlIHN0YWNrIHRyYWNlc1xuICAgIGZ1bmN0aW9uIHJlYWxNZXRob2QobWV0aG9kTmFtZSkge1xuICAgICAgICBpZiAobWV0aG9kTmFtZSA9PT0gJ2RlYnVnJykge1xuICAgICAgICAgICAgbWV0aG9kTmFtZSA9ICdsb2cnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSB1bmRlZmluZWRUeXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIE5vIG1ldGhvZCBwb3NzaWJsZSwgZm9yIG5vdyAtIGZpeGVkIGxhdGVyIGJ5IGVuYWJsZUxvZ2dpbmdXaGVuQ29uc29sZUFycml2ZXNcbiAgICAgICAgfSBlbHNlIGlmIChtZXRob2ROYW1lID09PSAndHJhY2UnICYmIGlzSUUpIHtcbiAgICAgICAgICAgIHJldHVybiB0cmFjZUZvcklFO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnNvbGVbbWV0aG9kTmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRNZXRob2QoY29uc29sZSwgbWV0aG9kTmFtZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29uc29sZS5sb2cgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRNZXRob2QoY29uc29sZSwgJ2xvZycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGVzZSBwcml2YXRlIGZ1bmN0aW9ucyBhbHdheXMgbmVlZCBgdGhpc2AgdG8gYmUgc2V0IHByb3Blcmx5XG5cbiAgICBmdW5jdGlvbiByZXBsYWNlTG9nZ2luZ01ldGhvZHMobGV2ZWwsIGxvZ2dlck5hbWUpIHtcbiAgICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2dNZXRob2RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbWV0aG9kTmFtZSA9IGxvZ01ldGhvZHNbaV07XG4gICAgICAgICAgICB0aGlzW21ldGhvZE5hbWVdID0gKGkgPCBsZXZlbCkgP1xuICAgICAgICAgICAgICAgIG5vb3AgOlxuICAgICAgICAgICAgICAgIHRoaXMubWV0aG9kRmFjdG9yeShtZXRob2ROYW1lLCBsZXZlbCwgbG9nZ2VyTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWZpbmUgbG9nLmxvZyBhcyBhbiBhbGlhcyBmb3IgbG9nLmRlYnVnXG4gICAgICAgIHRoaXMubG9nID0gdGhpcy5kZWJ1ZztcbiAgICB9XG5cbiAgICAvLyBJbiBvbGQgSUUgdmVyc2lvbnMsIHRoZSBjb25zb2xlIGlzbid0IHByZXNlbnQgdW50aWwgeW91IGZpcnN0IG9wZW4gaXQuXG4gICAgLy8gV2UgYnVpbGQgcmVhbE1ldGhvZCgpIHJlcGxhY2VtZW50cyBoZXJlIHRoYXQgcmVnZW5lcmF0ZSBsb2dnaW5nIG1ldGhvZHNcbiAgICBmdW5jdGlvbiBlbmFibGVMb2dnaW5nV2hlbkNvbnNvbGVBcnJpdmVzKG1ldGhvZE5hbWUsIGxldmVsLCBsb2dnZXJOYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09IHVuZGVmaW5lZFR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXBsYWNlTG9nZ2luZ01ldGhvZHMuY2FsbCh0aGlzLCBsZXZlbCwgbG9nZ2VyTmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpc1ttZXRob2ROYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIEJ5IGRlZmF1bHQsIHdlIHVzZSBjbG9zZWx5IGJvdW5kIHJlYWwgbWV0aG9kcyB3aGVyZXZlciBwb3NzaWJsZSwgYW5kXG4gICAgLy8gb3RoZXJ3aXNlIHdlIHdhaXQgZm9yIGEgY29uc29sZSB0byBhcHBlYXIsIGFuZCB0aGVuIHRyeSBhZ2Fpbi5cbiAgICBmdW5jdGlvbiBkZWZhdWx0TWV0aG9kRmFjdG9yeShtZXRob2ROYW1lLCBsZXZlbCwgbG9nZ2VyTmFtZSkge1xuICAgICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgICByZXR1cm4gcmVhbE1ldGhvZChtZXRob2ROYW1lKSB8fFxuICAgICAgICAgICAgICAgZW5hYmxlTG9nZ2luZ1doZW5Db25zb2xlQXJyaXZlcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIExvZ2dlcihuYW1lLCBkZWZhdWx0TGV2ZWwsIGZhY3RvcnkpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBjdXJyZW50TGV2ZWw7XG4gICAgICBkZWZhdWx0TGV2ZWwgPSBkZWZhdWx0TGV2ZWwgPT0gbnVsbCA/IFwiV0FSTlwiIDogZGVmYXVsdExldmVsO1xuXG4gICAgICB2YXIgc3RvcmFnZUtleSA9IFwibG9nbGV2ZWxcIjtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBzdG9yYWdlS2V5ICs9IFwiOlwiICsgbmFtZTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIpIHtcbiAgICAgICAgc3RvcmFnZUtleSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcGVyc2lzdExldmVsSWZQb3NzaWJsZShsZXZlbE51bSkge1xuICAgICAgICAgIHZhciBsZXZlbE5hbWUgPSAobG9nTWV0aG9kc1tsZXZlbE51bV0gfHwgJ3NpbGVudCcpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gdW5kZWZpbmVkVHlwZSB8fCAhc3RvcmFnZUtleSkgcmV0dXJuO1xuXG4gICAgICAgICAgLy8gVXNlIGxvY2FsU3RvcmFnZSBpZiBhdmFpbGFibGVcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlW3N0b3JhZ2VLZXldID0gbGV2ZWxOYW1lO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuXG4gICAgICAgICAgLy8gVXNlIHNlc3Npb24gY29va2llIGFzIGZhbGxiYWNrXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmNvb2tpZSA9XG4gICAgICAgICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHN0b3JhZ2VLZXkpICsgXCI9XCIgKyBsZXZlbE5hbWUgKyBcIjtcIjtcbiAgICAgICAgICB9IGNhdGNoIChpZ25vcmUpIHt9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdldFBlcnNpc3RlZExldmVsKCkge1xuICAgICAgICAgIHZhciBzdG9yZWRMZXZlbDtcblxuICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSB1bmRlZmluZWRUeXBlIHx8ICFzdG9yYWdlS2V5KSByZXR1cm47XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzdG9yZWRMZXZlbCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2Vbc3RvcmFnZUtleV07XG4gICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuXG4gICAgICAgICAgLy8gRmFsbGJhY2sgdG8gY29va2llcyBpZiBsb2NhbCBzdG9yYWdlIGdpdmVzIHVzIG5vdGhpbmdcbiAgICAgICAgICBpZiAodHlwZW9mIHN0b3JlZExldmVsID09PSB1bmRlZmluZWRUeXBlKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICB2YXIgY29va2llID0gd2luZG93LmRvY3VtZW50LmNvb2tpZTtcbiAgICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbiA9IGNvb2tpZS5pbmRleE9mKFxuICAgICAgICAgICAgICAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdG9yYWdlS2V5KSArIFwiPVwiKTtcbiAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbiAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICBzdG9yZWRMZXZlbCA9IC9eKFteO10rKS8uZXhlYyhjb29raWUuc2xpY2UobG9jYXRpb24pKVsxXTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHRoZSBzdG9yZWQgbGV2ZWwgaXMgbm90IHZhbGlkLCB0cmVhdCBpdCBhcyBpZiBub3RoaW5nIHdhcyBzdG9yZWQuXG4gICAgICAgICAgaWYgKHNlbGYubGV2ZWxzW3N0b3JlZExldmVsXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHN0b3JlZExldmVsID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBzdG9yZWRMZXZlbDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2xlYXJQZXJzaXN0ZWRMZXZlbCgpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gdW5kZWZpbmVkVHlwZSB8fCAhc3RvcmFnZUtleSkgcmV0dXJuO1xuXG4gICAgICAgICAgLy8gVXNlIGxvY2FsU3RvcmFnZSBpZiBhdmFpbGFibGVcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oc3RvcmFnZUtleSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGNhdGNoIChpZ25vcmUpIHt9XG5cbiAgICAgICAgICAvLyBVc2Ugc2Vzc2lvbiBjb29raWUgYXMgZmFsbGJhY2tcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuY29va2llID1cbiAgICAgICAgICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RvcmFnZUtleSkgKyBcIj07IGV4cGlyZXM9VGh1LCAwMSBKYW4gMTk3MCAwMDowMDowMCBVVENcIjtcbiAgICAgICAgICB9IGNhdGNoIChpZ25vcmUpIHt9XG4gICAgICB9XG5cbiAgICAgIC8qXG4gICAgICAgKlxuICAgICAgICogUHVibGljIGxvZ2dlciBBUEkgLSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BpbXRlcnJ5L2xvZ2xldmVsIGZvciBkZXRhaWxzXG4gICAgICAgKlxuICAgICAgICovXG5cbiAgICAgIHNlbGYubmFtZSA9IG5hbWU7XG5cbiAgICAgIHNlbGYubGV2ZWxzID0geyBcIlRSQUNFXCI6IDAsIFwiREVCVUdcIjogMSwgXCJJTkZPXCI6IDIsIFwiV0FSTlwiOiAzLFxuICAgICAgICAgIFwiRVJST1JcIjogNCwgXCJTSUxFTlRcIjogNX07XG5cbiAgICAgIHNlbGYubWV0aG9kRmFjdG9yeSA9IGZhY3RvcnkgfHwgZGVmYXVsdE1ldGhvZEZhY3Rvcnk7XG5cbiAgICAgIHNlbGYuZ2V0TGV2ZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnRMZXZlbDtcbiAgICAgIH07XG5cbiAgICAgIHNlbGYuc2V0TGV2ZWwgPSBmdW5jdGlvbiAobGV2ZWwsIHBlcnNpc3QpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGxldmVsID09PSBcInN0cmluZ1wiICYmIHNlbGYubGV2ZWxzW2xldmVsLnRvVXBwZXJDYXNlKCldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgbGV2ZWwgPSBzZWxmLmxldmVsc1tsZXZlbC50b1VwcGVyQ2FzZSgpXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBsZXZlbCA9PT0gXCJudW1iZXJcIiAmJiBsZXZlbCA+PSAwICYmIGxldmVsIDw9IHNlbGYubGV2ZWxzLlNJTEVOVCkge1xuICAgICAgICAgICAgICBjdXJyZW50TGV2ZWwgPSBsZXZlbDtcbiAgICAgICAgICAgICAgaWYgKHBlcnNpc3QgIT09IGZhbHNlKSB7ICAvLyBkZWZhdWx0cyB0byB0cnVlXG4gICAgICAgICAgICAgICAgICBwZXJzaXN0TGV2ZWxJZlBvc3NpYmxlKGxldmVsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXBsYWNlTG9nZ2luZ01ldGhvZHMuY2FsbChzZWxmLCBsZXZlbCwgbmFtZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gdW5kZWZpbmVkVHlwZSAmJiBsZXZlbCA8IHNlbGYubGV2ZWxzLlNJTEVOVCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiTm8gY29uc29sZSBhdmFpbGFibGUgZm9yIGxvZ2dpbmdcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IFwibG9nLnNldExldmVsKCkgY2FsbGVkIHdpdGggaW52YWxpZCBsZXZlbDogXCIgKyBsZXZlbDtcbiAgICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzZWxmLnNldERlZmF1bHRMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgICAgIGRlZmF1bHRMZXZlbCA9IGxldmVsO1xuICAgICAgICAgIGlmICghZ2V0UGVyc2lzdGVkTGV2ZWwoKSkge1xuICAgICAgICAgICAgICBzZWxmLnNldExldmVsKGxldmVsLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgc2VsZi5yZXNldExldmVsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNlbGYuc2V0TGV2ZWwoZGVmYXVsdExldmVsLCBmYWxzZSk7XG4gICAgICAgICAgY2xlYXJQZXJzaXN0ZWRMZXZlbCgpO1xuICAgICAgfTtcblxuICAgICAgc2VsZi5lbmFibGVBbGwgPSBmdW5jdGlvbihwZXJzaXN0KSB7XG4gICAgICAgICAgc2VsZi5zZXRMZXZlbChzZWxmLmxldmVscy5UUkFDRSwgcGVyc2lzdCk7XG4gICAgICB9O1xuXG4gICAgICBzZWxmLmRpc2FibGVBbGwgPSBmdW5jdGlvbihwZXJzaXN0KSB7XG4gICAgICAgICAgc2VsZi5zZXRMZXZlbChzZWxmLmxldmVscy5TSUxFTlQsIHBlcnNpc3QpO1xuICAgICAgfTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSB3aXRoIHRoZSByaWdodCBsZXZlbFxuICAgICAgdmFyIGluaXRpYWxMZXZlbCA9IGdldFBlcnNpc3RlZExldmVsKCk7XG4gICAgICBpZiAoaW5pdGlhbExldmVsID09IG51bGwpIHtcbiAgICAgICAgICBpbml0aWFsTGV2ZWwgPSBkZWZhdWx0TGV2ZWw7XG4gICAgICB9XG4gICAgICBzZWxmLnNldExldmVsKGluaXRpYWxMZXZlbCwgZmFsc2UpO1xuICAgIH1cblxuICAgIC8qXG4gICAgICpcbiAgICAgKiBUb3AtbGV2ZWwgQVBJXG4gICAgICpcbiAgICAgKi9cblxuICAgIHZhciBkZWZhdWx0TG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXG4gICAgdmFyIF9sb2dnZXJzQnlOYW1lID0ge307XG4gICAgZGVmYXVsdExvZ2dlci5nZXRMb2dnZXIgPSBmdW5jdGlvbiBnZXRMb2dnZXIobmFtZSkge1xuICAgICAgICBpZiAoKHR5cGVvZiBuYW1lICE9PSBcInN5bWJvbFwiICYmIHR5cGVvZiBuYW1lICE9PSBcInN0cmluZ1wiKSB8fCBuYW1lID09PSBcIlwiKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHN1cHBseSBhIG5hbWUgd2hlbiBjcmVhdGluZyBhIGxvZ2dlci5cIik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbG9nZ2VyID0gX2xvZ2dlcnNCeU5hbWVbbmFtZV07XG4gICAgICAgIGlmICghbG9nZ2VyKSB7XG4gICAgICAgICAgbG9nZ2VyID0gX2xvZ2dlcnNCeU5hbWVbbmFtZV0gPSBuZXcgTG9nZ2VyKFxuICAgICAgICAgICAgbmFtZSwgZGVmYXVsdExvZ2dlci5nZXRMZXZlbCgpLCBkZWZhdWx0TG9nZ2VyLm1ldGhvZEZhY3RvcnkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsb2dnZXI7XG4gICAgfTtcblxuICAgIC8vIEdyYWIgdGhlIGN1cnJlbnQgZ2xvYmFsIGxvZyB2YXJpYWJsZSBpbiBjYXNlIG9mIG92ZXJ3cml0ZVxuICAgIHZhciBfbG9nID0gKHR5cGVvZiB3aW5kb3cgIT09IHVuZGVmaW5lZFR5cGUpID8gd2luZG93LmxvZyA6IHVuZGVmaW5lZDtcbiAgICBkZWZhdWx0TG9nZ2VyLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IHVuZGVmaW5lZFR5cGUgJiZcbiAgICAgICAgICAgICAgIHdpbmRvdy5sb2cgPT09IGRlZmF1bHRMb2dnZXIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2cgPSBfbG9nO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlZmF1bHRMb2dnZXI7XG4gICAgfTtcblxuICAgIGRlZmF1bHRMb2dnZXIuZ2V0TG9nZ2VycyA9IGZ1bmN0aW9uIGdldExvZ2dlcnMoKSB7XG4gICAgICAgIHJldHVybiBfbG9nZ2Vyc0J5TmFtZTtcbiAgICB9O1xuXG4gICAgLy8gRVM2IGRlZmF1bHQgZXhwb3J0LCBmb3IgY29tcGF0aWJpbGl0eVxuICAgIGRlZmF1bHRMb2dnZXJbJ2RlZmF1bHQnXSA9IGRlZmF1bHRMb2dnZXI7XG5cbiAgICByZXR1cm4gZGVmYXVsdExvZ2dlcjtcbn0pKTtcbiIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4qXG4qICBbMjAxMF0gLSBbMjAyM10gS25vd0JlNCBJbmNvcnBvcmF0ZWRcbiogIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4qXG4qIE5PVElDRTogIEFsbCBpbmZvcm1hdGlvbiBjb250YWluZWQgaGVyZWluIGlzLCBhbmQgcmVtYWluc1xuKiB0aGUgcHJvcGVydHkgb2YgS25vd0JlNCBJbmNvcnBvcmF0ZWQgYW5kIGl0cyBzdXBwbGllcnMsXG4qIGlmIGFueS4gIFRoZSBpbnRlbGxlY3R1YWwgYW5kIHRlY2huaWNhbCBjb25jZXB0cyBjb250YWluZWRcbiogaGVyZWluIGFyZSBwcm9wcmlldGFyeSB0byBLbm93QmU0IEluY29ycG9yYXRlZFxuKiBhbmQgaXRzIHN1cHBsaWVycyBhbmQgbWF5IGJlIGNvdmVyZWQgYnkgVS5TLiBhbmQgRm9yZWlnbiBQYXRlbnRzLFxuKiBwYXRlbnRzIGluIHByb2Nlc3MsIGFuZCBhcmUgcHJvdGVjdGVkIGJ5IHRyYWRlIHNlY3JldCBvciBjb3B5cmlnaHQgbGF3LlxuKiBEaXNzZW1pbmF0aW9uIG9mIHRoaXMgaW5mb3JtYXRpb24gb3IgcmVwcm9kdWN0aW9uIG9mIHRoaXMgbWF0ZXJpYWxcbiogaXMgc3RyaWN0bHkgZm9yYmlkZGVuIHVubGVzcyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24gaXMgb2J0YWluZWRcbiogZnJvbSBLbm93QmU0IEluY29ycG9yYXRlZC5cbiovXG5pbXBvcnQgbG9nIGZyb20gJ2xvZ2xldmVsJ1xuLy8gR2xvYmFsIGluc3RhbmNlIG9mIHRoZSBsb2dnZXIgbW9kdWxlLCBkZWZhdWx0aW5nIHRvIEVSUk9SLW1vZGUgbG9nZ2luZy5cbmV4cG9ydCBsZXQgbG9nZ2VyID0gbG9nLm5vQ29uZmxpY3QoKVxubG9nZ2VyLnNldERlZmF1bHRMZXZlbCgnRVJST1InKVxuXG4vKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gcmVwb3J0IGEgY2FtcGFpZ24gSUQgdG8gS01TQVQuIFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgSFRUUCBtZXRob2QgdG8gdXNlIChQT1NULCBHRVQsIFBVVCwgb3RoZXJzKVxuICogQHBhcmFtIHtBcnJheS48T2JqZWN0Pn0gaGVhZGVyU2V0IGFuIGFycmF5IG9mIG9iamVjdHMgdG8gYmUgdXNlZCBhcyBIVFRQIGhlYWRlcnMuXG4gKiBcbiAqIEByZXR1cm4ge09iamVjdH0gcmVxdWVzdFBhcmFtZXRlcnMgYW4gb2JqZWN0IHRoYXQgaXMgdXNhYmxlIGFzIGlucHV0IHRvIHRoZSBIVFRQLWZldGNoIGNhbGwuXG4gKi9cbiBleHBvcnQgZnVuY3Rpb24gZ2V0RmV0Y2hQYXJhbWV0ZXJzKG1ldGhvZCwgaGVhZGVyU2V0ID0gbnVsbCkge1xuICBsZXQgcmVxdWVzdFBhcmFtZXRlcnMgPSB7XG4gICAgbWV0aG9kOiBtZXRob2QsXG4gICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgIHJlZmVycmVyUG9saWN5OiAnbm8tcmVmZXJyZXInLFxuICB9XG4gIGlmIChoZWFkZXJTZXQpIHtcbiAgICByZXF1ZXN0UGFyYW1ldGVycy5oZWFkZXJzID0gaGVhZGVyU2V0XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RQYXJhbWV0ZXJzXG59XG5cbi8qKlxuICogSGVscGVyIG1ldGhvZCBmb3IgUHJvbWlzaWZpZWQgYWpheCBjYWxsLlxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCBIVFRQIFZFUkJcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgcmVxdWVzdCBlbmRwb2ludFxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgcGFyYW1zIHRvIHNldFxuICogQHBhcmFtIHtBcnJheS48b2JqZWN0Pn0gYWRkaXRpb25hbEhlYWRlclNldCBhZGRpdGlvbmFsIGhlYWRlcnMgZm9yIHVzZSB3aXRoIHRoZSBIVFRQIHJlcXVlc3QuXG4gKiBcbiAqIEByZXR1cm4ge09iamVjdH0ganNvbiBvYmplY3QgY29udGFpbmluZyB0aGUgcmVzcG9uc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRKU09OKG1ldGhvZCwgdXJsLCBkYXRhLCBhZGRpdGlvbmFsSGVhZGVyU2V0ID0gbnVsbCkge1xuICBsZXQgaGVhZGVyU2V0ID0geyAuLi5hZGRpdGlvbmFsSGVhZGVyU2V0LCAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH1cbiAgbGV0IGZldGNoUGFyYW1zID0gZ2V0RmV0Y2hQYXJhbWV0ZXJzKG1ldGhvZCwgaGVhZGVyU2V0KVxuICBsZXQgZmluYWxVUkwgPSB1cmxcbiAgLy8gV2UgbmVlZCB0byBwcm9jZXNzIHRoZSBkYXRhIGFuZCB1c2UgaXQgYXBwcm9wcmlhdGVseSBkZXBlbmRpbmcgb24gdGhlIG1ldGhvZC4gXG4gIGlmIChkYXRhKSB7XG4gICAgLy8gRm9yIG5vbi1HRVQgcmVxdWVzdHMsIHdlIHVzZSB0aGUgSlNPTiBmb3JtYXQgb2YgdGhlIGRhdGEuXG4gICAgaWYgKG1ldGhvZC50b0xvd2VyQ2FzZSgpICE9PSAnZ2V0Jykge1xuICAgICAgZmV0Y2hQYXJhbXMuYm9keSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpIC8vIGJvZHkgZGF0YSB0eXBlIG11c3QgbWF0Y2ggXCJDb250ZW50LVR5cGVcIiBoZWFkZXJcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRm9yIEdFVC1yZXF1ZXN0cywgd2UgYWRkIGl0IGFzIHBhcnQgb2YgdGhlIHVybCBzZWFyY2ggcXVlcnkuXG4gICAgICBmaW5hbFVSTCA9IHVybCArICc/JyArIG5ldyBVUkxTZWFyY2hQYXJhbXMoZGF0YSlcbiAgICB9XG4gIH1cbiAgLy8gTmV4dCB3ZSBleGVjdXRlIHRoZSBmZXRjaCByZXF1ZXN0LCBhbmQgd2FpdCBmb3IgaXRzIHJlc3BvbnNlLlxuICByZXR1cm4gZmV0Y2goZmluYWxVUkwsIGZldGNoUGFyYW1zKS50aGVuKChyZXMpID0+IHtcbiAgICByZXR1cm4gcmVzLmpzb24oKVxuICB9KS50aGVuKChqc29uKSA9PiB7XG4gICAgLy8gVGhlIHVwcGVyIGZ1bmN0aW9uIGNhbGxzIGZvciBhIGpzb24gcmVzcG9uc2UuIElmIHRoZSByZXNwb25zZSBpcyBhIHN0cmluZywgd2UgcGFyc2UgaXQuXG4gICAgaWYgKHR5cGVvZiBqc29uID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoanNvbilcbiAgICB9XG4gICAgcmV0dXJuIGpzb25cbiAgfSlcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKlxuKiAgWzIwMTBdIC0gWzIwMjNdIEtub3dCZTQgSW5jb3Jwb3JhdGVkXG4qICBBbGwgUmlnaHRzIFJlc2VydmVkLlxuKlxuKiBOT1RJQ0U6ICBBbGwgaW5mb3JtYXRpb24gY29udGFpbmVkIGhlcmVpbiBpcywgYW5kIHJlbWFpbnNcbiogdGhlIHByb3BlcnR5IG9mIEtub3dCZTQgSW5jb3Jwb3JhdGVkIGFuZCBpdHMgc3VwcGxpZXJzLFxuKiBpZiBhbnkuICBUaGUgaW50ZWxsZWN0dWFsIGFuZCB0ZWNobmljYWwgY29uY2VwdHMgY29udGFpbmVkXG4qIGhlcmVpbiBhcmUgcHJvcHJpZXRhcnkgdG8gS25vd0JlNCBJbmNvcnBvcmF0ZWRcbiogYW5kIGl0cyBzdXBwbGllcnMgYW5kIG1heSBiZSBjb3ZlcmVkIGJ5IFUuUy4gYW5kIEZvcmVpZ24gUGF0ZW50cyxcbiogcGF0ZW50cyBpbiBwcm9jZXNzLCBhbmQgYXJlIHByb3RlY3RlZCBieSB0cmFkZSBzZWNyZXQgb3IgY29weXJpZ2h0IGxhdy5cbiogRGlzc2VtaW5hdGlvbiBvZiB0aGlzIGluZm9ybWF0aW9uIG9yIHJlcHJvZHVjdGlvbiBvZiB0aGlzIG1hdGVyaWFsXG4qIGlzIHN0cmljdGx5IGZvcmJpZGRlbiB1bmxlc3MgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uIGlzIG9idGFpbmVkXG4qIGZyb20gS25vd0JlNCBJbmNvcnBvcmF0ZWQuXG4qL1xuXG5pbXBvcnQgeyBnZXRGZXRjaFBhcmFtZXRlcnMsIGdldEpTT04gfSBmcm9tICcuL2NvbW1vbl91dGlsaXRpZXMnXG5pbXBvcnQgY2hyb21lcCBmcm9tICdjaHJvbWUtcHJvbWlzZSdcblxuLy8gR2xvYmFsIGNvbnN0YW50cyAodXJscykgZm9yIHVzZSB3aXRoIHRoZSBHTUFJTCBBUEkgcmVxdWVzdHMuXG5jb25zdCBHTUFJTF9BUElfVEhSRUFEUyA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9nbWFpbC92MS91c2Vycy9tZS90aHJlYWRzLydcbmNvbnN0IEdNQUlMX0FQSV9NRVNTQUdFUyA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9nbWFpbC92MS91c2Vycy9tZS9tZXNzYWdlcy8nXG5jb25zdCBHTUFJTF9BUElfVVNFUklORk8gPSAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL3VzZXJpbmZvP2FjY2Vzc190b2tlbj0nXG5jb25zdCBHTUFJTF9BUElfQVRUQUNITUVOVFMgPSAnL2F0dGFjaG1lbnRzLydcblxuLyoqXG4qIEdldCBBbGwgZW1haWwgaGVhZGVycyBmcm9tIGEgbWVzc2FnZVxuKiBAcGFyYW0ge251bWJlcn0gbWVzc2FnZUlEIHRoZSBtZXNzYWdlIElEIHdoaWNoIHdlIHdhbnQgdG8gZ2V0IHRoZSBoZWFkZXJzIG9mLlxuKiBAcmV0dXJucyBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9nbWFpbC9hcGkvdjEvcmVmZXJlbmNlL3VzZXJzL21lc3NhZ2VzI3Jlc291cmNlXG4qL1xuZnVuY3Rpb24gZ2V0QWxsRW1haWxIZWFkZXJzKG1lc3NhZ2VJRCkge1xuICByZXR1cm4gY2hyb21lcC5pZGVudGl0eS5nZXRBdXRoVG9rZW4oeyBpbnRlcmFjdGl2ZTogZmFsc2UgfSkudGhlbihmdW5jdGlvbiAodG9rZW4pIHtcbiAgICByZXR1cm4gZ21haWxBUElSZXF1ZXN0KFxuICAgICAgJ0dFVCcsXG4gICAgICBHTUFJTF9BUElfTUVTU0FHRVMgKyBtZXNzYWdlSUQsXG4gICAgICB0b2tlbixcbiAgICAgIHsgZm9ybWF0OiAnbWV0YWRhdGEnIH1cbiAgICApXG4gIH0pXG59XG5cbi8qKlxuKiBHZXQgcmF3IG1lc3NhZ2UgZGF0YVxuKiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9nbWFpbC9hcGkvdjEvcmVmZXJlbmNlL3VzZXJzL21lc3NhZ2VzI3Jlc291cmNlXG4qIEBwYXJhbSBpZCBvZiB0aGUgbWVzc2FnZSBpbiB3aGljaCB0byBnZXQgdGhlIHJhdyBmb3JtYXR0ZWQgZGF0YSBmb3JcbiogQHJldHVybnMgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZ21haWwvYXBpL3YxL3JlZmVyZW5jZS91c2Vycy9tZXNzYWdlcyNyZXNvdXJjZVxuKi9cbmZ1bmN0aW9uIGdldFJhd01lc3NhZ2UoaWQpIHtcbiAgcmV0dXJuIGNocm9tZXAuaWRlbnRpdHkuZ2V0QXV0aFRva2VuKHsgaW50ZXJhY3RpdmU6IGZhbHNlIH0pLnRoZW4oZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgcmV0dXJuIGdtYWlsQVBJUmVxdWVzdChcbiAgICAgICdHRVQnLFxuICAgICAgR01BSUxfQVBJX01FU1NBR0VTICsgaWQsXG4gICAgICB0b2tlbixcbiAgICAgIHsgZm9ybWF0OiAncmF3JyB9XG4gICAgKVxuICB9KVxufVxuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdG8gZXhlY3V0ZSBHTUFJTCBBUEkgKHJlcXVlc3RzKSB3aXRob3V0IHVzZXIgcHJvdmlkZWQgZGF0YS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgSFRUUCBWRVJCXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIHJlcXVlc3QgZW5kcG9pbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbiBhdXRob3JpemF0aW9uIGtleSBmb3IgdHJhbnNhY3Rpb24gd2l0aCBHTWFpbCBTZXJ2ZXJzXG4gKiBcbiAqIEByZXR1cm4ge09iamVjdH0gYSBqc29uIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHJlc3VsdCBvZiB0aGUgR01BSUwgQVBJIHJlcXVlc3QuXG4gKi9cbmZ1bmN0aW9uIGdtYWlsQVBJUmVxdWVzdFNpbXBsZShtZXRob2QsIHVybCwgdG9rZW4pIHtcbiAgbGV0IGZpbmFsVVJMID0gdXJsICsgdG9rZW5cbiAgcmV0dXJuIGdldEpTT04oXG4gICAgbWV0aG9kLFxuICAgIGZpbmFsVVJMLFxuICAgIG51bGwsXG4gICAgeyAnQXV0aG9yaXphdGlvbic6ICdCZWFyZXIgJyArIHRva2VuIH1cbiAgKVxufVxuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdG8gZXhlY3V0ZSBHTUFJTCBBUEkgKHJlcXVlc3RzKSB3aXRoIHVzZXIgcHJvdmlkZWQgZGF0YS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgSFRUUCBWRVJCXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIHJlcXVlc3QgZW5kcG9pbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbiBhdXRob3JpemF0aW9uIGtleSBmb3IgdHJhbnNhY3Rpb24gd2l0aCBHTWFpbCBTZXJ2ZXJzXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSBwYXlsb2FkIHRvIGJlIHNlbnQgdG8gdGhlIHJlbW90ZSBHTUFJTCBzZXJ2ZXIuXG4gKiBcbiAqIEByZXR1cm4ge09iamVjdH0gYSBqc29uIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHJlc3VsdCBvZiB0aGUgR01BSUwgQVBJIHJlcXVlc3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnbWFpbEFQSVJlcXVlc3QobWV0aG9kLCB1cmwsIHRva2VuLCBkYXRhKSB7XG4gIHJldHVybiBnZXRKU09OKFxuICAgIG1ldGhvZCxcbiAgICB1cmwsXG4gICAgZGF0YSxcbiAgICB7ICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgdG9rZW4gfVxuICApXG59XG5cbi8qKlxuKiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9nbWFpbC9hcGkvdjEvcmVmZXJlbmNlL3VzZXJzL3RocmVhZHMvdHJhc2hcbiogQHBhcmFtIGlkIG9mIHRoZSB0aHJlYWQgdG8gbW92ZSB0byB0cmFzaCBpLmUuIGFwcGx5IHRyYXNoIGxhYmVsXG4qIEByZXR1cm5zIHJlc3BvbnNlIGZyb20gZ21haWwgYXBpIGluIHRoZSBmb3JtIG9mIGEgcHJvbWlzZVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlVGhyZWFkVG9UcmFzaChpZCkge1xuICByZXR1cm4gY2hyb21lcC5pZGVudGl0eS5nZXRBdXRoVG9rZW4oeyBpbnRlcmFjdGl2ZTogZmFsc2UgfSkudGhlbihmdW5jdGlvbiAodG9rZW4pIHtcbiAgICByZXR1cm4gZ21haWxBUElSZXF1ZXN0KFxuICAgICAgJ1BPU1QnLFxuICAgICAgR01BSUxfQVBJX1RIUkVBRFMgKyBpZCArICcvdHJhc2gnLFxuICAgICAgdG9rZW4sXG4gICAgICBudWxsXG4gICAgKVxuICB9KVxufVxuXG5cblxuLyoqXG4qIEdldCBVc2VyIEluZm9cbiogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNzEzMDY0OC9nZXQtdXNlci1pbmZvLXZpYS1nb29nbGUtYXBpXG4qIEBwYXJhbSBpZCBvZiB0aGUgbWVzc2FnZSBpbiB3aGljaCB0byBnZXQgdGhlIHJhdyBmb3JtYXR0ZWQgZGF0YSBmb3JcbiogQHJldHVybnMgSlNPTi1ibG9iIGNvbnRhaW5pbmcgbmFtZSBhbmQgb3RoZXIgaW5mbyBvbiB0aGUgdXNlci5cbiovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VXNlckluZm8oKSB7XG4gIHJldHVybiBjaHJvbWVwLmlkZW50aXR5LmdldEF1dGhUb2tlbih7IGludGVyYWN0aXZlOiBmYWxzZSB9KS50aGVuKGZ1bmN0aW9uICh0b2tlbikge1xuICAgIHJldHVybiBnbWFpbEFQSVJlcXVlc3RTaW1wbGUoXG4gICAgICAnR0VUJyxcbiAgICAgIEdNQUlMX0FQSV9VU0VSSU5GTyxcbiAgICAgIHRva2VuLFxuICAgICAgeyBmb3JtYXQ6ICdyYXcnIH1cbiAgICApXG4gIH0pXG59XG5cbi8qKlxuKiBHZXQgRlVMTCBtZXNzYWdlIGRhdGEsIGFsbG93cyByZXRyaWV2YWwgb2YgbWVzc2FnZSBib2R5IGluIGh0bWxcbiogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZ21haWwvYXBpL3YxL3JlZmVyZW5jZS91c2Vycy9tZXNzYWdlcyNyZXNvdXJjZVxuKiBAcGFyYW0gaWQgb2YgdGhlIG1lc3NhZ2UgaW4gd2hpY2ggdG8gZ2V0IHRoZSByYXcgZm9ybWF0dGVkIGRhdGEgZm9yXG4qIEByZXR1cm5zIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2dtYWlsL2FwaS92MS9yZWZlcmVuY2UvdXNlcnMvbWVzc2FnZXMjcmVzb3VyY2VcbiovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWVzc2FnZUJvZHkoaWQpIHtcbiAgcmV0dXJuIGNocm9tZXAuaWRlbnRpdHkuZ2V0QXV0aFRva2VuKHsgaW50ZXJhY3RpdmU6IGZhbHNlIH0pLnRoZW4oZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgcmV0dXJuIGdtYWlsQVBJUmVxdWVzdChcbiAgICAgICdHRVQnLFxuICAgICAgR01BSUxfQVBJX01FU1NBR0VTICsgaWQsXG4gICAgICB0b2tlbixcbiAgICAgIHsgZm9ybWF0OiAnZnVsbCcgfVxuICAgIClcbiAgfSlcbn1cblxuLyoqXG4qIEdldCByYXcgYXR0YWNobWVudCByZXNvdXJjZVxuKiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9nbWFpbC9hcGkvdjEvcmVmZXJlbmNlL3VzZXJzL21lc3NhZ2VzL2F0dGFjaG1lbnRzL2dldFxuKiBAcGFyYW0gbXNnSWQgb2YgdGhlIG1lc3NhZ2Ugd2hvc2UgYXR0YWNobWVudCB3ZSB3b3VsZCBsaWtlIHRvIGdldC5cbiogQHBhcmFtIGF0dGFjaG1lbnRJZCBpZCBvZiB0aGUgYXR0YWNobWVudCB0byBhY3F1aXJlLlxuKiBAcmV0dXJucyBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9nbWFpbC9hcGkvdjEvcmVmZXJlbmNlL3VzZXJzL21lc3NhZ2VzL2F0dGFjaG1lbnRzI3Jlc291cmNlXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEF0dGFjaG1lbnRzKG1zZ0lkLCBhdHRhY2htZW50SWQpIHtcbiAgbGV0IGZpbmFsVVJMID0gR01BSUxfQVBJX01FU1NBR0VTICsgbXNnSWQgKyBHTUFJTF9BUElfQVRUQUNITUVOVFMgKyBhdHRhY2htZW50SWRcbiAgcmV0dXJuIGNocm9tZXAuaWRlbnRpdHkuZ2V0QXV0aFRva2VuKHsgaW50ZXJhY3RpdmU6IGZhbHNlIH0pLnRoZW4oZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgcmV0dXJuIGdtYWlsQVBJUmVxdWVzdChcbiAgICAgICdHRVQnLFxuICAgICAgZmluYWxVUkwsXG4gICAgICB0b2tlblxuICAgIClcbiAgfSlcbn1cblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGdldCBzdG9yZWQgcGFyYW1ldGVycyBmcm9tIHRoZSBsb2NhbCBzdG9yYWdlLlxuICogXG4gKiBAcGFyYW0ge3N0cmluZ30gaXRlbSB0aGUgcGFyYW1ldGVyIHdlIHdpc2ggdG8gcmV0cmlldmUgZnJvbSBsb2NhbCBzdG9yYWdlLlxuICogXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgeWllbGRzIHRoZSB2YWx1ZSBvZiB0aGUgaXRlbSByZXF1ZXN0ZWQgdXBvbiByZXNvbHV0aW9uLlxuICovXG4gZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsU3RvcmFnZUl0ZW0oaXRlbSkge1xuICByZXR1cm4gY2hyb21lcC5zdG9yYWdlLmxvY2FsLmdldChpdGVtKVxufVxuXG4vKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gZ2V0IHN0b3JlZCBwYXJhbWV0ZXJzIGZyb20gdGhlIG1hbmFnZWQgc3RvcmFnZS5cbiAqIFxuICogQHBhcmFtIHtzdHJpbmd9IGl0ZW0gdGhlIHBhcmFtZXRlciB3ZSB3aXNoIHRvIHJldHJpZXZlIGZyb20gbWFuYWdlZCBzdG9yYWdlLlxuICogXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgeWllbGRzIHRoZSB2YWx1ZSBvZiB0aGUgaXRlbSByZXF1ZXN0ZWQgdXBvbiByZXNvbHV0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWFuYWdlZFN0b3JhZ2VJdGVtKGl0ZW0pIHtcbiAgcmV0dXJuIGNocm9tZXAuc3RvcmFnZS5tYW5hZ2VkLmdldChpdGVtKVxufVxuXG4vKipcbiogR2V0IG1ldGFkYXRhIGZvciB0aHJlYWQsIGFuZCBvbmx5IGdpdmUgaGVhZGVycyB3aGljaCBtYXRjaCBYLVBISVNILUNSSURcbiogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZ21haWwvYXBpL3YxL3JlZmVyZW5jZS91c2Vycy90aHJlYWRzL2dldFxuKiBAcGFyYW0gdGhyZWFkSURcbiogQHJldHVybnMgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZ21haWwvYXBpL3YxL3JlZmVyZW5jZS91c2Vycy90aHJlYWRzI3Jlc291cmNlXG4qICAgICAgICAgIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2dtYWlsL2FwaS92MS9yZWZlcmVuY2UvdXNlcnMvbWVzc2FnZXMjcmVzb3VyY2VcbiovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW1haWxEYXRhKHRocmVhZElEKSB7XG4gIHJldHVybiBjaHJvbWVwLmlkZW50aXR5LmdldEF1dGhUb2tlbih7IGludGVyYWN0aXZlOiBmYWxzZSB9KS50aGVuKGZ1bmN0aW9uICh0b2tlbikge1xuICAgIHJldHVybiBnbWFpbEFQSVJlcXVlc3QoXG4gICAgICAnR0VUJyxcbiAgICAgIEdNQUlMX0FQSV9USFJFQURTICsgdGhyZWFkSUQsXG4gICAgICB0b2tlbixcbiAgICAgIHsgZm9ybWF0OiAnbWV0YWRhdGEnLCBtZXRhZGF0YUhlYWRlcnM6ICdYLVBISVNILUNSSUQnIH1cbiAgICApXG4gIH0pXG59XG5cbi8qKlxuKiBHZXQgUmF3IE1lc3NhZ2VzIEZyb20gdGhlIFRocmVhZC4gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcHJvbWlzZSB3aXRoIHRoZSByZXN1bHRzIGZyb20gYWxsIGdtYWlsIGFwaSBjYWxscy5cbiogVGhlIGZpcnN0IHJlc3VsdCBpcyB0aGUgcmVxdWVzdCBmb3IgdGhlIGVtYWlsIGhlYWRlcnMgYW5kIGFsbCBvdGhlciBwcm9taXNlcyBhcmUgdGhlIHJhdyBlbWFpbCByZXN1bHRzXG4qIGZyb20gdGhlIGdtYWlsIG1lc3NhZ2VzIGFwaVxuKiBAcGFyYW0gdGhyZWFkIHRvIGdldCBtZXNzYWdlIGRhdGEgb25cbiogQHJldHVybnMgeyp9IHByb21pc2UgdGhhdCBjb250YWlucyBhbGwgcHJvbWlzZXMgZm9yIGVhY2ggbWVzc2FnZSBpbiB0aGUgdGhyZWFkXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1lc3NhZ2VEYXRhRnJvbVRocmVhZCh0aHJlYWQpIHtcbiAgbGV0IHByb21pc2VzID0gW11cbiAgLy8gZmlyc3QgcHJvbWlzZSBpbiB0aGUgYXJyYXkgd2lsbCBiZSB0aGUgc3ViamVjdCByZXF1ZXN0XG4gIC8vIHByb21pc2VzLnB1c2goZ2V0TWVzc2FnZVN1YmplY3QodGhyZWFkLm1lc3NhZ2VzWzBdLmlkKSlcbiAgcHJvbWlzZXMucHVzaChnZXRBbGxFbWFpbEhlYWRlcnModGhyZWFkLm1lc3NhZ2VzW3RocmVhZC5tZXNzYWdlcy5sZW5ndGggLSAxXS5pZCkpXG4gIC8vIHRoZW4gdGhlIHJlc3Qgb2YgdGhlIHByb21pc2VzIHdpbGwgYmUgcmF3IG1lc3NhZ2UgcmVxdWVzdHNcbiAgLy8gdGhlc2UgYXJlIHNlcGFyYXRlIHJlcXVlc3RzIGJlY2F1c2UgRm9ybWF0IGNhbm5vdCBiZSB1c2VkIHdoZW4gYWNjZXNzaW5nIHRoZSBhcGkgdXNpbmcgdGhlIGdtYWlsLm1ldGFkYXRhIHNjb3BlLlxuICAvLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZ21haWwvYXBpL3YxL3JlZmVyZW5jZS91c2Vycy9tZXNzYWdlcy9nZXQgZm9yIG1vcmUgZGV0YWlsc1xuICB0aHJlYWQubWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgIHByb21pc2VzLnB1c2goZ2V0UmF3TWVzc2FnZShtZXNzYWdlLmlkKSlcbiAgfSlcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKVxufVxuXG4vKipcbiogRm9yd2FyZCBhIFJGQzgyMiBmb3JtYXR0ZWQgbWVzc2FnZVxuKiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9nbWFpbC9hcGkvdjEvcmVmZXJlbmNlL3VzZXJzL21lc3NhZ2VzL3NlbmRcbiogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZ21haWwvYXBpL2d1aWRlcy91cGxvYWRzI211bHRpcGFydFxuKiBAcGFyYW0gbWVzc2FnZSB0byBzZW5kXG4qIEByZXR1cm5zIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2dtYWlsL2FwaS92MS9yZWZlcmVuY2UvdXNlcnMvbWVzc2FnZXMjcmVzb3VyY2VcbiovXG5leHBvcnQgZnVuY3Rpb24gc2VuZFJlcG9ydEVtYWlsVG9SZWNpcGllbnRzKG1lc3NhZ2UpIHtcbiAgcmV0dXJuIGNocm9tZXAuaWRlbnRpdHkuZ2V0QXV0aFRva2VuKHsgaW50ZXJhY3RpdmU6IGZhbHNlIH0pLnRoZW4oZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgbGV0IHVwbG9hZEVtYWlsVVJMID0gJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL3VwbG9hZC9nbWFpbC92MS91c2Vycy9tZS9tZXNzYWdlcy9zZW5kP3VwbG9hZFR5cGU9bXVsdGlwYXJ0J1xuICAgIGxldCBiZWFyZXJUb2tlbiA9IGBCZWFyZXIgJHt0b2tlbn1gXG4gICAgbGV0IGhlYWRlclNldCA9IHsgJ0F1dGhvcml6YXRpb24nOiBiZWFyZXJUb2tlbiwgJ0NvbnRlbnQtVHlwZSc6ICdtZXNzYWdlL3JmYzgyMicgfVxuICAgIGxldCBmZXRjaFBhcmFtcyA9IGdldEZldGNoUGFyYW1ldGVycygnUE9TVCcsIGhlYWRlclNldClcbiAgICAvLyBXZSBub3cgc2V0IHRoZSBib2R5IG9mIGZldGNoUGFyYW1zLlxuICAgIGZldGNoUGFyYW1zLmJvZHkgPSBtZXNzYWdlXG4gICAgLy8gV2Ugbm93IHVzZSBmZXRjaCB0byByZXF1ZXN0IHRoZSBkYXRhIHdlIG5lZWQuXG4gICAgcmV0dXJuIGZldGNoKHVwbG9hZEVtYWlsVVJMLCBmZXRjaFBhcmFtcykudGhlbigocmVzKSA9PiB7XG4gICAgICByZXR1cm4gcmVzLmpzb24oKVxuICAgIH0pLnRoZW4oKGpzb24pID0+IHtcbiAgICAgIC8vIFdlIHBhcnNlIHRoZSBzb24gaWYgaXQgY29tZXMgaW4gc3RyaW5nIGZvcm0uXG4gICAgICBpZiAodHlwZW9mIGpzb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGpzb24pXG4gICAgICB9XG4gICAgICByZXR1cm4ganNvblxuICAgIH0pXG4gIH0pXG59XG5cbi8qKlxuKiBHZXQgbWluaW11bSBNZXNzYWdlIERldGFpbHMgb3IgaW5mb3JtYXRpb24gdXNpbmcgR01BSUwgQVBJLlxuKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83MTMwNjQ4L2dldC11c2VyLWluZm8tdmlhLWdvb2dsZS1hcGlcbiogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VJRCBvZiB0aGUgbWVzc2FnZSBpbiB3aGljaCB3ZSBuZWVkIHRvIGdldCBpbmZvIGZvci5cbiogQHJldHVybnMgSlNPTi1ibG9iIGNvbnRhaW5pbmcgbmFtZSBhbmQgb3RoZXIgaW5mbyBvbiB0aGUgdXNlci5cbiovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWVzc2FnZURldGFpbHMobWVzc2FnZUlEKSB7XG4gIHJldHVybiBjaHJvbWVwLmlkZW50aXR5LmdldEF1dGhUb2tlbih7IGludGVyYWN0aXZlOiBmYWxzZSB9KS50aGVuKGZ1bmN0aW9uICh0b2tlbikge1xuICAgIHJldHVybiBnbWFpbEFQSVJlcXVlc3QoXG4gICAgICAnR0VUJyxcbiAgICAgIEdNQUlMX0FQSV9NRVNTQUdFUyArIG1lc3NhZ2VJRCxcbiAgICAgIHRva2VuLFxuICAgICAgeyBmb3JtYXQ6ICdtaW5pbWFsJyB9XG4gICAgKVxuICB9KVxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9