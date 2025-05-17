"use strict";
(self["webpackChunkspiritual_condition_tracker"] = self["webpackChunkspiritual_condition_tracker"] || []).push([["src_utils_capacitorStorage_js"],{

/***/ "./src/utils/capacitorStorage.js":
/*!***************************************!*\
  !*** ./src/utils/capacitorStorage.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   add: () => (/* binding */ add),
/* harmony export */   calculateDistance: () => (/* binding */ calculateDistance),
/* harmony export */   calculateSobrietyDays: () => (/* binding */ calculateSobrietyDays),
/* harmony export */   calculateSobrietyYears: () => (/* binding */ calculateSobrietyYears),
/* harmony export */   calculateSpiritualFitness: () => (/* binding */ calculateSpiritualFitness),
/* harmony export */   calculateSpiritualFitnessWithTimeframe: () => (/* binding */ calculateSpiritualFitnessWithTimeframe),
/* harmony export */   getAll: () => (/* binding */ getAll),
/* harmony export */   getById: () => (/* binding */ getById),
/* harmony export */   getPreference: () => (/* binding */ getPreference),
/* harmony export */   hasLocalStorageData: () => (/* binding */ hasLocalStorageData),
/* harmony export */   initDatabase: () => (/* binding */ initDatabase),
/* harmony export */   migrateFromLocalStorage: () => (/* binding */ migrateFromLocalStorage),
/* harmony export */   query: () => (/* binding */ query),
/* harmony export */   remove: () => (/* binding */ remove),
/* harmony export */   setPreference: () => (/* binding */ setPreference),
/* harmony export */   setupGlobalDbObject: () => (/* binding */ setupGlobalDbObject),
/* harmony export */   update: () => (/* binding */ update)
/* harmony export */ });
/* harmony import */ var _ionic_react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ionic/react */ "./node_modules/@ionic/react/dist/index.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return r; }; var t, r = {}, e = Object.prototype, n = e.hasOwnProperty, o = "function" == typeof Symbol ? Symbol : {}, i = o.iterator || "@@iterator", a = o.asyncIterator || "@@asyncIterator", u = o.toStringTag || "@@toStringTag"; function c(t, r, e, n) { return Object.defineProperty(t, r, { value: e, enumerable: !n, configurable: !n, writable: !n }); } try { c({}, ""); } catch (t) { c = function c(t, r, e) { return t[r] = e; }; } function h(r, e, n, o) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype); return c(a, "_invoke", function (r, e, n) { var o = 1; return function (i, a) { if (3 === o) throw Error("Generator is already running"); if (4 === o) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var u = n.delegate; if (u) { var c = d(u, n); if (c) { if (c === f) continue; return c; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (1 === o) throw o = 4, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = 3; var h = s(r, e, n); if ("normal" === h.type) { if (o = n.done ? 4 : 2, h.arg === f) continue; return { value: h.arg, done: n.done }; } "throw" === h.type && (o = 4, n.method = "throw", n.arg = h.arg); } }; }(r, n, new Context(o || [])), !0), a; } function s(t, r, e) { try { return { type: "normal", arg: t.call(r, e) }; } catch (t) { return { type: "throw", arg: t }; } } r.wrap = h; var f = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var l = {}; c(l, i, function () { return this; }); var p = Object.getPrototypeOf, y = p && p(p(x([]))); y && y !== e && n.call(y, i) && (l = y); var v = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(l); function g(t) { ["next", "throw", "return"].forEach(function (r) { c(t, r, function (t) { return this._invoke(r, t); }); }); } function AsyncIterator(t, r) { function e(o, i, a, u) { var c = s(t[o], t, i); if ("throw" !== c.type) { var h = c.arg, f = h.value; return f && "object" == _typeof(f) && n.call(f, "__await") ? r.resolve(f.__await).then(function (t) { e("next", t, a, u); }, function (t) { e("throw", t, a, u); }) : r.resolve(f).then(function (t) { h.value = t, a(h); }, function (t) { return e("throw", t, a, u); }); } u(c.arg); } var o; c(this, "_invoke", function (t, n) { function i() { return new r(function (r, o) { e(t, n, r, o); }); } return o = o ? o.then(i, i) : i(); }, !0); } function d(r, e) { var n = e.method, o = r.i[n]; if (o === t) return e.delegate = null, "throw" === n && r.i["return"] && (e.method = "return", e.arg = t, d(r, e), "throw" === e.method) || "return" !== n && (e.method = "throw", e.arg = new TypeError("The iterator does not provide a '" + n + "' method")), f; var i = s(o, r.i, e.arg); if ("throw" === i.type) return e.method = "throw", e.arg = i.arg, e.delegate = null, f; var a = i.arg; return a ? a.done ? (e[r.r] = a.value, e.next = r.n, "return" !== e.method && (e.method = "next", e.arg = t), e.delegate = null, f) : a : (e.method = "throw", e.arg = new TypeError("iterator result is not an object"), e.delegate = null, f); } function w(t) { this.tryEntries.push(t); } function m(r) { var e = r[4] || {}; e.type = "normal", e.arg = t, r[4] = e; } function Context(t) { this.tryEntries = [[-1]], t.forEach(w, this), this.reset(!0); } function x(r) { if (null != r) { var e = r[i]; if (e) return e.call(r); if ("function" == typeof r.next) return r; if (!isNaN(r.length)) { var o = -1, a = function e() { for (; ++o < r.length;) if (n.call(r, o)) return e.value = r[o], e.done = !1, e; return e.value = t, e.done = !0, e; }; return a.next = a; } } throw new TypeError(_typeof(r) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, c(v, "constructor", GeneratorFunctionPrototype), c(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = c(GeneratorFunctionPrototype, u, "GeneratorFunction"), r.isGeneratorFunction = function (t) { var r = "function" == typeof t && t.constructor; return !!r && (r === GeneratorFunction || "GeneratorFunction" === (r.displayName || r.name)); }, r.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, c(t, u, "GeneratorFunction")), t.prototype = Object.create(v), t; }, r.awrap = function (t) { return { __await: t }; }, g(AsyncIterator.prototype), c(AsyncIterator.prototype, a, function () { return this; }), r.AsyncIterator = AsyncIterator, r.async = function (t, e, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(h(t, e, n, o), i); return r.isGeneratorFunction(e) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, g(v), c(v, u, "Generator"), c(v, i, function () { return this; }), c(v, "toString", function () { return "[object Generator]"; }), r.keys = function (t) { var r = Object(t), e = []; for (var n in r) e.unshift(n); return function t() { for (; e.length;) if ((n = e.pop()) in r) return t.value = n, t.done = !1, t; return t.done = !0, t; }; }, r.values = x, Context.prototype = { constructor: Context, reset: function reset(r) { if (this.prev = this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(m), !r) for (var e in this) "t" === e.charAt(0) && n.call(this, e) && !isNaN(+e.slice(1)) && (this[e] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0][4]; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(r) { if (this.done) throw r; var e = this; function n(t) { a.type = "throw", a.arg = r, e.next = t; } for (var o = e.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i[4], u = this.prev, c = i[1], h = i[2]; if (-1 === i[0]) return n("end"), !1; if (!c && !h) throw Error("try statement without catch or finally"); if (null != i[0] && i[0] <= u) { if (u < c) return this.method = "next", this.arg = t, n(c), !0; if (u < h) return n(h), !1; } } }, abrupt: function abrupt(t, r) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var n = this.tryEntries[e]; if (n[0] > -1 && n[0] <= this.prev && this.prev < n[2]) { var o = n; break; } } o && ("break" === t || "continue" === t) && o[0] <= r && r <= o[2] && (o = null); var i = o ? o[4] : {}; return i.type = t, i.arg = r, o ? (this.method = "next", this.next = o[2], f) : this.complete(i); }, complete: function complete(t, r) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && r && (this.next = r), f; }, finish: function finish(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[2] === t) return this.complete(e[4], e[3]), m(e), f; } }, "catch": function _catch(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[0] === t) { var n = e[4]; if ("throw" === n.type) { var o = n.arg; m(e); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(r, e, n) { return this.delegate = { i: x(r), r: e, n: n }, "next" === this.method && (this.arg = t), f; } }, r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * Capacitor-compatible SQLite storage implementation
 * Optimized for native iOS and Android compiled apps
 */



// Database connection
var db = null;
var sqlitePlugin = null;

/**
 * Initialize the database connection
 * @returns {Promise<boolean>} Whether initialization was successful
 */
function initDatabase() {
  return _initDatabase.apply(this, arguments);
}

/**
 * Create a fallback using localStorage if SQLite is not available
 */
function _initDatabase() {
  _initDatabase = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var _yield$import, CapacitorSQLite;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          console.log("Initializing SQLite database for Capacitor...");
          _context.prev = 1;
          if (!((0,_ionic_react__WEBPACK_IMPORTED_MODULE_0__.isPlatform)('capacitor') || (0,_ionic_react__WEBPACK_IMPORTED_MODULE_0__.isPlatform)('cordova'))) {
            _context.next = 18;
            break;
          }
          console.log("Using native SQLite implementation via Capacitor");

          // For Capacitor
          if (!(0,_ionic_react__WEBPACK_IMPORTED_MODULE_0__.isPlatform)('capacitor')) {
            _context.next = 12;
            break;
          }
          _context.next = 7;
          return __webpack_require__.e(/*! import() */ "vendors-node_modules_capacitor-community_sqlite_dist_esm_index_js").then(__webpack_require__.bind(__webpack_require__, /*! @capacitor-community/sqlite */ "./node_modules/@capacitor-community/sqlite/dist/esm/index.js"));
        case 7:
          _yield$import = _context.sent;
          CapacitorSQLite = _yield$import.CapacitorSQLite;
          sqlitePlugin = CapacitorSQLite;
          _context.next = 13;
          break;
        case 12:
          sqlitePlugin = window.sqlitePlugin;
        case 13:
          _context.next = 15;
          return sqlitePlugin.openDatabase({
            name: 'spiritualTracker.db',
            location: 'default'
          });
        case 15:
          db = _context.sent;
          _context.next = 26;
          break;
        case 18:
          if (!window.openDatabase) {
            _context.next = 23;
            break;
          }
          console.log("Using WebSQL implementation for browser");
          db = window.openDatabase('spiritualTracker.db', '1.0', 'Spiritual Condition Tracker Database', 5 * 1024 * 1024 // 5MB
          );
          _context.next = 26;
          break;
        case 23:
          console.warn("SQLite not available - using localStorage fallback");
          setupLocalStorageFallback();
          return _context.abrupt("return", false);
        case 26:
          _context.next = 28;
          return createTables();
        case 28:
          console.log("SQLite database initialized successfully");
          return _context.abrupt("return", true);
        case 32:
          _context.prev = 32;
          _context.t0 = _context["catch"](1);
          console.error("Error initializing database:", _context.t0);
          setupLocalStorageFallback();
          return _context.abrupt("return", false);
        case 37:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[1, 32]]);
  }));
  return _initDatabase.apply(this, arguments);
}
function setupLocalStorageFallback() {
  console.log("Setting up localStorage fallback for data persistence");

  // Create an object that mimics SQLite interface but uses localStorage
  db = {
    transaction: function transaction(fn) {
      var tx = {
        executeSql: function executeSql(query, params, successCallback, errorCallback) {
          try {
            // Very simplified SQL parsing - handle only basic operations
            var queryLower = query.toLowerCase().trim();
            if (queryLower.startsWith('create table')) {
              // For create table, just do nothing as localStorage doesn't need tables
              successCallback({}, {
                rows: {
                  length: 0
                }
              });
            } else if (queryLower.startsWith('select')) {
              handleLocalStorageSelect(queryLower, params, successCallback, errorCallback);
            } else if (queryLower.startsWith('insert')) {
              handleLocalStorageInsert(queryLower, params, successCallback, errorCallback);
            } else if (queryLower.startsWith('update')) {
              handleLocalStorageUpdate(queryLower, params, successCallback, errorCallback);
            } else if (queryLower.startsWith('delete')) {
              handleLocalStorageDelete(queryLower, params, successCallback, errorCallback);
            } else {
              // Unknown query
              console.warn("Unsupported SQL query for localStorage:", query);
              successCallback({}, {
                rows: {
                  length: 0
                }
              });
            }
          } catch (error) {
            console.error("Error in localStorage fallback:", error);
            if (errorCallback) errorCallback({}, error);
          }
        }
      };
      fn(tx);
    }
  };

  // Helper functions for localStorage operations
  function getCollection(name) {
    return JSON.parse(localStorage.getItem(name) || '[]');
  }
  function saveCollection(name, data) {
    localStorage.setItem(name, JSON.stringify(data));
  }
  function handleLocalStorageSelect(query, params, successCallback) {
    // Extract table name (very simplified parser)
    var fromMatch = query.match(/from\s+([^\s,)]+)/i);
    if (!fromMatch) {
      throw new Error("Invalid SELECT query: " + query);
    }
    var tableName = fromMatch[1];
    var items = getCollection(tableName);

    // Handle WHERE clause (very simplified)
    var whereMatch = query.match(/where\s+([^\s]+)\s*=\s*\?/i);
    if (whereMatch && params.length > 0) {
      var fieldName = whereMatch[1];
      items = items.filter(function (item) {
        return item[fieldName] === params[0];
      });
    }

    // Create a result object with a row-like interface
    var result = {
      rows: {
        length: items.length,
        item: function item(index) {
          return items[index];
        },
        _array: items
      }
    };
    successCallback({}, result);
  }
  function handleLocalStorageInsert(query, params, successCallback) {
    // Extract table name (very simplified parser)
    var intoMatch = query.match(/into\s+([^\s(]+)/i);
    if (!intoMatch) {
      throw new Error("Invalid INSERT query: " + query);
    }
    var tableName = intoMatch[1];

    // Construct an object from params (very simplified)
    var item = constructItemFromParams(tableName, params);

    // Add to collection
    var items = getCollection(tableName);
    items.push(item);
    saveCollection(tableName, items);
    successCallback({}, {
      insertId: item.id,
      rowsAffected: 1
    });
  }
  function handleLocalStorageUpdate(query, params, successCallback) {
    // Extract table name (very simplified parser)
    var updateMatch = query.match(/update\s+([^\s]+)/i);
    var whereMatch = query.match(/where\s+([^\s]+)\s*=\s*\?/i);
    if (!updateMatch || !whereMatch) {
      throw new Error("Invalid UPDATE query: " + query);
    }
    var tableName = updateMatch[1];
    var fieldName = whereMatch[1];
    var fieldValue = params[params.length - 1]; // assuming last param is the ID

    var items = getCollection(tableName);
    var index = items.findIndex(function (item) {
      return item[fieldName] === fieldValue;
    });
    if (index === -1) {
      successCallback({}, {
        rowsAffected: 0
      });
      return;
    }

    // Update the item
    var updatedItem = constructItemFromParams(tableName, params, items[index]);
    items[index] = updatedItem;
    saveCollection(tableName, items);
    successCallback({}, {
      rowsAffected: 1
    });
  }
  function handleLocalStorageDelete(query, params, successCallback) {
    // Extract table name (very simplified parser)
    var fromMatch = query.match(/from\s+([^\s]+)/i);
    var whereMatch = query.match(/where\s+([^\s]+)\s*=\s*\?/i);
    if (!fromMatch || !whereMatch) {
      throw new Error("Invalid DELETE query: " + query);
    }
    var tableName = fromMatch[1];
    var fieldName = whereMatch[1];
    var fieldValue = params[0];
    var items = getCollection(tableName);
    var filteredItems = items.filter(function (item) {
      return item[fieldName] !== fieldValue;
    });
    if (filteredItems.length === items.length) {
      successCallback({}, {
        rowsAffected: 0
      });
      return;
    }
    saveCollection(tableName, filteredItems);
    successCallback({}, {
      rowsAffected: 1
    });
  }
  function constructItemFromParams(tableName, params) {
    var existingItem = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // Very simplified approach - in a real implementation you would
    // parse column names from the query

    // This is just a basic implementation to make it work
    var item = _objectSpread({}, existingItem);

    // Set some fields based on table and params
    if (tableName === 'users' && params.length >= 3) {
      item.id = params[0] || existingItem.id || "user_".concat(Date.now());
      item.name = params[1] || existingItem.name;
      item.lastName = params[2] || existingItem.lastName;
      // Add more fields as needed
    } else if (tableName === 'activities' && params.length >= 3) {
      item.id = params[0] || existingItem.id || "activity_".concat(Date.now());
      item.type = params[1] || existingItem.type;
      item.duration = params[2] || existingItem.duration;
      // Add more fields as needed
    }
    // Add more tables as needed

    return item;
  }
}

/**
 * Create database tables
 */
function createTables() {
  return _createTables.apply(this, arguments);
}
/**
 * Execute a SQL query
 * @param {string} query - The SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<any>} Query result
 */
function _createTables() {
  _createTables = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var tableQueries, _i, _tableQueries, _query2;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          if (db) {
            _context2.next = 2;
            break;
          }
          return _context2.abrupt("return");
        case 2:
          // Define table creation queries
          tableQueries = ["CREATE TABLE IF NOT EXISTS users (\n      id TEXT PRIMARY KEY,\n      name TEXT,\n      lastName TEXT,\n      phoneNumber TEXT,\n      email TEXT,\n      sobrietyDate TEXT,\n      homeGroups TEXT,\n      privacySettings TEXT,\n      preferences TEXT,\n      sponsor TEXT,\n      sponsees TEXT,\n      messagingKeys TEXT,\n      createdAt TEXT,\n      updatedAt TEXT\n    )", "CREATE TABLE IF NOT EXISTS activities (\n      id TEXT PRIMARY KEY,\n      type TEXT NOT NULL,\n      duration INTEGER,\n      date TEXT,\n      notes TEXT,\n      meeting TEXT,\n      createdAt TEXT,\n      updatedAt TEXT\n    )", "CREATE TABLE IF NOT EXISTS meetings (\n      id TEXT PRIMARY KEY,\n      name TEXT NOT NULL,\n      days TEXT,\n      time TEXT,\n      schedule TEXT,\n      address TEXT,\n      locationName TEXT,\n      streetAddress TEXT,\n      city TEXT,\n      state TEXT,\n      zipCode TEXT,\n      coordinates TEXT,\n      createdAt TEXT,\n      updatedAt TEXT\n    )", "CREATE TABLE IF NOT EXISTS messages (\n      id TEXT PRIMARY KEY,\n      senderId TEXT,\n      recipientId TEXT,\n      content TEXT,\n      encrypted INTEGER,\n      timestamp TEXT,\n      read INTEGER\n    )", "CREATE TABLE IF NOT EXISTS preferences (\n      id TEXT PRIMARY KEY,\n      value TEXT,\n      createdAt TEXT,\n      updatedAt TEXT\n    )"]; // Execute each table creation query
          _i = 0, _tableQueries = tableQueries;
        case 4:
          if (!(_i < _tableQueries.length)) {
            _context2.next = 11;
            break;
          }
          _query2 = _tableQueries[_i];
          _context2.next = 8;
          return executeQuery(_query2);
        case 8:
          _i++;
          _context2.next = 4;
          break;
        case 11:
          console.log("All database tables created successfully");
        case 12:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _createTables.apply(this, arguments);
}
function executeQuery(query) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return new Promise(function (resolve, reject) {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }
    db.transaction(function (tx) {
      tx.executeSql(query, params, function (_, result) {
        return resolve(result);
      }, function (_, error) {
        console.error("SQL Error:", error);
        reject(error);
        return false;
      });
    });
  });
}

/**
 * Get all items from a collection
 * @param {string} collection - The collection name
 * @returns {Promise<Array>} All items in the collection
 */
function getAll(_x) {
  return _getAll.apply(this, arguments);
}

/**
 * Get an item by ID from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Promise<Object|null>} The found item or null
 */
function _getAll() {
  _getAll = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(collection) {
    var result, items, len, i, item;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return executeQuery("SELECT * FROM ".concat(collection));
        case 3:
          result = _context3.sent;
          items = [];
          len = result.rows.length;
          for (i = 0; i < len; i++) {
            item = result.rows.item(i); // Parse JSON fields based on collection type
            if (collection === 'users') {
              item.privacySettings = JSON.parse(item.privacySettings || '{}');
              item.preferences = JSON.parse(item.preferences || '{}');
              item.homeGroups = JSON.parse(item.homeGroups || '[]');
              item.sponsor = JSON.parse(item.sponsor || 'null');
              item.sponsees = JSON.parse(item.sponsees || '[]');
              item.messagingKeys = JSON.parse(item.messagingKeys || '{}');
            } else if (collection === 'meetings') {
              item.days = JSON.parse(item.days || '[]');
              item.schedule = JSON.parse(item.schedule || '[]');
              item.coordinates = JSON.parse(item.coordinates || 'null');
            } else if (collection === 'preferences') {
              item.value = JSON.parse(item.value || 'null');
            }
            items.push(item);
          }
          return _context3.abrupt("return", items);
        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](0);
          console.error("Error getting all items from ".concat(collection, ":"), _context3.t0);
          return _context3.abrupt("return", []);
        case 14:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 10]]);
  }));
  return _getAll.apply(this, arguments);
}
function getById(_x2, _x3) {
  return _getById.apply(this, arguments);
}

/**
 * Add an item to a collection
 * @param {string} collection - The collection name
 * @param {Object} item - The item to add
 * @returns {Promise<Object>} The added item
 */
function _getById() {
  _getById = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(collection, id) {
    var result, item;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return executeQuery("SELECT * FROM ".concat(collection, " WHERE id = ?"), [id]);
        case 3:
          result = _context4.sent;
          if (!(result.rows.length === 0)) {
            _context4.next = 6;
            break;
          }
          return _context4.abrupt("return", null);
        case 6:
          item = result.rows.item(0); // Parse JSON fields based on collection type
          if (collection === 'users') {
            item.privacySettings = JSON.parse(item.privacySettings || '{}');
            item.preferences = JSON.parse(item.preferences || '{}');
            item.homeGroups = JSON.parse(item.homeGroups || '[]');
            item.sponsor = JSON.parse(item.sponsor || 'null');
            item.sponsees = JSON.parse(item.sponsees || '[]');
            item.messagingKeys = JSON.parse(item.messagingKeys || '{}');
          } else if (collection === 'meetings') {
            item.days = JSON.parse(item.days || '[]');
            item.schedule = JSON.parse(item.schedule || '[]');
            item.coordinates = JSON.parse(item.coordinates || 'null');
          } else if (collection === 'preferences') {
            item.value = JSON.parse(item.value || 'null');
          }
          return _context4.abrupt("return", item);
        case 11:
          _context4.prev = 11;
          _context4.t0 = _context4["catch"](0);
          console.error("Error getting item by ID from ".concat(collection, ":"), _context4.t0);
          return _context4.abrupt("return", null);
        case 15:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 11]]);
  }));
  return _getById.apply(this, arguments);
}
function add(_x4, _x5) {
  return _add.apply(this, arguments);
}

/**
 * Update an item in a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object|null>} The updated item or null if not found
 */
function _add() {
  _add = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(collection, item) {
    var now, columns, placeholders, values, privacySettings, preferences, homeGroups, sponsor, sponsees, messagingKeys, days, schedule, coordinates;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          // Generate ID if not provided
          if (!item.id) {
            item.id = "".concat(collection.slice(0, -1), "_").concat(Date.now());
          }

          // Add timestamps
          now = new Date().toISOString();
          item.createdAt = item.createdAt || now;
          item.updatedAt = now;

          // Prepare item based on collection type
          if (!(collection === 'users')) {
            _context5.next = 17;
            break;
          }
          privacySettings = JSON.stringify(item.privacySettings || {});
          preferences = JSON.stringify(item.preferences || {});
          homeGroups = JSON.stringify(item.homeGroups || []);
          sponsor = JSON.stringify(item.sponsor || null);
          sponsees = JSON.stringify(item.sponsees || []);
          messagingKeys = JSON.stringify(item.messagingKeys || {});
          columns = 'id, name, lastName, phoneNumber, email, sobrietyDate, homeGroups, privacySettings, preferences, sponsor, sponsees, messagingKeys, createdAt, updatedAt';
          placeholders = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
          values = [item.id, item.name, item.lastName, item.phoneNumber, item.email, item.sobrietyDate, homeGroups, privacySettings, preferences, sponsor, sponsees, messagingKeys, item.createdAt, item.updatedAt];
          _context5.next = 45;
          break;
        case 17:
          if (!(collection === 'activities')) {
            _context5.next = 23;
            break;
          }
          columns = 'id, type, duration, date, notes, meeting, createdAt, updatedAt';
          placeholders = '?, ?, ?, ?, ?, ?, ?, ?';
          values = [item.id, item.type, item.duration, item.date, item.notes, item.meeting, item.createdAt, item.updatedAt];
          _context5.next = 45;
          break;
        case 23:
          if (!(collection === 'meetings')) {
            _context5.next = 32;
            break;
          }
          days = JSON.stringify(item.days || []);
          schedule = JSON.stringify(item.schedule || []);
          coordinates = JSON.stringify(item.coordinates || null);
          columns = 'id, name, days, time, schedule, address, locationName, streetAddress, city, state, zipCode, coordinates, createdAt, updatedAt';
          placeholders = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
          values = [item.id, item.name, days, item.time, schedule, item.address, item.locationName, item.streetAddress, item.city, item.state, item.zipCode, coordinates, item.createdAt, item.updatedAt];
          _context5.next = 45;
          break;
        case 32:
          if (!(collection === 'messages')) {
            _context5.next = 38;
            break;
          }
          columns = 'id, senderId, recipientId, content, encrypted, timestamp, read';
          placeholders = '?, ?, ?, ?, ?, ?, ?';
          values = [item.id, item.senderId, item.recipientId, item.content, item.encrypted ? 1 : 0, item.timestamp, item.read ? 1 : 0];
          _context5.next = 45;
          break;
        case 38:
          if (!(collection === 'preferences')) {
            _context5.next = 44;
            break;
          }
          columns = 'id, value, createdAt, updatedAt';
          placeholders = '?, ?, ?, ?';
          values = [item.id, JSON.stringify(item.value), item.createdAt, item.updatedAt];
          _context5.next = 45;
          break;
        case 44:
          throw new Error("Unknown collection: ".concat(collection));
        case 45:
          _context5.next = 47;
          return executeQuery("INSERT INTO ".concat(collection, " (").concat(columns, ") VALUES (").concat(placeholders, ")"), values);
        case 47:
          console.log("Added item to ".concat(collection, " with ID: ").concat(item.id));
          return _context5.abrupt("return", item);
        case 51:
          _context5.prev = 51;
          _context5.t0 = _context5["catch"](0);
          console.error("Error adding item to ".concat(collection, ":"), _context5.t0);
          throw _context5.t0;
        case 55:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 51]]);
  }));
  return _add.apply(this, arguments);
}
function update(_x6, _x7, _x8) {
  return _update.apply(this, arguments);
}

/**
 * Remove an item from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The item ID
 * @returns {Promise<boolean>} Whether the item was removed
 */
function _update() {
  _update = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(collection, id, updates) {
    var existingItem, updatedItem, setClauses, values, privacySettings, preferences, homeGroups, sponsor, sponsees, messagingKeys, days, schedule, coordinates, result;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          // Update timestamp
          updates.updatedAt = new Date().toISOString();

          // Get the existing item first
          _context6.next = 4;
          return getById(collection, id);
        case 4:
          existingItem = _context6.sent;
          if (existingItem) {
            _context6.next = 8;
            break;
          }
          console.log("Item with ID ".concat(id, " not found in ").concat(collection));
          return _context6.abrupt("return", null);
        case 8:
          // Merge existing item with updates
          updatedItem = _objectSpread(_objectSpread({}, existingItem), updates); // Prepare update based on collection type
          if (!(collection === 'users')) {
            _context6.next = 20;
            break;
          }
          privacySettings = JSON.stringify(updatedItem.privacySettings || {});
          preferences = JSON.stringify(updatedItem.preferences || {});
          homeGroups = JSON.stringify(updatedItem.homeGroups || []);
          sponsor = JSON.stringify(updatedItem.sponsor || null);
          sponsees = JSON.stringify(updatedItem.sponsees || []);
          messagingKeys = JSON.stringify(updatedItem.messagingKeys || {});
          setClauses = 'name = ?, lastName = ?, phoneNumber = ?, email = ?, sobrietyDate = ?, homeGroups = ?, privacySettings = ?, preferences = ?, sponsor = ?, sponsees = ?, messagingKeys = ?, updatedAt = ?';
          values = [updatedItem.name, updatedItem.lastName, updatedItem.phoneNumber, updatedItem.email, updatedItem.sobrietyDate, homeGroups, privacySettings, preferences, sponsor, sponsees, messagingKeys, updatedItem.updatedAt, id];
          _context6.next = 44;
          break;
        case 20:
          if (!(collection === 'activities')) {
            _context6.next = 25;
            break;
          }
          setClauses = 'type = ?, duration = ?, date = ?, notes = ?, meeting = ?, updatedAt = ?';
          values = [updatedItem.type, updatedItem.duration, updatedItem.date, updatedItem.notes, updatedItem.meeting, updatedItem.updatedAt, id];
          _context6.next = 44;
          break;
        case 25:
          if (!(collection === 'meetings')) {
            _context6.next = 33;
            break;
          }
          days = JSON.stringify(updatedItem.days || []);
          schedule = JSON.stringify(updatedItem.schedule || []);
          coordinates = JSON.stringify(updatedItem.coordinates || null);
          setClauses = 'name = ?, days = ?, time = ?, schedule = ?, address = ?, locationName = ?, streetAddress = ?, city = ?, state = ?, zipCode = ?, coordinates = ?, updatedAt = ?';
          values = [updatedItem.name, days, updatedItem.time, schedule, updatedItem.address, updatedItem.locationName, updatedItem.streetAddress, updatedItem.city, updatedItem.state, updatedItem.zipCode, coordinates, updatedItem.updatedAt, id];
          _context6.next = 44;
          break;
        case 33:
          if (!(collection === 'messages')) {
            _context6.next = 38;
            break;
          }
          setClauses = 'content = ?, encrypted = ?, read = ?';
          values = [updatedItem.content, updatedItem.encrypted ? 1 : 0, updatedItem.read ? 1 : 0, id];
          _context6.next = 44;
          break;
        case 38:
          if (!(collection === 'preferences')) {
            _context6.next = 43;
            break;
          }
          setClauses = 'value = ?, updatedAt = ?';
          values = [JSON.stringify(updatedItem.value), updatedItem.updatedAt, id];
          _context6.next = 44;
          break;
        case 43:
          throw new Error("Unknown collection: ".concat(collection));
        case 44:
          _context6.next = 46;
          return executeQuery("UPDATE ".concat(collection, " SET ").concat(setClauses, " WHERE id = ?"), values);
        case 46:
          result = _context6.sent;
          if (!(result.rowsAffected === 0)) {
            _context6.next = 50;
            break;
          }
          console.log("No rows affected when updating ".concat(collection, " with ID: ").concat(id));
          return _context6.abrupt("return", null);
        case 50:
          console.log("Updated item in ".concat(collection, " with ID: ").concat(id));
          return _context6.abrupt("return", updatedItem);
        case 54:
          _context6.prev = 54;
          _context6.t0 = _context6["catch"](0);
          console.error("Error updating item in ".concat(collection, ":"), _context6.t0);
          throw _context6.t0;
        case 58:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 54]]);
  }));
  return _update.apply(this, arguments);
}
function remove(_x9, _x0) {
  return _remove.apply(this, arguments);
}

/**
 * Query items in a collection
 * @param {string} collection - The collection name
 * @param {Function} predicate - Filter function
 * @returns {Promise<Array>} Filtered items
 */
function _remove() {
  _remove = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(collection, id) {
    var result, success;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return executeQuery("DELETE FROM ".concat(collection, " WHERE id = ?"), [id]);
        case 3:
          result = _context7.sent;
          success = result.rowsAffected > 0;
          if (success) {
            console.log("Removed item from ".concat(collection, " with ID: ").concat(id));
          } else {
            console.log("No item found in ".concat(collection, " with ID: ").concat(id));
          }
          return _context7.abrupt("return", success);
        case 9:
          _context7.prev = 9;
          _context7.t0 = _context7["catch"](0);
          console.error("Error removing item from ".concat(collection, ":"), _context7.t0);
          return _context7.abrupt("return", false);
        case 13:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 9]]);
  }));
  return _remove.apply(this, arguments);
}
function query(_x1, _x10) {
  return _query.apply(this, arguments);
}

/**
 * Get user preference
 * @param {string} key - The preference key
 * @returns {Promise<any>} The preference value
 */
function _query() {
  _query = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(collection, predicate) {
    var items;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return getAll(collection);
        case 3:
          items = _context8.sent;
          return _context8.abrupt("return", items.filter(predicate));
        case 7:
          _context8.prev = 7;
          _context8.t0 = _context8["catch"](0);
          console.error("Error querying ".concat(collection, ":"), _context8.t0);
          return _context8.abrupt("return", []);
        case 11:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[0, 7]]);
  }));
  return _query.apply(this, arguments);
}
function getPreference(_x11) {
  return _getPreference.apply(this, arguments);
}

/**
 * Set user preference
 * @param {string} key - The preference key
 * @param {any} value - The preference value
 * @returns {Promise<void>}
 */
function _getPreference() {
  _getPreference = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(key) {
    var preference;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          _context9.next = 3;
          return getById('preferences', key);
        case 3:
          preference = _context9.sent;
          return _context9.abrupt("return", preference === null || preference === void 0 ? void 0 : preference.value);
        case 7:
          _context9.prev = 7;
          _context9.t0 = _context9["catch"](0);
          console.error("Error getting preference ".concat(key, ":"), _context9.t0);
          return _context9.abrupt("return", null);
        case 11:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 7]]);
  }));
  return _getPreference.apply(this, arguments);
}
function setPreference(_x12, _x13) {
  return _setPreference.apply(this, arguments);
}

/**
 * Calculate spiritual fitness score
 * @param {Array} activities - The activities array
 * @param {number} timeframe - Timeframe in days (default: 30)
 * @returns {Promise<number>} Spiritual fitness score
 */
function _setPreference() {
  _setPreference = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee0(key, value) {
    var now, preference, existingPref;
    return _regeneratorRuntime().wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.prev = 0;
          now = new Date().toISOString();
          preference = {
            id: key,
            value: value,
            createdAt: now,
            updatedAt: now
          }; // Check if preference exists
          _context0.next = 5;
          return getById('preferences', key);
        case 5:
          existingPref = _context0.sent;
          if (!existingPref) {
            _context0.next = 11;
            break;
          }
          _context0.next = 9;
          return update('preferences', key, {
            value: value,
            updatedAt: now
          });
        case 9:
          _context0.next = 13;
          break;
        case 11:
          _context0.next = 13;
          return add('preferences', preference);
        case 13:
          _context0.next = 18;
          break;
        case 15:
          _context0.prev = 15;
          _context0.t0 = _context0["catch"](0);
          console.error("Error setting preference ".concat(key, ":"), _context0.t0);
        case 18:
        case "end":
          return _context0.stop();
      }
    }, _callee0, null, [[0, 15]]);
  }));
  return _setPreference.apply(this, arguments);
}
function calculateSpiritualFitness(_x14) {
  return _calculateSpiritualFitness.apply(this, arguments);
}

/**
 * Calculate distance between two lat/long points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in miles
 */
function _calculateSpiritualFitness() {
  _calculateSpiritualFitness = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee1(activities) {
    var timeframe,
      storedTimeframe,
      calculationTimeframe,
      baseScore,
      score,
      now,
      cutoffDate,
      recentActivities,
      activityPoints,
      activityDayMap,
      daysWithActivities,
      consistencyPercentage,
      consistencyPoints,
      _args1 = arguments;
    return _regeneratorRuntime().wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          timeframe = _args1.length > 1 && _args1[1] !== undefined ? _args1[1] : 30;
          if (!(!activities || activities.length === 0)) {
            _context1.next = 3;
            break;
          }
          return _context1.abrupt("return", 20);
        case 3:
          _context1.prev = 3;
          _context1.next = 6;
          return getPreference('fitnessTimeframe');
        case 6:
          storedTimeframe = _context1.sent;
          calculationTimeframe = storedTimeframe ? parseInt(storedTimeframe, 10) : timeframe; // Start with a base score
          baseScore = 20;
          score = baseScore;
          now = new Date();
          cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - calculationTimeframe);

          // Filter activities to those within the timeframe
          recentActivities = activities.filter(function (activity) {
            return new Date(activity.date) >= cutoffDate && new Date(activity.date) <= now;
          });
          if (!(recentActivities.length === 0)) {
            _context1.next = 16;
            break;
          }
          return _context1.abrupt("return", baseScore);
        case 16:
          // Calculate points based on activities
          activityPoints = Math.min(40, recentActivities.length * 2); // Cap at 40 points
          // Calculate consistency points
          // Group activities by day to check daily activity
          activityDayMap = {};
          recentActivities.forEach(function (activity) {
            var day = new Date(activity.date).toISOString().split('T')[0];
            if (!activityDayMap[day]) {
              activityDayMap[day] = [];
            }
            activityDayMap[day].push(activity);
          });

          // Count days with activities
          daysWithActivities = Object.keys(activityDayMap).length; // Calculate consistency as a percentage of the timeframe days
          consistencyPercentage = daysWithActivities / calculationTimeframe;
          consistencyPoints = Math.round(consistencyPercentage * 40); // Up to 40 points for consistency
          // Total score
          score = baseScore + activityPoints + consistencyPoints;

          // Ensure score doesn't exceed 100
          score = Math.min(100, score);

          // Round to 2 decimal places
          score = Math.round(score * 100) / 100;
          return _context1.abrupt("return", score);
        case 28:
          _context1.prev = 28;
          _context1.t0 = _context1["catch"](3);
          console.error('Error calculating spiritual fitness:', _context1.t0);
          return _context1.abrupt("return", 20);
        case 32:
        case "end":
          return _context1.stop();
      }
    }, _callee1, null, [[3, 28]]);
  }));
  return _calculateSpiritualFitness.apply(this, arguments);
}
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  var radlat1 = Math.PI * lat1 / 180;
  var radlat2 = Math.PI * lat2 / 180;
  var theta = lon1 - lon2;
  var radtheta = Math.PI * theta / 180;
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515; // Miles
  return dist;
}

/**
 * Check if there is data in localStorage to migrate
 * @returns {boolean} Whether localStorage contains data to migrate
 */
function hasLocalStorageData() {
  return !!(localStorage.getItem('user') || localStorage.getItem('activities') || localStorage.getItem('meetings') || localStorage.getItem('messages'));
}

/**
 * Migrate data from localStorage to the database
 * @returns {Promise<boolean>} Whether migration was successful
 */
function migrateFromLocalStorage() {
  return _migrateFromLocalStorage.apply(this, arguments);
}

/**
 * Set up global window.db object for backward compatibility
 * @returns {Object} The database interface
 */
/**
 * Calculate sobriety days based on sobriety date
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @returns {number} - Number of days sober
 */
function _migrateFromLocalStorage() {
  _migrateFromLocalStorage = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10() {
    var userData, activitiesData, _iterator, _step, activity, meetingsData, _iterator2, _step2, meeting, messagesData, _iterator3, _step3, message;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          console.log("Starting migration from localStorage to SQLite...");
          _context10.prev = 1;
          // Migrate user data
          userData = JSON.parse(localStorage.getItem('user'));
          if (!userData) {
            _context10.next = 7;
            break;
          }
          console.log("Migrating user data...");
          _context10.next = 7;
          return add('users', userData);
        case 7:
          // Migrate activities
          activitiesData = JSON.parse(localStorage.getItem('activities') || '[]');
          if (!(activitiesData.length > 0)) {
            _context10.next = 27;
            break;
          }
          console.log("Migrating ".concat(activitiesData.length, " activities..."));
          _iterator = _createForOfIteratorHelper(activitiesData);
          _context10.prev = 11;
          _iterator.s();
        case 13:
          if ((_step = _iterator.n()).done) {
            _context10.next = 19;
            break;
          }
          activity = _step.value;
          _context10.next = 17;
          return add('activities', activity);
        case 17:
          _context10.next = 13;
          break;
        case 19:
          _context10.next = 24;
          break;
        case 21:
          _context10.prev = 21;
          _context10.t0 = _context10["catch"](11);
          _iterator.e(_context10.t0);
        case 24:
          _context10.prev = 24;
          _iterator.f();
          return _context10.finish(24);
        case 27:
          // Migrate meetings
          meetingsData = JSON.parse(localStorage.getItem('meetings') || '[]');
          if (!(meetingsData.length > 0)) {
            _context10.next = 47;
            break;
          }
          console.log("Migrating ".concat(meetingsData.length, " meetings..."));
          _iterator2 = _createForOfIteratorHelper(meetingsData);
          _context10.prev = 31;
          _iterator2.s();
        case 33:
          if ((_step2 = _iterator2.n()).done) {
            _context10.next = 39;
            break;
          }
          meeting = _step2.value;
          _context10.next = 37;
          return add('meetings', meeting);
        case 37:
          _context10.next = 33;
          break;
        case 39:
          _context10.next = 44;
          break;
        case 41:
          _context10.prev = 41;
          _context10.t1 = _context10["catch"](31);
          _iterator2.e(_context10.t1);
        case 44:
          _context10.prev = 44;
          _iterator2.f();
          return _context10.finish(44);
        case 47:
          // Migrate messages
          messagesData = JSON.parse(localStorage.getItem('messages') || '[]');
          if (!(messagesData.length > 0)) {
            _context10.next = 67;
            break;
          }
          console.log("Migrating ".concat(messagesData.length, " messages..."));
          _iterator3 = _createForOfIteratorHelper(messagesData);
          _context10.prev = 51;
          _iterator3.s();
        case 53:
          if ((_step3 = _iterator3.n()).done) {
            _context10.next = 59;
            break;
          }
          message = _step3.value;
          _context10.next = 57;
          return add('messages', message);
        case 57:
          _context10.next = 53;
          break;
        case 59:
          _context10.next = 64;
          break;
        case 61:
          _context10.prev = 61;
          _context10.t2 = _context10["catch"](51);
          _iterator3.e(_context10.t2);
        case 64:
          _context10.prev = 64;
          _iterator3.f();
          return _context10.finish(64);
        case 67:
          console.log("Migration completed successfully!");
          return _context10.abrupt("return", true);
        case 71:
          _context10.prev = 71;
          _context10.t3 = _context10["catch"](1);
          console.error("Error during migration:", _context10.t3);
          return _context10.abrupt("return", false);
        case 75:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[1, 71], [11, 21, 24, 27], [31, 41, 44, 47], [51, 61, 64, 67]]);
  }));
  return _migrateFromLocalStorage.apply(this, arguments);
}
function calculateSobrietyDays(sobrietyDate) {
  if (!sobrietyDate) return 0;
  var startDate = new Date(sobrietyDate);
  var today = new Date();

  // Calculate difference in milliseconds
  var diffMs = today - startDate;

  // Convert to days
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate sobriety years with decimal precision
 * @param {string} sobrietyDate - Sobriety date in ISO format
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {number} - Years of sobriety with decimal precision
 */
function calculateSobrietyYears(sobrietyDate) {
  var decimalPlaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  if (!sobrietyDate) return 0;
  var startDate = new Date(sobrietyDate);
  var today = new Date();

  // Calculate difference in milliseconds
  var diffMs = today - startDate;

  // Calculate years with decimal precision
  var years = diffMs / (1000 * 60 * 60 * 24 * 365.25);

  // Round to specified decimal places
  return parseFloat(years.toFixed(decimalPlaces));
}

/**
 * Calculate spiritual fitness with a custom timeframe
 * @param {number} timeframe - Number of days to calculate score for (default 30)
 * @returns {number} - Spiritual fitness score (0-100)
 */
function calculateSpiritualFitnessWithTimeframe() {
  var timeframe = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30;
  console.log('calculateSpiritualFitnessWithTimeframe called with timeframe:', timeframe);

  // Start with a base score
  var baseScore = 20;
  try {
    // Check if we have any activities
    if (!window.db || !window.db.getAll) {
      console.warn('Database not properly initialized for calculateSpiritualFitnessWithTimeframe');
      return baseScore;
    }

    // Get all activities
    var activities = window.db.getAll('activities');
    console.log('Activities for fitness calculation:', activities);
    if (!activities || activities.length === 0) {
      console.log('No activities found, returning base score');
      return baseScore;
    }

    // Get current date and cutoff date
    var today = new Date();
    var cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - timeframe);

    // Filter recent activities
    var recentActivities = activities.filter(function (activity) {
      var activityDate = new Date(activity.date);
      return activityDate >= cutoffDate && activityDate <= today;
    });
    console.log('Recent activities within timeframe:', recentActivities.length);
    if (recentActivities.length === 0) {
      return baseScore;
    }

    // Calculate basic activity points (2 points per activity, max 40)
    var activityPoints = Math.min(40, recentActivities.length * 2);

    // Calculate consistency (days with activities / timeframe days)
    var activityDays = new Set();
    recentActivities.forEach(function (activity) {
      if (activity.date) {
        var day = new Date(activity.date).toISOString().split('T')[0];
        activityDays.add(day);
      }
    });
    var daysWithActivities = activityDays.size;
    var consistencyPercentage = daysWithActivities / timeframe;
    var consistencyPoints = Math.round(consistencyPercentage * 40);

    // Final score calculation
    var totalScore = Math.min(100, baseScore + activityPoints + consistencyPoints);
    console.log('Spiritual fitness calculation details:', {
      baseScore: baseScore,
      activityPoints: activityPoints,
      consistencyPoints: consistencyPoints,
      daysWithActivities: daysWithActivities,
      timeframe: timeframe,
      totalScore: totalScore
    });
    return totalScore;
  } catch (error) {
    console.error('Error in calculateSpiritualFitnessWithTimeframe:', error);
    return baseScore;
  }
}
function setupGlobalDbObject() {
  console.log('Setting up global db object with all necessary functions');
  window.db = {
    getAll: getAll,
    getById: getById,
    add: add,
    update: update,
    remove: remove,
    query: query,
    calculateDistance: calculateDistance,
    calculateSobrietyDays: calculateSobrietyDays,
    calculateSobrietyYears: calculateSobrietyYears,
    getPreference: getPreference,
    setPreference: setPreference,
    calculateSpiritualFitness: calculateSpiritualFitness,
    calculateSpiritualFitnessWithTimeframe: calculateSpiritualFitnessWithTimeframe,
    hasLocalStorageData: hasLocalStorageData,
    migrateFromLocalStorage: migrateFromLocalStorage
  };

  // Verify the functions are properly attached
  console.log('Global db object created with these functions:', Object.keys(window.db));
  return window.db;
}

/***/ })

}]);
//# sourceMappingURL=src_utils_capacitorStorage_js.bundle.js.map