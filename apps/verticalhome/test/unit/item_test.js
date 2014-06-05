'use strict';

/* global MocksHelper, MockIndexedDB, ItemStore  */
require('/shared/test/unit/mocks/mock_indexedDB.js');
require('/test/unit/mock_application_source.js');
require('/test/unit/mock_bookmark_source.js');
require('/test/unit/mock_collection_source.js');
require('/test/unit/mock_configurator.js');
require('/test/unit/mock_divider.js');

// Unit tests for item library
requireApp('verticalhome/js/stores/item.js');

var mocksHelperForItemStore = new MocksHelper([
  'ApplicationSource',
  'BookmarkSource',
  'CollectionSource',
  'Divider'
]).init();

suite('item.js >', function() {
  var mockIndexedDB;

  var dataStoreItems = {
    '0': {
      'type':'app',
      'manifestURL':'app://gallery.gaiamobile.org/manifest.webapp',
      'index':0
    },
    '1': {
      'type':'app',
      'manifestURL':'app://clock.gaiamobile.org/manifest.webapp',
      'index':1
    },
    '2': {
      'type':'app',
      'manifestURL':'app://keyboard.gaiamobile.org/manifest.webapp',
      'index':2
    },
    '3': {
      'type':'app',
      'manifestURL':'app://camera.gaiamobile.org/manifest.webapp',
      'index':3
    },
    '4': {
      'type':'app',
      'manifestURL':'app://music.gaiamobile.org/manifest.webapp',
      'index':4
    },
    '5': {
      'type':'app',
      'manifestURL':'app://browser.gaiamobile.org/manifest.webapp',
      'index':5
    },
    '6': {
      'type':'app',
      'manifestURL':'app://email.gaiamobile.org/manifest.webapp',
      'index':6
    },
    '7': {
      'type':'app',
        'manifestURL':'app://communications.gaiamobile.org/manifest.webapp',
        'entryPoint':'contacts',
        'index':7
    },
    '8': {
      'type':'app',
      'manifestURL':'app://communications.gaiamobile.org/manifest.webapp',
      'entryPoint':'dialer',
      'index':8
    }
  };

  mocksHelperForItemStore.attachTestHelpers();

  suiteSetup(function() {
    mockIndexedDB = new MockIndexedDB();
    mocksHelperForItemStore.suiteSetup();
  });

  suiteTeardown(function() {
    mocksHelperForItemStore.suiteTeardown();
  });

  setup(function() {
    mocksHelperForItemStore.setup();
  });

  teardown(function() {
    mocksHelperForItemStore.teardown();
  });

  test('ItemStore new >', function() {
    mockIndexedDB.options.upgradeNeededDbs = ['verticalhome'];

    mockIndexedDB.storedDataDbs = {
      'verticalhome': dataStoreItems
    };

    var itemStore = new ItemStore();

for (var i in mockIndexedDB.dbs[0].storedData){
    console.log('CJC TESTS!!!!:'+
JSON.stringify(mockIndexedDB.dbs[0].storedData[i]));
}

console.log('CJC temp para q no catne el hint ' + itemStore);
for (var j in mockIndexedDB.dbs[0].receivedData){
    console.log('CJC TESTS:'+
JSON.stringify(mockIndexedDB.dbs[0].receivedData[j]));
}
  });
});
