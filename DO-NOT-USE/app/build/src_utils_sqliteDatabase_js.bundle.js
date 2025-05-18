"use strict";
(self["webpackChunkspiritual_condition_tracker"] = self["webpackChunkspiritual_condition_tracker"] || []).push([["src_utils_sqliteDatabase_js"],{

/***/ "./src/utils/sqliteDatabase.js":
/*!*************************************!*\
  !*** ./src/utils/sqliteDatabase.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   add: () => (/* binding */ add),
/* harmony export */   calculateDistance: () => (/* binding */ calculateDistance),
/* harmony export */   dbOperations: () => (/* binding */ dbOperations),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getAll: () => (/* binding */ getAll),
/* harmony export */   getById: () => (/* binding */ getById),
/* harmony export */   getPreference: () => (/* binding */ getPreference),
/* harmony export */   initDatabase: () => (/* binding */ initDatabase),
/* harmony export */   query: () => (/* binding */ query),
/* harmony export */   remove: () => (/* binding */ remove),
/* harmony export */   setPreference: () => (/* binding */ setPreference),
/* harmony export */   setupGlobalDbObject: () => (/* binding */ setupGlobalDbObject),
/* harmony export */   update: () => (/* binding */ update)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return r; }; var t, r = {}, e = Object.prototype, n = e.hasOwnProperty, o = "function" == typeof Symbol ? Symbol : {}, i = o.iterator || "@@iterator", a = o.asyncIterator || "@@asyncIterator", u = o.toStringTag || "@@toStringTag"; function c(t, r, e, n) { return Object.defineProperty(t, r, { value: e, enumerable: !n, configurable: !n, writable: !n }); } try { c({}, ""); } catch (t) { c = function c(t, r, e) { return t[r] = e; }; } function h(r, e, n, o) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype); return c(a, "_invoke", function (r, e, n) { var o = 1; return function (i, a) { if (3 === o) throw Error("Generator is already running"); if (4 === o) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var u = n.delegate; if (u) { var c = d(u, n); if (c) { if (c === f) continue; return c; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (1 === o) throw o = 4, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = 3; var h = s(r, e, n); if ("normal" === h.type) { if (o = n.done ? 4 : 2, h.arg === f) continue; return { value: h.arg, done: n.done }; } "throw" === h.type && (o = 4, n.method = "throw", n.arg = h.arg); } }; }(r, n, new Context(o || [])), !0), a; } function s(t, r, e) { try { return { type: "normal", arg: t.call(r, e) }; } catch (t) { return { type: "throw", arg: t }; } } r.wrap = h; var f = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var l = {}; c(l, i, function () { return this; }); var p = Object.getPrototypeOf, y = p && p(p(x([]))); y && y !== e && n.call(y, i) && (l = y); var v = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(l); function g(t) { ["next", "throw", "return"].forEach(function (r) { c(t, r, function (t) { return this._invoke(r, t); }); }); } function AsyncIterator(t, r) { function e(o, i, a, u) { var c = s(t[o], t, i); if ("throw" !== c.type) { var h = c.arg, f = h.value; return f && "object" == _typeof(f) && n.call(f, "__await") ? r.resolve(f.__await).then(function (t) { e("next", t, a, u); }, function (t) { e("throw", t, a, u); }) : r.resolve(f).then(function (t) { h.value = t, a(h); }, function (t) { return e("throw", t, a, u); }); } u(c.arg); } var o; c(this, "_invoke", function (t, n) { function i() { return new r(function (r, o) { e(t, n, r, o); }); } return o = o ? o.then(i, i) : i(); }, !0); } function d(r, e) { var n = e.method, o = r.i[n]; if (o === t) return e.delegate = null, "throw" === n && r.i["return"] && (e.method = "return", e.arg = t, d(r, e), "throw" === e.method) || "return" !== n && (e.method = "throw", e.arg = new TypeError("The iterator does not provide a '" + n + "' method")), f; var i = s(o, r.i, e.arg); if ("throw" === i.type) return e.method = "throw", e.arg = i.arg, e.delegate = null, f; var a = i.arg; return a ? a.done ? (e[r.r] = a.value, e.next = r.n, "return" !== e.method && (e.method = "next", e.arg = t), e.delegate = null, f) : a : (e.method = "throw", e.arg = new TypeError("iterator result is not an object"), e.delegate = null, f); } function w(t) { this.tryEntries.push(t); } function m(r) { var e = r[4] || {}; e.type = "normal", e.arg = t, r[4] = e; } function Context(t) { this.tryEntries = [[-1]], t.forEach(w, this), this.reset(!0); } function x(r) { if (null != r) { var e = r[i]; if (e) return e.call(r); if ("function" == typeof r.next) return r; if (!isNaN(r.length)) { var o = -1, a = function e() { for (; ++o < r.length;) if (n.call(r, o)) return e.value = r[o], e.done = !1, e; return e.value = t, e.done = !0, e; }; return a.next = a; } } throw new TypeError(_typeof(r) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, c(v, "constructor", GeneratorFunctionPrototype), c(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = c(GeneratorFunctionPrototype, u, "GeneratorFunction"), r.isGeneratorFunction = function (t) { var r = "function" == typeof t && t.constructor; return !!r && (r === GeneratorFunction || "GeneratorFunction" === (r.displayName || r.name)); }, r.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, c(t, u, "GeneratorFunction")), t.prototype = Object.create(v), t; }, r.awrap = function (t) { return { __await: t }; }, g(AsyncIterator.prototype), c(AsyncIterator.prototype, a, function () { return this; }), r.AsyncIterator = AsyncIterator, r.async = function (t, e, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(h(t, e, n, o), i); return r.isGeneratorFunction(e) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, g(v), c(v, u, "Generator"), c(v, i, function () { return this; }), c(v, "toString", function () { return "[object Generator]"; }), r.keys = function (t) { var r = Object(t), e = []; for (var n in r) e.unshift(n); return function t() { for (; e.length;) if ((n = e.pop()) in r) return t.value = n, t.done = !1, t; return t.done = !0, t; }; }, r.values = x, Context.prototype = { constructor: Context, reset: function reset(r) { if (this.prev = this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(m), !r) for (var e in this) "t" === e.charAt(0) && n.call(this, e) && !isNaN(+e.slice(1)) && (this[e] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0][4]; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(r) { if (this.done) throw r; var e = this; function n(t) { a.type = "throw", a.arg = r, e.next = t; } for (var o = e.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i[4], u = this.prev, c = i[1], h = i[2]; if (-1 === i[0]) return n("end"), !1; if (!c && !h) throw Error("try statement without catch or finally"); if (null != i[0] && i[0] <= u) { if (u < c) return this.method = "next", this.arg = t, n(c), !0; if (u < h) return n(h), !1; } } }, abrupt: function abrupt(t, r) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var n = this.tryEntries[e]; if (n[0] > -1 && n[0] <= this.prev && this.prev < n[2]) { var o = n; break; } } o && ("break" === t || "continue" === t) && o[0] <= r && r <= o[2] && (o = null); var i = o ? o[4] : {}; return i.type = t, i.arg = r, o ? (this.method = "next", this.next = o[2], f) : this.complete(i); }, complete: function complete(t, r) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && r && (this.next = r), f; }, finish: function finish(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[2] === t) return this.complete(e[4], e[3]), m(e), f; } }, "catch": function _catch(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[0] === t) { var n = e[4]; if ("throw" === n.type) { var o = n.arg; m(e); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(r, e, n) { return this.delegate = { i: x(r), r: e, n: n }, "next" === this.method && (this.arg = t), f; } }, r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * SQLite database implementation for the Spiritual Condition Tracker
 * Handles data persistence using SQLite instead of localStorage
 */

// Initialize the SQLite database
var db = null;

/**
 * Initialize all database tables and create database connection
 */
function initDatabase() {
  return _initDatabase.apply(this, arguments);
}

/**
 * Create database tables if they don't exist
 */
function _initDatabase() {
  _initDatabase = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          console.log("Initializing SQLite database...");
          _context2.prev = 1;
          if (!window.openDatabase) {
            _context2.next = 7;
            break;
          }
          // Browser implementation (WebSQL)
          console.log("Using WebSQL implementation for browser");
          db = window.openDatabase('spiritualTracker.db', '1.0', 'Spiritual Condition Tracker Database', 5 * 1024 * 1024 // 5MB
          );
          _context2.next = 15;
          break;
        case 7:
          if (!(window.sqlitePlugin && window.sqlitePlugin.openDatabase)) {
            _context2.next = 12;
            break;
          }
          // Native SQLite implementation (Cordova/React Native)
          console.log("Using native SQLite implementation");
          db = window.sqlitePlugin.openDatabase({
            name: 'spiritualTracker.db',
            location: 'default'
          });
          _context2.next = 15;
          break;
        case 12:
          // No SQLite implementation available
          console.error("SQLite not available - falling back to localStorage");
          initLocalStorageBackup();
          return _context2.abrupt("return", false);
        case 15:
          _context2.next = 17;
          return createTables();
        case 17:
          console.log("SQLite database initialized successfully");
          return _context2.abrupt("return", true);
        case 21:
          _context2.prev = 21;
          _context2.t0 = _context2["catch"](1);
          console.error("Error initializing SQLite database:", _context2.t0);
          // Fall back to localStorage if SQLite fails
          initLocalStorageBackup();
          return _context2.abrupt("return", false);
        case 26:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[1, 21]]);
  }));
  return _initDatabase.apply(this, arguments);
}
function createTables() {
  return _createTables.apply(this, arguments);
}
/**
 * Initialize localStorage as a backup if SQLite is not available
 */
function _createTables() {
  _createTables = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          return _context3.abrupt("return", new Promise(function (resolve, reject) {
            // Use a transaction for creating all tables
            db.transaction(function (tx) {
              // Users table
              tx.executeSql("\n        CREATE TABLE IF NOT EXISTS users (\n          id TEXT PRIMARY KEY,\n          name TEXT,\n          lastName TEXT,\n          phoneNumber TEXT,\n          email TEXT,\n          sobrietyDate TEXT,\n          homeGroups TEXT,\n          privacySettings TEXT,\n          preferences TEXT,\n          sponsor TEXT,\n          sponsees TEXT,\n          messagingKeys TEXT,\n          createdAt TEXT,\n          updatedAt TEXT\n        )\n      ");

              // Activities table
              tx.executeSql("\n        CREATE TABLE IF NOT EXISTS activities (\n          id TEXT PRIMARY KEY,\n          type TEXT NOT NULL,\n          duration INTEGER,\n          date TEXT,\n          notes TEXT,\n          meeting TEXT,\n          createdAt TEXT,\n          updatedAt TEXT\n        )\n      ");

              // Meetings table
              tx.executeSql("\n        CREATE TABLE IF NOT EXISTS meetings (\n          id TEXT PRIMARY KEY,\n          name TEXT NOT NULL,\n          days TEXT,\n          time TEXT,\n          schedule TEXT,\n          address TEXT,\n          locationName TEXT,\n          streetAddress TEXT,\n          city TEXT,\n          state TEXT,\n          zipCode TEXT,\n          coordinates TEXT,\n          createdAt TEXT,\n          updatedAt TEXT\n        )\n      ");

              // Messages table
              tx.executeSql("\n        CREATE TABLE IF NOT EXISTS messages (\n          id TEXT PRIMARY KEY,\n          senderId TEXT,\n          recipientId TEXT,\n          content TEXT,\n          encrypted BOOLEAN,\n          timestamp TEXT,\n          read BOOLEAN\n        )\n      ");
            }, function (error) {
              console.error("Error creating tables:", error);
              reject(error);
            }, function () {
              console.log("Tables created successfully");
              resolve();
            });
          }));
        case 1:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _createTables.apply(this, arguments);
}
function initLocalStorageBackup() {
  console.log("Initializing localStorage backup...");
  if (!window.db) {
    window.db = {
      users: JSON.parse(localStorage.getItem('users') || '[]'),
      activities: JSON.parse(localStorage.getItem('activities') || '[]'),
      meetings: JSON.parse(localStorage.getItem('meetings') || '[]'),
      messages: JSON.parse(localStorage.getItem('messages') || '[]'),
      user: JSON.parse(localStorage.getItem('user') || 'null')
    };
  }
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
  _getAll = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(collection) {
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          return _context4.abrupt("return", new Promise(function (resolve, reject) {
            // Check if we're using SQLite or localStorage
            if (!db) {
              // Fallback to localStorage
              var items = window.db[collection] || [];
              resolve(items);
              return;
            }

            // Otherwise use SQLite
            db.transaction(function (tx) {
              tx.executeSql("SELECT * FROM ".concat(collection), [], function (_, result) {
                var items = [];
                var len = result.rows.length;
                for (var i = 0; i < len; i++) {
                  var item = result.rows.item(i);

                  // Parse JSON fields
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
                  }
                  items.push(item);
                }
                resolve(items);
              }, function (_, error) {
                console.error("Error getting items from ".concat(collection, ":"), error);
                reject(error);
              });
            });
          }));
        case 1:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
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
  _getById = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(collection, id) {
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          return _context5.abrupt("return", new Promise(function (resolve, reject) {
            // Check if we're using SQLite or localStorage
            if (!db) {
              // Fallback to localStorage
              var items = window.db[collection] || [];
              var item = items.find(function (item) {
                return item.id === id;
              }) || null;
              resolve(item);
              return;
            }

            // Otherwise use SQLite
            db.transaction(function (tx) {
              tx.executeSql("SELECT * FROM ".concat(collection, " WHERE id = ?"), [id], function (_, result) {
                if (result.rows.length === 0) {
                  resolve(null);
                  return;
                }
                var item = result.rows.item(0);

                // Parse JSON fields
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
                }
                resolve(item);
              }, function (_, error) {
                console.error("Error getting item from ".concat(collection, ":"), error);
                reject(error);
              });
            });
          }));
        case 1:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
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
  _add = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(collection, item) {
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          return _context6.abrupt("return", new Promise(function (resolve, reject) {
            // Generate ID if not provided
            if (!item.id) {
              item.id = "".concat(collection.slice(0, -1), "_").concat(Date.now());
            }

            // Add timestamps
            var now = new Date().toISOString();
            item.createdAt = now;
            item.updatedAt = now;

            // Check if we're using SQLite or localStorage
            if (!db) {
              // Fallback to localStorage
              var items = window.db[collection] || [];
              items.push(item);
              window.db[collection] = items;

              // Save to localStorage
              localStorage.setItem(collection, JSON.stringify(items));

              // Special case for user (single instance)
              if (collection === 'users' && items.length === 1) {
                window.db.user = item;
                localStorage.setItem('user', JSON.stringify(item));
              }
              resolve(item);
              return;
            }

            // Otherwise use SQLite
            db.transaction(function (tx) {
              if (collection === 'users') {
                var privacySettings = JSON.stringify(item.privacySettings || {});
                var preferences = JSON.stringify(item.preferences || {});
                var homeGroups = JSON.stringify(item.homeGroups || []);
                var sponsor = JSON.stringify(item.sponsor || null);
                var sponsees = JSON.stringify(item.sponsees || []);
                var messagingKeys = JSON.stringify(item.messagingKeys || {});
                tx.executeSql("INSERT INTO users (\n            id, name, lastName, phoneNumber, email, sobrietyDate, \n            homeGroups, privacySettings, preferences, sponsor, sponsees, \n            messagingKeys, createdAt, updatedAt\n          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [item.id, item.name, item.lastName, item.phoneNumber, item.email, item.sobrietyDate, homeGroups, privacySettings, preferences, sponsor, sponsees, messagingKeys, item.createdAt, item.updatedAt], function (_, result) {
                  resolve(item);
                }, function (_, error) {
                  console.error("Error adding item to ".concat(collection, ":"), error);
                  reject(error);
                });
              } else if (collection === 'activities') {
                tx.executeSql("INSERT INTO activities (\n            id, type, duration, date, notes, meeting, createdAt, updatedAt\n          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [item.id, item.type, item.duration, item.date, item.notes, item.meeting, item.createdAt, item.updatedAt], function (_, result) {
                  resolve(item);
                }, function (_, error) {
                  console.error("Error adding item to ".concat(collection, ":"), error);
                  reject(error);
                });
              } else if (collection === 'meetings') {
                var days = JSON.stringify(item.days || []);
                var schedule = JSON.stringify(item.schedule || []);
                var coordinates = JSON.stringify(item.coordinates || null);
                tx.executeSql("INSERT INTO meetings (\n            id, name, days, time, schedule, address, locationName, \n            streetAddress, city, state, zipCode, coordinates, createdAt, updatedAt\n          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [item.id, item.name, days, item.time, schedule, item.address, item.locationName, item.streetAddress, item.city, item.state, item.zipCode, coordinates, item.createdAt, item.updatedAt], function (_, result) {
                  resolve(item);
                }, function (_, error) {
                  console.error("Error adding item to ".concat(collection, ":"), error);
                  reject(error);
                });
              } else if (collection === 'messages') {
                tx.executeSql("INSERT INTO messages (\n            id, senderId, recipientId, content, encrypted, timestamp, read\n          ) VALUES (?, ?, ?, ?, ?, ?, ?)", [item.id, item.senderId, item.recipientId, item.content, item.encrypted ? 1 : 0, item.timestamp, item.read ? 1 : 0], function (_, result) {
                  resolve(item);
                }, function (_, error) {
                  console.error("Error adding item to ".concat(collection, ":"), error);
                  reject(error);
                });
              } else {
                reject(new Error("Unknown collection: ".concat(collection)));
              }
            });
          }));
        case 1:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
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
  _update = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(collection, id, updates) {
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          return _context8.abrupt("return", new Promise(/*#__PURE__*/function () {
            var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(resolve, reject) {
              var _window$db$user, items, index, _updatedItem, existingItem, updatedItem;
              return _regeneratorRuntime().wrap(function _callee7$(_context7) {
                while (1) switch (_context7.prev = _context7.next) {
                  case 0:
                    // Update timestamp
                    updates.updatedAt = new Date().toISOString();

                    // Check if we're using SQLite or localStorage
                    if (db) {
                      _context7.next = 14;
                      break;
                    }
                    // Fallback to localStorage
                    items = window.db[collection] || [];
                    index = items.findIndex(function (item) {
                      return item.id === id;
                    });
                    if (!(index === -1)) {
                      _context7.next = 7;
                      break;
                    }
                    resolve(null);
                    return _context7.abrupt("return");
                  case 7:
                    _updatedItem = _objectSpread(_objectSpread({}, items[index]), updates);
                    items[index] = _updatedItem;
                    window.db[collection] = items;

                    // Save to localStorage
                    localStorage.setItem(collection, JSON.stringify(items));

                    // Special case for user (single instance)
                    if (collection === 'users' && id === ((_window$db$user = window.db.user) === null || _window$db$user === void 0 ? void 0 : _window$db$user.id)) {
                      window.db.user = _updatedItem;
                      localStorage.setItem('user', JSON.stringify(_updatedItem));
                    }
                    resolve(_updatedItem);
                    return _context7.abrupt("return");
                  case 14:
                    _context7.next = 16;
                    return getById(collection, id);
                  case 16:
                    existingItem = _context7.sent;
                    if (existingItem) {
                      _context7.next = 20;
                      break;
                    }
                    resolve(null);
                    return _context7.abrupt("return");
                  case 20:
                    // Merge existing item with updates
                    updatedItem = _objectSpread(_objectSpread({}, existingItem), updates); // Otherwise use SQLite
                    db.transaction(function (tx) {
                      if (collection === 'users') {
                        var privacySettings = JSON.stringify(updatedItem.privacySettings || {});
                        var preferences = JSON.stringify(updatedItem.preferences || {});
                        var homeGroups = JSON.stringify(updatedItem.homeGroups || []);
                        var sponsor = JSON.stringify(updatedItem.sponsor || null);
                        var sponsees = JSON.stringify(updatedItem.sponsees || []);
                        var messagingKeys = JSON.stringify(updatedItem.messagingKeys || {});
                        tx.executeSql("UPDATE users SET \n            name = ?, lastName = ?, phoneNumber = ?, email = ?, sobrietyDate = ?, \n            homeGroups = ?, privacySettings = ?, preferences = ?, sponsor = ?, \n            sponsees = ?, messagingKeys = ?, updatedAt = ?\n          WHERE id = ?", [updatedItem.name, updatedItem.lastName, updatedItem.phoneNumber, updatedItem.email, updatedItem.sobrietyDate, homeGroups, privacySettings, preferences, sponsor, sponsees, messagingKeys, updatedItem.updatedAt, id], function (_, result) {
                          if (result.rowsAffected === 0) {
                            resolve(null);
                          } else {
                            resolve(updatedItem);
                          }
                        }, function (_, error) {
                          console.error("Error updating item in ".concat(collection, ":"), error);
                          reject(error);
                        });
                      } else if (collection === 'activities') {
                        tx.executeSql("UPDATE activities SET \n            type = ?, duration = ?, date = ?, notes = ?, meeting = ?, updatedAt = ?\n          WHERE id = ?", [updatedItem.type, updatedItem.duration, updatedItem.date, updatedItem.notes, updatedItem.meeting, updatedItem.updatedAt, id], function (_, result) {
                          if (result.rowsAffected === 0) {
                            resolve(null);
                          } else {
                            resolve(updatedItem);
                          }
                        }, function (_, error) {
                          console.error("Error updating item in ".concat(collection, ":"), error);
                          reject(error);
                        });
                      } else if (collection === 'meetings') {
                        var days = JSON.stringify(updatedItem.days || []);
                        var schedule = JSON.stringify(updatedItem.schedule || []);
                        var coordinates = JSON.stringify(updatedItem.coordinates || null);
                        tx.executeSql("UPDATE meetings SET \n            name = ?, days = ?, time = ?, schedule = ?, address = ?, locationName = ?, \n            streetAddress = ?, city = ?, state = ?, zipCode = ?, \n            coordinates = ?, updatedAt = ?\n          WHERE id = ?", [updatedItem.name, days, updatedItem.time, schedule, updatedItem.address, updatedItem.locationName, updatedItem.streetAddress, updatedItem.city, updatedItem.state, updatedItem.zipCode, coordinates, updatedItem.updatedAt, id], function (_, result) {
                          if (result.rowsAffected === 0) {
                            resolve(null);
                          } else {
                            resolve(updatedItem);
                          }
                        }, function (_, error) {
                          console.error("Error updating item in ".concat(collection, ":"), error);
                          reject(error);
                        });
                      } else if (collection === 'messages') {
                        tx.executeSql("UPDATE messages SET \n            content = ?, encrypted = ?, read = ?\n          WHERE id = ?", [updatedItem.content, updatedItem.encrypted ? 1 : 0, updatedItem.read ? 1 : 0, id], function (_, result) {
                          if (result.rowsAffected === 0) {
                            resolve(null);
                          } else {
                            resolve(updatedItem);
                          }
                        }, function (_, error) {
                          console.error("Error updating item in ".concat(collection, ":"), error);
                          reject(error);
                        });
                      } else {
                        reject(new Error("Unknown collection: ".concat(collection)));
                      }
                    });
                  case 22:
                  case "end":
                    return _context7.stop();
                }
              }, _callee7);
            }));
            return function (_x15, _x16) {
              return _ref.apply(this, arguments);
            };
          }()));
        case 1:
        case "end":
          return _context8.stop();
      }
    }, _callee8);
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
  _remove = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(collection, id) {
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          return _context9.abrupt("return", new Promise(function (resolve, reject) {
            // Check if we're using SQLite or localStorage
            if (!db) {
              // Fallback to localStorage
              var items = window.db[collection] || [];
              var index = items.findIndex(function (item) {
                return item.id === id;
              });
              if (index === -1) {
                resolve(false);
                return;
              }
              items.splice(index, 1);
              window.db[collection] = items;

              // Save to localStorage
              localStorage.setItem(collection, JSON.stringify(items));
              resolve(true);
              return;
            }

            // Otherwise use SQLite
            db.transaction(function (tx) {
              tx.executeSql("DELETE FROM ".concat(collection, " WHERE id = ?"), [id], function (_, result) {
                resolve(result.rowsAffected > 0);
              }, function (_, error) {
                console.error("Error removing item from ".concat(collection, ":"), error);
                reject(error);
              });
            });
          }));
        case 1:
        case "end":
          return _context9.stop();
      }
    }, _callee9);
  }));
  return _remove.apply(this, arguments);
}
function query(_x1, _x10) {
  return _query.apply(this, arguments);
}

/**
 * Calculate distance between two lat/long points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in miles
 */
function _query() {
  _query = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee0(collection, predicate) {
    var items;
    return _regeneratorRuntime().wrap(function _callee0$(_context0) {
      while (1) switch (_context0.prev = _context0.next) {
        case 0:
          _context0.next = 2;
          return getAll(collection);
        case 2:
          items = _context0.sent;
          return _context0.abrupt("return", items.filter(predicate));
        case 4:
        case "end":
          return _context0.stop();
      }
    }, _callee0);
  }));
  return _query.apply(this, arguments);
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
 * Get user preference
 * @param {string} key - The preference key
 * @returns {Promise<any>} The preference value
 */
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
  _getPreference = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee1(key) {
    var _user$preferences;
    var user;
    return _regeneratorRuntime().wrap(function _callee1$(_context1) {
      while (1) switch (_context1.prev = _context1.next) {
        case 0:
          _context1.next = 2;
          return getById('users', 'user_1');
        case 2:
          user = _context1.sent;
          return _context1.abrupt("return", user === null || user === void 0 || (_user$preferences = user.preferences) === null || _user$preferences === void 0 ? void 0 : _user$preferences[key]);
        case 4:
        case "end":
          return _context1.stop();
      }
    }, _callee1);
  }));
  return _getPreference.apply(this, arguments);
}
function setPreference(_x12, _x13) {
  return _setPreference.apply(this, arguments);
}

// Expose methods on window.db for backwards compatibility
function _setPreference() {
  _setPreference = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10(key, value) {
    var user, preferences;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return getById('users', 'user_1');
        case 2:
          user = _context10.sent;
          if (user) {
            _context10.next = 5;
            break;
          }
          return _context10.abrupt("return");
        case 5:
          preferences = user.preferences || {};
          preferences[key] = value;
          _context10.next = 9;
          return update('users', user.id, {
            preferences: preferences
          });
        case 9:
        case "end":
          return _context10.stop();
      }
    }, _callee10);
  }));
  return _setPreference.apply(this, arguments);
}
function setupGlobalDbObject() {
  window.db = {
    getAll: getAll,
    getById: getById,
    add: add,
    update: update,
    remove: remove,
    query: query,
    calculateDistance: calculateDistance,
    getPreference: getPreference,
    setPreference: setPreference,
    // Add a calculateSpiritualFitness method that works with activities
    calculateSpiritualFitness: function () {
      var _calculateSpiritualFitness = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(activities) {
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
          _args = arguments;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              timeframe = _args.length > 1 && _args[1] !== undefined ? _args[1] : 30;
              if (!(!activities || activities.length === 0)) {
                _context.next = 3;
                break;
              }
              return _context.abrupt("return", 20);
            case 3:
              _context.prev = 3;
              _context.next = 6;
              return getPreference('fitnessTimeframe');
            case 6:
              storedTimeframe = _context.sent;
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
                _context.next = 16;
                break;
              }
              return _context.abrupt("return", baseScore);
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
              return _context.abrupt("return", score);
            case 28:
              _context.prev = 28;
              _context.t0 = _context["catch"](3);
              console.error('Error calculating spiritual fitness:', _context.t0);
              return _context.abrupt("return", 20);
            case 32:
            case "end":
              return _context.stop();
          }
        }, _callee, null, [[3, 28]]);
      }));
      function calculateSpiritualFitness(_x14) {
        return _calculateSpiritualFitness.apply(this, arguments);
      }
      return calculateSpiritualFitness;
    }()
  };
  return window.db;
}

// Export all functions and data
var dbOperations = {
  initDatabase: initDatabase,
  getAll: getAll,
  getById: getById,
  add: add,
  update: update,
  remove: remove,
  query: query,
  calculateDistance: calculateDistance,
  getPreference: getPreference,
  setPreference: setPreference,
  setupGlobalDbObject: setupGlobalDbObject
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (dbOperations);

/***/ })

}]);
//# sourceMappingURL=src_utils_sqliteDatabase_js.bundle.js.map