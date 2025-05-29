"use strict";
(self["webpackChunkspiritual_condition_tracker"] = self["webpackChunkspiritual_condition_tracker"] || []).push([["src_utils_action-items_ts"],{

/***/ "./src/utils/action-items.ts":
/*!***********************************!*\
  !*** ./src/utils/action-items.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addActionItem: () => (/* binding */ addActionItem),
/* harmony export */   associateActionItemWithContact: () => (/* binding */ associateActionItemWithContact),
/* harmony export */   deleteActionItem: () => (/* binding */ deleteActionItem),
/* harmony export */   getActionItemsForContact: () => (/* binding */ getActionItemsForContact),
/* harmony export */   getAllActionItems: () => (/* binding */ getAllActionItems),
/* harmony export */   getAllActionItemsDebug: () => (/* binding */ getAllActionItemsDebug),
/* harmony export */   toggleActionItemCompletion: () => (/* binding */ toggleActionItemCompletion)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return r; }; var t, r = {}, e = Object.prototype, n = e.hasOwnProperty, o = "function" == typeof Symbol ? Symbol : {}, i = o.iterator || "@@iterator", a = o.asyncIterator || "@@asyncIterator", u = o.toStringTag || "@@toStringTag"; function c(t, r, e, n) { return Object.defineProperty(t, r, { value: e, enumerable: !n, configurable: !n, writable: !n }); } try { c({}, ""); } catch (t) { c = function c(t, r, e) { return t[r] = e; }; } function h(r, e, n, o) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype); return c(a, "_invoke", function (r, e, n) { var o = 1; return function (i, a) { if (3 === o) throw Error("Generator is already running"); if (4 === o) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var u = n.delegate; if (u) { var c = d(u, n); if (c) { if (c === f) continue; return c; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (1 === o) throw o = 4, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = 3; var h = s(r, e, n); if ("normal" === h.type) { if (o = n.done ? 4 : 2, h.arg === f) continue; return { value: h.arg, done: n.done }; } "throw" === h.type && (o = 4, n.method = "throw", n.arg = h.arg); } }; }(r, n, new Context(o || [])), !0), a; } function s(t, r, e) { try { return { type: "normal", arg: t.call(r, e) }; } catch (t) { return { type: "throw", arg: t }; } } r.wrap = h; var f = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var l = {}; c(l, i, function () { return this; }); var p = Object.getPrototypeOf, y = p && p(p(x([]))); y && y !== e && n.call(y, i) && (l = y); var v = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(l); function g(t) { ["next", "throw", "return"].forEach(function (r) { c(t, r, function (t) { return this._invoke(r, t); }); }); } function AsyncIterator(t, r) { function e(o, i, a, u) { var c = s(t[o], t, i); if ("throw" !== c.type) { var h = c.arg, f = h.value; return f && "object" == _typeof(f) && n.call(f, "__await") ? r.resolve(f.__await).then(function (t) { e("next", t, a, u); }, function (t) { e("throw", t, a, u); }) : r.resolve(f).then(function (t) { h.value = t, a(h); }, function (t) { return e("throw", t, a, u); }); } u(c.arg); } var o; c(this, "_invoke", function (t, n) { function i() { return new r(function (r, o) { e(t, n, r, o); }); } return o = o ? o.then(i, i) : i(); }, !0); } function d(r, e) { var n = e.method, o = r.i[n]; if (o === t) return e.delegate = null, "throw" === n && r.i["return"] && (e.method = "return", e.arg = t, d(r, e), "throw" === e.method) || "return" !== n && (e.method = "throw", e.arg = new TypeError("The iterator does not provide a '" + n + "' method")), f; var i = s(o, r.i, e.arg); if ("throw" === i.type) return e.method = "throw", e.arg = i.arg, e.delegate = null, f; var a = i.arg; return a ? a.done ? (e[r.r] = a.value, e.next = r.n, "return" !== e.method && (e.method = "next", e.arg = t), e.delegate = null, f) : a : (e.method = "throw", e.arg = new TypeError("iterator result is not an object"), e.delegate = null, f); } function w(t) { this.tryEntries.push(t); } function m(r) { var e = r[4] || {}; e.type = "normal", e.arg = t, r[4] = e; } function Context(t) { this.tryEntries = [[-1]], t.forEach(w, this), this.reset(!0); } function x(r) { if (null != r) { var e = r[i]; if (e) return e.call(r); if ("function" == typeof r.next) return r; if (!isNaN(r.length)) { var o = -1, a = function e() { for (; ++o < r.length;) if (n.call(r, o)) return e.value = r[o], e.done = !1, e; return e.value = t, e.done = !0, e; }; return a.next = a; } } throw new TypeError(_typeof(r) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, c(v, "constructor", GeneratorFunctionPrototype), c(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = c(GeneratorFunctionPrototype, u, "GeneratorFunction"), r.isGeneratorFunction = function (t) { var r = "function" == typeof t && t.constructor; return !!r && (r === GeneratorFunction || "GeneratorFunction" === (r.displayName || r.name)); }, r.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, c(t, u, "GeneratorFunction")), t.prototype = Object.create(v), t; }, r.awrap = function (t) { return { __await: t }; }, g(AsyncIterator.prototype), c(AsyncIterator.prototype, a, function () { return this; }), r.AsyncIterator = AsyncIterator, r.async = function (t, e, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(h(t, e, n, o), i); return r.isGeneratorFunction(e) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, g(v), c(v, u, "Generator"), c(v, i, function () { return this; }), c(v, "toString", function () { return "[object Generator]"; }), r.keys = function (t) { var r = Object(t), e = []; for (var n in r) e.unshift(n); return function t() { for (; e.length;) if ((n = e.pop()) in r) return t.value = n, t.done = !1, t; return t.done = !0, t; }; }, r.values = x, Context.prototype = { constructor: Context, reset: function reset(r) { if (this.prev = this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(m), !r) for (var e in this) "t" === e.charAt(0) && n.call(this, e) && !isNaN(+e.slice(1)) && (this[e] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0][4]; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(r) { if (this.done) throw r; var e = this; function n(t) { a.type = "throw", a.arg = r, e.next = t; } for (var o = e.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i[4], u = this.prev, c = i[1], h = i[2]; if (-1 === i[0]) return n("end"), !1; if (!c && !h) throw Error("try statement without catch or finally"); if (null != i[0] && i[0] <= u) { if (u < c) return this.method = "next", this.arg = t, n(c), !0; if (u < h) return n(h), !1; } } }, abrupt: function abrupt(t, r) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var n = this.tryEntries[e]; if (n[0] > -1 && n[0] <= this.prev && this.prev < n[2]) { var o = n; break; } } o && ("break" === t || "continue" === t) && o[0] <= r && r <= o[2] && (o = null); var i = o ? o[4] : {}; return i.type = t, i.arg = r, o ? (this.method = "next", this.next = o[2], f) : this.complete(i); }, complete: function complete(t, r) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && r && (this.next = r), f; }, finish: function finish(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[2] === t) return this.complete(e[4], e[3]), m(e), f; } }, "catch": function _catch(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[0] === t) { var n = e[4]; if ("throw" === n.type) { var o = n.arg; m(e); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(r, e, n) { return this.delegate = { i: x(r), r: e, n: n }, "next" === this.method && (this.arg = t), f; } }, r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * Action Items Database Utilities
 * Handles the storage and retrieval of action items with SQLite
 */

// Database name
var DB_NAME = 'spiritualTracker.db';

// Get Capacitor SQLite plugin
function getSQLite() {
  var _window$Capacitor;
  // First check if database has been initialized
  if (!window.dbInitialized) {
    throw new Error('Database not initialized yet - please wait for initialization to complete');
  }

  // Then check if Capacitor SQLite plugin is available
  if (!((_window$Capacitor = window.Capacitor) !== null && _window$Capacitor !== void 0 && (_window$Capacitor = _window$Capacitor.Plugins) !== null && _window$Capacitor !== void 0 && _window$Capacitor.CapacitorSQLite)) {
    throw new Error('CapacitorSQLite plugin not available');
  }
  return window.Capacitor.Plugins.CapacitorSQLite;
}

/**
 * Get all action items
 * @returns {Promise<Array>} - Action items
 */
function getAllActionItems() {
  return _getAllActionItems.apply(this, arguments);
}

/**
 * Debug function to get all action items and log them
 * @returns {Promise<void>}
 */
function _getAllActionItems() {
  _getAllActionItems = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var sqlite, sqlStatement, result;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          console.log('[action-items.js - getAllActionItems: 29] Getting all action items');
          sqlite = getSQLite();
          sqlStatement = "SELECT * FROM action_items ORDER BY createdAt DESC";
          console.log('[action-items.js - getAllActionItems: 33] SQL query:', sqlStatement);
          _context.next = 7;
          return sqlite.query({
            database: DB_NAME,
            statement: sqlStatement,
            values: []
          });
        case 7:
          result = _context.sent;
          console.log('[action-items.js - getAllActionItems: 40] Query result:', JSON.stringify(result));
          return _context.abrupt("return", result.values || []);
        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](0);
          console.error('[action-items.js - getAllActionItems: 44] Error getting action items:', _context.t0);
          return _context.abrupt("return", []);
        case 16:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 12]]);
  }));
  return _getAllActionItems.apply(this, arguments);
}
function getAllActionItemsDebug() {
  return _getAllActionItemsDebug.apply(this, arguments);
}

/**
 * Get all action items for a contact
 * @param {number} contactId - Contact ID
 * @returns {Promise<Array>} - Action items for the contact
 */
function _getAllActionItemsDebug() {
  _getAllActionItemsDebug = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var sqlite, sqlStatement, result, itemCount;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          console.log('[action-items.js - getAllActionItemsDebug: 54] DEBUG: Retrieving all action items');
          sqlite = getSQLite(); // Query to get all action items
          sqlStatement = "SELECT * FROM action_items ORDER BY createdAt DESC";
          console.log('[action-items.js - getAllActionItemsDebug: 59] DEBUG: SQL query:', sqlStatement);
          _context2.next = 7;
          return sqlite.query({
            database: DB_NAME,
            statement: sqlStatement,
            values: []
          });
        case 7:
          result = _context2.sent;
          console.log('[action-items.js - getAllActionItemsDebug: 66] DEBUG: All action items result:', JSON.stringify(result));

          // Log the number of items found
          if (result !== null && result !== void 0 && result.values) {
            itemCount = result.values.length > 0 && result.values[0].ios_columns ? result.values.length - 1 : result.values.length;
            console.log("[action-items.js - getAllActionItemsDebug: 72] DEBUG: Found ".concat(itemCount, " action items in database"));
          } else {
            console.log('[action-items.js - getAllActionItemsDebug: 74] DEBUG: No action items found or result structure invalid');
          }
          _context2.next = 15;
          break;
        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](0);
          console.error('[action-items.js - getAllActionItemsDebug: 77] DEBUG: Error retrieving all action items:', _context2.t0);
        case 15:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 12]]);
  }));
  return _getAllActionItemsDebug.apply(this, arguments);
}
function getActionItemsForContact(_x) {
  return _getActionItemsForContact.apply(this, arguments);
}

/**
 * Add an action item
 * @param {Object} actionItem - Action item data
 * @returns {Promise<Object>} - Created action item with ID
 */
function _getActionItemsForContact() {
  _getActionItemsForContact = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(contactId) {
    var sqlite, sqlStatement, result, processedValues, joinTableQuery, joinResult, actionItemIds, actionItems, _iterator, _step, itemId, itemQuery, itemResult;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          console.log("[action-items.js - getActionItemsForContact: 91] CONTACT_ID: ".concat(contactId, " - Starting to fetch action items"));
          sqlite = getSQLite(); // First verify that tables exist
          console.log("[action-items.js - getActionItemsForContact: 95] CONTACT_ID: ".concat(contactId, " - Verifying tables exist"));
          _context3.prev = 4;
          _context3.next = 7;
          return sqlite.execute({
            database: DB_NAME,
            statements: "\n          CREATE TABLE IF NOT EXISTS action_items (\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            title TEXT DEFAULT '',\n            text TEXT DEFAULT '',\n            notes TEXT DEFAULT '',\n            dueDate TEXT DEFAULT NULL,\n            completed INTEGER DEFAULT 0,\n            type TEXT DEFAULT 'todo',\n            createdAt TEXT,\n            updatedAt TEXT\n          )\n        "
          });
        case 7:
          _context3.next = 9;
          return sqlite.execute({
            database: DB_NAME,
            statements: "\n          CREATE TABLE IF NOT EXISTS sponsor_contact_action_items (\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            contactId INTEGER,\n            actionItemId INTEGER,\n            createdAt TEXT,\n            FOREIGN KEY (contactId) REFERENCES sponsor_contacts(id),\n            FOREIGN KEY (actionItemId) REFERENCES action_items(id)\n          )\n        "
          });
        case 9:
          console.log("[action-items.js - getActionItemsForContact: 122] CONTACT_ID: ".concat(contactId, " - Tables verified"));
          _context3.next = 15;
          break;
        case 12:
          _context3.prev = 12;
          _context3.t0 = _context3["catch"](4);
          console.error("[action-items.js - getActionItemsForContact: 124] CONTACT_ID: ".concat(contactId, " - Error verifying tables:"), _context3.t0);
        case 15:
          // Construct the SQL query with join
          sqlStatement = "\n      SELECT ai.* \n      FROM action_items ai\n      JOIN sponsor_contact_action_items scai ON ai.id = scai.actionItemId\n      WHERE scai.contactId = ?\n      ORDER BY ai.createdAt DESC\n    ";
          console.log("[action-items.js - getActionItemsForContact: 135] CONTACT_ID: ".concat(contactId, " - Full SQL query: ").concat(sqlStatement));

          // Query action items via join table
          _context3.next = 19;
          return sqlite.query({
            database: DB_NAME,
            statement: sqlStatement,
            values: [contactId]
          });
        case 19:
          result = _context3.sent;
          console.log("[action-items.js - getActionItemsForContact: 143] CONTACT_ID: ".concat(contactId, " - Raw query result:"), JSON.stringify(result));

          // Handle iOS-specific format where first item contains column information
          if (!(result.values && result.values.length > 0)) {
            _context3.next = 35;
            break;
          }
          console.log("[action-items.js - getActionItemsForContact: 147] CONTACT_ID: ".concat(contactId, " - Found ").concat(result.values.length, " results in query"));

          // Check if first item contains column information (iOS format)
          if (!result.values[0].ios_columns) {
            _context3.next = 31;
            break;
          }
          console.log("[action-items.js - getActionItemsForContact: 151] CONTACT_ID: ".concat(contactId, " - iOS format detected for action items, processing values"));
          // Skip the first item (column info) and process the rest
          processedValues = result.values.slice(1);
          console.log("[action-items.js - getActionItemsForContact: 154] CONTACT_ID: ".concat(contactId, " - Processed ").concat(processedValues.length, " action items for iOS format"));

          // Log each item for debugging
          processedValues.forEach(function (item, index) {
            console.log("[action-items.js - getActionItemsForContact: 158] CONTACT_ID: ".concat(contactId, " - Item ").concat(index, ": ID=").concat(item.id, ", Title=").concat(item.title, ", Completed=").concat(item.completed));
          });
          return _context3.abrupt("return", processedValues);
        case 31:
          console.log("[action-items.js - getActionItemsForContact: 163] CONTACT_ID: ".concat(contactId, " - Standard format with ").concat(result.values.length, " action items"));

          // Log each item for debugging
          result.values.forEach(function (item, index) {
            console.log("[action-items.js - getActionItemsForContact: 167] CONTACT_ID: ".concat(contactId, " - Item ").concat(index, ": ID=").concat(item.id, ", Title=").concat(item.title, ", Completed=").concat(item.completed));
          });
        case 33:
          _context3.next = 36;
          break;
        case 35:
          console.log("[action-items.js - getActionItemsForContact: 171] CONTACT_ID: ".concat(contactId, " - No action items found in main query"));
        case 36:
          _context3.prev = 36;
          joinTableQuery = "\n        SELECT * FROM sponsor_contact_action_items \n        WHERE contactId = ?\n      ";
          console.log("[action-items.js - getActionItemsForContact: 179] CONTACT_ID: ".concat(contactId, " - Querying join table: ").concat(joinTableQuery));
          _context3.next = 41;
          return sqlite.query({
            database: DB_NAME,
            statement: joinTableQuery,
            values: [contactId]
          });
        case 41:
          joinResult = _context3.sent;
          console.log("[action-items.js - getActionItemsForContact: 186] CONTACT_ID: ".concat(contactId, " - Join table result:"), JSON.stringify(joinResult));
          if (!(joinResult.values && joinResult.values.length > 0)) {
            _context3.next = 84;
            break;
          }
          console.log("[action-items.js - getActionItemsForContact: 189] CONTACT_ID: ".concat(contactId, " - Found ").concat(joinResult.values.length > 0 && joinResult.values[0].ios_columns ? joinResult.values.length - 1 : joinResult.values.length, " associations in join table"));

          // If we have associations but no items, query each action item individually
          if (!(!result.values || result.values.length === 0 || result.values.length === 1 && result.values[0].ios_columns)) {
            _context3.next = 82;
            break;
          }
          console.log("[action-items.js - getActionItemsForContact: 193] CONTACT_ID: ".concat(contactId, " - Join table has entries but main query returned no items - querying individual action items"));

          // Extract actionItemIds from join table
          actionItemIds = [];
          if (joinResult.values[0].ios_columns) {
            // iOS format
            actionItemIds = joinResult.values.slice(1).map(function (item) {
              return item.actionItemId;
            });
          } else {
            // Standard format
            actionItemIds = joinResult.values.map(function (item) {
              return item.actionItemId;
            });
          }
          console.log("[action-items.js - getActionItemsForContact: 204] CONTACT_ID: ".concat(contactId, " - Found action item IDs:"), JSON.stringify(actionItemIds));
          if (!(actionItemIds.length > 0)) {
            _context3.next = 82;
            break;
          }
          // Query each action item individually
          actionItems = [];
          _iterator = _createForOfIteratorHelper(actionItemIds);
          _context3.prev = 53;
          _iterator.s();
        case 55:
          if ((_step = _iterator.n()).done) {
            _context3.next = 71;
            break;
          }
          itemId = _step.value;
          _context3.prev = 57;
          itemQuery = "SELECT * FROM action_items WHERE id = ?";
          _context3.next = 61;
          return sqlite.query({
            database: DB_NAME,
            statement: itemQuery,
            values: [itemId]
          });
        case 61:
          itemResult = _context3.sent;
          console.log("[action-items.js - getActionItemsForContact: 216] CONTACT_ID: ".concat(contactId, " - Action item query for ID ").concat(itemId, " result:"), JSON.stringify(itemResult));
          if (itemResult.values && itemResult.values.length > 0) {
            if (itemResult.values[0].ios_columns) {
              // iOS format
              if (itemResult.values.length > 1) {
                actionItems.push(itemResult.values[1]);
                console.log("[action-items.js - getActionItemsForContact: 223] CONTACT_ID: ".concat(contactId, " - Added item from iOS format:"), JSON.stringify(itemResult.values[1]));
              }
            } else {
              // Standard format
              actionItems.push(itemResult.values[0]);
              console.log("[action-items.js - getActionItemsForContact: 228] CONTACT_ID: ".concat(contactId, " - Added item from standard format:"), JSON.stringify(itemResult.values[0]));
            }
          }
          _context3.next = 69;
          break;
        case 66:
          _context3.prev = 66;
          _context3.t1 = _context3["catch"](57);
          console.error("[action-items.js - getActionItemsForContact: 232] CONTACT_ID: ".concat(contactId, " - Error querying action item ").concat(itemId, ":"), _context3.t1);
        case 69:
          _context3.next = 55;
          break;
        case 71:
          _context3.next = 76;
          break;
        case 73:
          _context3.prev = 73;
          _context3.t2 = _context3["catch"](53);
          _iterator.e(_context3.t2);
        case 76:
          _context3.prev = 76;
          _iterator.f();
          return _context3.finish(76);
        case 79:
          console.log("[action-items.js - getActionItemsForContact: 236] CONTACT_ID: ".concat(contactId, " - Retrieved ").concat(actionItems.length, " individual action items"));
          if (!(actionItems.length > 0)) {
            _context3.next = 82;
            break;
          }
          return _context3.abrupt("return", actionItems);
        case 82:
          _context3.next = 85;
          break;
        case 84:
          console.log("[action-items.js - getActionItemsForContact: 243] CONTACT_ID: ".concat(contactId, " - No associations found in join table"));
        case 85:
          _context3.next = 90;
          break;
        case 87:
          _context3.prev = 87;
          _context3.t3 = _context3["catch"](36);
          console.error("[action-items.js - getActionItemsForContact: 246] CONTACT_ID: ".concat(contactId, " - Error querying join table:"), _context3.t3);
        case 90:
          return _context3.abrupt("return", result.values && result.values.length > 0 && result.values[0].ios_columns ? result.values.slice(1) : result.values || []);
        case 93:
          _context3.prev = 93;
          _context3.t4 = _context3["catch"](0);
          console.error("[action-items.js - getActionItemsForContact: 252] CONTACT_ID: ".concat(contactId, " - Error getting action items:"), _context3.t4);
          return _context3.abrupt("return", []);
        case 97:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[0, 93], [4, 12], [36, 87], [53, 73, 76, 79], [57, 66]]);
  }));
  return _getActionItemsForContact.apply(this, arguments);
}
function addActionItem(_x2) {
  return _addActionItem.apply(this, arguments);
}

/**
 * Associate an action item with a contact
 * @param {number} contactId - Contact ID
 * @param {number} actionItemId - Action item ID
 * @returns {Promise<boolean>} - Success status
 */
function _addActionItem() {
  _addActionItem = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(actionItem) {
    var _lastIdResult$values, sqlite, now, actionItemData, insertSQL, insertResult, lastIdResult, newId, verifyResult;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          console.log('[action-items.js - addActionItem: 281] Starting to add action item:', JSON.stringify(actionItem));
          sqlite = getSQLite(); // First ensure the table exists
          console.log('[action-items.js - addActionItem: 285] Creating action_items table if not exists');
          _context4.next = 6;
          return sqlite.execute({
            database: DB_NAME,
            statements: "\n        CREATE TABLE IF NOT EXISTS action_items (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          title TEXT DEFAULT '',\n          text TEXT DEFAULT '',\n          notes TEXT DEFAULT '',\n          dueDate TEXT DEFAULT NULL,\n          completed INTEGER DEFAULT 0,\n          type TEXT DEFAULT 'todo',\n          createdAt TEXT,\n          updatedAt TEXT\n        )\n      "
          });
        case 6:
          // Create a clean object with valid fields
          now = new Date().toISOString();
          actionItemData = {
            title: actionItem.title || '',
            text: actionItem.text || actionItem.title || '',
            notes: actionItem.notes || '',
            dueDate: actionItem.dueDate || null,
            completed: typeof actionItem.completed === 'number' ? actionItem.completed : 0,
            type: actionItem.type || 'todo',
            createdAt: now,
            updatedAt: now
          };
          console.log('[action-items.js - addActionItem: 310] Saving action item with data:', JSON.stringify(actionItemData));

          // Use direct SQL insertion with string values for iOS compatibility
          insertSQL = "\n      INSERT INTO action_items \n      (title, text, notes, dueDate, completed, type, createdAt, updatedAt) \n      VALUES \n      ('".concat(actionItemData.title, "', '").concat(actionItemData.text, "', '").concat(actionItemData.notes, "', \n       ").concat(actionItemData.dueDate ? "'".concat(actionItemData.dueDate, "'") : 'NULL', ", \n       ").concat(actionItemData.completed, ", \n       '").concat(actionItemData.type, "',\n       '").concat(actionItemData.createdAt, "',\n       '").concat(actionItemData.updatedAt, "')\n    ");
          console.log('[action-items.js - addActionItem: 325] Raw SQL statement:', insertSQL);

          // Execute the SQL directly
          _context4.next = 13;
          return sqlite.execute({
            database: DB_NAME,
            statements: insertSQL
          });
        case 13:
          insertResult = _context4.sent;
          console.log('[action-items.js - addActionItem: 332] Insert result:', JSON.stringify(insertResult));

          // Get the ID in a separate query for compatibility
          _context4.next = 17;
          return sqlite.query({
            database: DB_NAME,
            statement: 'SELECT last_insert_rowid() as id',
            values: []
          });
        case 17:
          lastIdResult = _context4.sent;
          console.log('[action-items.js - addActionItem: 340] Last ID result:', JSON.stringify(lastIdResult));
          newId = null; // Apply the ID if available
          if ((lastIdResult === null || lastIdResult === void 0 || (_lastIdResult$values = lastIdResult.values) === null || _lastIdResult$values === void 0 ? void 0 : _lastIdResult$values.length) > 0) {
            // Handle iOS-specific format where the first item contains column info
            if (lastIdResult.values[0].ios_columns && lastIdResult.values[1]) {
              newId = lastIdResult.values[1].id;
              console.log('[action-items.js - addActionItem: 349] Using iOS format ID:', newId);
            } else {
              // Standard format
              newId = lastIdResult.values[0].id;
              console.log('[action-items.js - addActionItem: 353] Using standard format ID:', newId);
            }
          }

          // Add the ID to the item
          actionItemData.id = newId;

          // Verify the item was inserted by querying for it
          if (!newId) {
            _context4.next = 28;
            break;
          }
          console.log('[action-items.js - addActionItem: 361] Verifying item was inserted with ID:', newId);
          _context4.next = 26;
          return sqlite.query({
            database: DB_NAME,
            statement: "SELECT * FROM action_items WHERE id = ?",
            values: [newId]
          });
        case 26:
          verifyResult = _context4.sent;
          console.log('[action-items.js - addActionItem: 367] Verification result:', JSON.stringify(verifyResult));
        case 28:
          // Log the final action item data with ID
          console.log('[action-items.js - addActionItem: 371] Final action item data:', JSON.stringify(actionItemData));

          // Query all action items to verify storage
          _context4.next = 31;
          return getAllActionItemsDebug();
        case 31:
          return _context4.abrupt("return", actionItemData);
        case 34:
          _context4.prev = 34;
          _context4.t0 = _context4["catch"](0);
          console.error('[action-items.js - addActionItem: 378] Error adding action item:', _context4.t0);
          // Return the original item with its temporary ID
          return _context4.abrupt("return", actionItem);
        case 38:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 34]]);
  }));
  return _addActionItem.apply(this, arguments);
}
function associateActionItemWithContact(_x3, _x4) {
  return _associateActionItemWithContact.apply(this, arguments);
}

/**
 * Toggle completion status of an action item
 * @param {number} actionItemId - Action item ID
 * @returns {Promise<Object>} - Updated action item
 */
function _associateActionItemWithContact() {
  _associateActionItemWithContact = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(contactId, actionItemId) {
    var sqlite, checkResult, exists, now, result, verifyResult;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          console.log("[action-items.js - associateActionItemWithContact: 157] Starting to associate action item ID ".concat(actionItemId, " with contact ID ").concat(contactId));
          sqlite = getSQLite(); // Ensure the join table exists
          _context5.next = 5;
          return sqlite.execute({
            database: DB_NAME,
            statements: "\n        CREATE TABLE IF NOT EXISTS sponsor_contact_action_items (\n          id INTEGER PRIMARY KEY AUTOINCREMENT,\n          contactId INTEGER,\n          actionItemId INTEGER,\n          createdAt TEXT,\n          FOREIGN KEY (contactId) REFERENCES sponsor_contacts(id),\n          FOREIGN KEY (actionItemId) REFERENCES action_items(id)\n        )\n      "
          });
        case 5:
          console.log("[action-items.js - associateActionItemWithContact: 172] Join table verified");

          // Check if association already exists to avoid duplicates
          _context5.next = 8;
          return sqlite.query({
            database: DB_NAME,
            statement: "\n        SELECT * FROM sponsor_contact_action_items \n        WHERE contactId = ? AND actionItemId = ?\n      ",
            values: [contactId, actionItemId]
          });
        case 8:
          checkResult = _context5.sent;
          console.log("[action-items.js - associateActionItemWithContact: 183] Check for existing association result:", JSON.stringify(checkResult));

          // Process the result based on format
          exists = false;
          if (checkResult !== null && checkResult !== void 0 && checkResult.values) {
            if (checkResult.values.length > 0) {
              if (checkResult.values[0].ios_columns) {
                // iOS format
                exists = checkResult.values.length > 1;
              } else {
                // Standard format
                exists = checkResult.values.length > 0;
              }
            }
          }
          if (!exists) {
            _context5.next = 15;
            break;
          }
          console.log("[action-items.js - associateActionItemWithContact: 198] Association already exists, skipping insert");
          return _context5.abrupt("return", true);
        case 15:
          // Create the association in the join table
          now = new Date().toISOString();
          console.log("[action-items.js - associateActionItemWithContact: 204] Creating association with SQL:\n      INSERT INTO sponsor_contact_action_items \n      (contactId, actionItemId, createdAt) \n      VALUES (".concat(contactId, ", ").concat(actionItemId, ", '").concat(now, "')\n    "));
          _context5.next = 19;
          return sqlite.execute({
            database: DB_NAME,
            statements: "\n        INSERT INTO sponsor_contact_action_items \n        (contactId, actionItemId, createdAt) \n        VALUES (?, ?, ?)\n      ",
            values: [contactId, actionItemId, now]
          });
        case 19:
          result = _context5.sent;
          console.log("[action-items.js - associateActionItemWithContact: 217] Insert result:", JSON.stringify(result));

          // Verify the association was created
          _context5.next = 23;
          return sqlite.query({
            database: DB_NAME,
            statement: "SELECT * FROM sponsor_contact_action_items WHERE contactId = ? AND actionItemId = ?",
            values: [contactId, actionItemId]
          });
        case 23:
          verifyResult = _context5.sent;
          console.log("[action-items.js - associateActionItemWithContact: 225] Verification result:", JSON.stringify(verifyResult));
          return _context5.abrupt("return", true);
        case 28:
          _context5.prev = 28;
          _context5.t0 = _context5["catch"](0);
          console.error("[action-items.js - associateActionItemWithContact: 229] Error associating action item ".concat(actionItemId, " with contact ").concat(contactId, ":"), _context5.t0);
          return _context5.abrupt("return", false);
        case 32:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[0, 28]]);
  }));
  return _associateActionItemWithContact.apply(this, arguments);
}
function toggleActionItemCompletion(_x5) {
  return _toggleActionItemCompletion.apply(this, arguments);
}

/**
 * Delete an action item
 * @param {number} actionItemId - Action item ID
 * @returns {Promise<boolean>} - Success status
 */
function _toggleActionItemCompletion() {
  _toggleActionItemCompletion = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(actionItemId) {
    var sqlite, result, currentStatus, newStatus, now, updatedResult;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          sqlite = getSQLite(); // First get the current completion status
          _context6.next = 4;
          return sqlite.query({
            database: DB_NAME,
            statement: 'SELECT completed FROM action_items WHERE id = ?',
            values: [actionItemId]
          });
        case 4:
          result = _context6.sent;
          if (!(!result.values || result.values.length === 0)) {
            _context6.next = 7;
            break;
          }
          throw new Error("Action item with ID ".concat(actionItemId, " not found"));
        case 7:
          // Extract current status, handling iOS format if needed
          currentStatus = 0;
          if (result.values[0].ios_columns && result.values[1]) {
            currentStatus = result.values[1].completed;
          } else {
            currentStatus = result.values[0].completed;
          }

          // Toggle the status
          newStatus = currentStatus === 1 ? 0 : 1;
          now = new Date().toISOString(); // Update the item
          _context6.next = 13;
          return sqlite.execute({
            database: DB_NAME,
            statements: 'UPDATE action_items SET completed = ?, updatedAt = ? WHERE id = ?',
            values: [newStatus, now, actionItemId]
          });
        case 13:
          _context6.next = 15;
          return sqlite.query({
            database: DB_NAME,
            statement: 'SELECT * FROM action_items WHERE id = ?',
            values: [actionItemId]
          });
        case 15:
          updatedResult = _context6.sent;
          if (!(!updatedResult.values || updatedResult.values.length === 0)) {
            _context6.next = 18;
            break;
          }
          throw new Error("Failed to retrieve updated action item with ID ".concat(actionItemId));
        case 18:
          if (!(updatedResult.values[0].ios_columns && updatedResult.values[1])) {
            _context6.next = 22;
            break;
          }
          return _context6.abrupt("return", updatedResult.values[1]);
        case 22:
          return _context6.abrupt("return", updatedResult.values[0]);
        case 23:
          _context6.next = 29;
          break;
        case 25:
          _context6.prev = 25;
          _context6.t0 = _context6["catch"](0);
          console.error("Error toggling completion status for action item ".concat(actionItemId, ":"), _context6.t0);
          throw _context6.t0;
        case 29:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 25]]);
  }));
  return _toggleActionItemCompletion.apply(this, arguments);
}
function deleteActionItem(_x6) {
  return _deleteActionItem.apply(this, arguments);
}
function _deleteActionItem() {
  _deleteActionItem = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(actionItemId) {
    var sqlite;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          sqlite = getSQLite(); // First delete from the join table to maintain referential integrity
          _context7.next = 4;
          return sqlite.execute({
            database: DB_NAME,
            statements: 'DELETE FROM sponsor_contact_action_items WHERE actionItemId = ?',
            values: [actionItemId]
          });
        case 4:
          _context7.next = 6;
          return sqlite.execute({
            database: DB_NAME,
            statements: 'DELETE FROM action_items WHERE id = ?',
            values: [actionItemId]
          });
        case 6:
          return _context7.abrupt("return", true);
        case 9:
          _context7.prev = 9;
          _context7.t0 = _context7["catch"](0);
          console.error("Error deleting action item ".concat(actionItemId, ":"), _context7.t0);
          return _context7.abrupt("return", false);
        case 13:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 9]]);
  }));
  return _deleteActionItem.apply(this, arguments);
}

/***/ })

}]);
//# sourceMappingURL=src_utils_action-items_ts.bundle.js.map