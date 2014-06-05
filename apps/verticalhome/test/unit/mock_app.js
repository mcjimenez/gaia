'use strict';

function MockApp() {
  MockApp.initialized = false;
}

MockApp.prototype = {
  init: function() {
    MockApp.initialized = true;
  },
  mGetInitialized: function () {
    return MockApp.initialized;
  }
};

MockApp.mTeardown = function mp_mTeardown() {
  delete MockApp.initialized;
};

