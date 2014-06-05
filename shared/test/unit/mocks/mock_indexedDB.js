'use strict';
/* global sinon */
/* exported MockIndexedDB */

function MockIndexedDB() {
console.log('CJC mock MockIndexedDB');

  var transRequest = {};

  var dbs = [];
  var deletedDbs = [];
  this.options = {};
  this.storedDataDbs = {};

  var self = this;

  Object.defineProperty(this, 'dbs', {
    get: function() {
      return dbs;
    }
  });

  Object.defineProperty(this, 'deletedDbs', {
    get: function() {
      return deletedDbs;
    }
  });

  var FakeDB = function(name , storedData) {
    var dummyFunction = function(obj) {
      return obj;
    };
    this.receivedData = [];
    this.deletedData = [];
    this.storedData = storedData || {};
    this.options = {};
    this.indexName = [];

    var self = this;

    var objectStore = {
      createIndex: function(name, keyPath, optional) {
console.log('mock createIndex:'+name);
        self.indexName[self.indexName.length] = name;
console.log('indices:'+self.indexName);
      }
    };


    this.objectStoreNames = ['fakeObjStore'];
    this.createObjectStore = dummyFunction.bind(undefined,
                                                objectStore);
console.log('***CJC mock :'+ JSON.stringify(this.createObjectStore));
    this.deleteObjectStore = dummyFunction;
    this.transaction = sinon.stub();
    this.objectStore = sinon.stub();
    this.get = dummyFunction;
    this.put = dummyFunction;
/*
    this.put = function (data) {
console.log('CJC EKECUTA PIUT'+index);
      var index = self.indexName || Object.keys(data)[0];
console.log('CJC put:'+index);
      self.storedData[index] = data;
    };
*/
    this.delete = dummyFunction;
    this.openCursor = dummyFunction;
    this.close = dummyFunction;
    this.clear = dummyFunction;
/*
    this.clear = function() {
console.log('CJC ejecuta clear');
      self.storedData = {};
    };
*/
    this.index = sinon.stub();
    this.index.returns(this);
    this.transaction.returns(this);
    this.objectStore.returns(this);

    sinon.stub(this, 'close', function() {
      self.isClosed = true;
    });

    sinon.stub(this, 'put', function(data) {
console.log('CJC PUUUUTTTT');
      self.receivedData.put(data);
      var index = self.indexName.length > 0 && self.indexName[0] ||
                  Object.keys(data)[0];
console.log('CJC INDICE:::'+index);
      self.storedData[data[index]] = data;
      return transRequest;
    });

    sinon.stub(this, 'get', function(key) {
      return _getRequest(self.storedData[key]);
    });

    sinon.stub(this, 'openCursor', function() {
console.log('CJC openCursor!!!');
      if (self.options.cursorOpenInError === true) {
console.log('CJC errores!!!');
        return _getRequest(null, {
          isInError: true
        });
      }
      if (Object.keys(self.storedData).length === 0) {
console.log('CJC sin datos!!!');
        return _getRequest(null);
      }
console.log('CJC crearCursor!!!');

      var cursor = new FakeCursor(self.storedData);
      var req = _getRequest(cursor);
      cursor.request = req;

      return req;
    });

    sinon.stub(this, 'delete', function(id) {
      if (Array.isArray(self.options.deleteInError) &&
          self.options.deleteInError.indexOf(id) !== -1) {
        return _getRequest(null, {
          isInError: true
        });
      }

      delete self.storedData[id];
      self.deletedData.push(id);
      return _getRequest(true);
    });
  };

  var FakeCursor = function(data) {
    var _pointer = 0;
    var keys = Object.keys(data);

    Object.defineProperty(this, 'value', {
      get: function() {
        return data[keys[_pointer]];
      }
    });

    this.continue = function() {
      _pointer++;
      if (_pointer < keys.length) {
        this.request.done(this);
      }
      else {
        this.request.done(null);
      }
    };
  };

  sinon.stub(window.indexedDB, 'open', function(name) {
console.log('CJC indexedDB::open');
    if (Array.isArray(self.options.inErrorDbs) &&
        self.options.inErrorDbs.indexOf(name) !== -1) {
      return _getRequest(null, {
        isInError: true
      });
    }

    var db = new FakeDB(name, self.storedDataDbs[name]);
console.log('CJC name:'+name);
    dbs.push(db);
    var outReq = _getRequest(db, {
      upgradeNeeded: (Array.isArray(self.options.upgradeNeededDbs) &&
                      self.options.upgradeNeededDbs.indexOf(name) !== -1)
    });

    return outReq;
  });

  sinon.stub(window.indexedDB, 'deleteDatabase', function(name) {
    deletedDbs.push(name);
    return _getRequest(null);
  });


  function _getRequest(result, opts) {
console.log('CJC _getRequest::opts:' + JSON.stringify(opts));
    var options = opts || {};
    return {
      result: result,
      error: null,
      set onerror(cb) {
        if (options.isInError) {
          this.error = {
            name: 'DB In Error'
          };
          cb({
              target: this
          });
        }
      },
      set onsuccess(cb) {
        this._doneCb = cb;
        if (!options.isInError) {
          cb({
              target: this
          });
        }
      },
      set onupgradeneeded(cb) {
        if (options.upgradeNeeded) {
          cb({
              target: this
          });
        }
      },
      done: function(result) {
        this.result = result;
        if (typeof this._doneCb === 'function') {
          this._doneCb({
            target: this
          });
        }
      }
    };
  }
}
