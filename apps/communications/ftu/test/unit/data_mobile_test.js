'use strict';

requireApp(
  'communications/shared/test/unit/mocks/mock_navigator_moz_settings.js');
requireApp('communications/ftu/js/navigation.js');
requireApp('communications/ftu/js/data_mobile.js');

suite('mobile data >', function() {
  var realSettings,
      settingToggleKey = 'ril.data.enabled',
      settingApnKey = 'ril.data.apnSettings';
  var TINY_TIMEOUT = 30;

  suiteSetup(function() {
    realSettings = navigator.mozSettings;
    navigator.mozSettings = window.MockNavigatorSettings;

    DataMobile.init();
  });

  suiteTeardown(function() {
    navigator.mozSettings = realSettings;
    realSettings = null;
  });

  suite('Load APN values from database', function() {
    var result;

    setup(function(done) {
      window.MockNavigatorSettings.mSettings[settingApnKey] = '[[]]';
      DataMobile.getAPN(function(response) {
        result = response;
        done();
      });
    });

    test('Values are loaded', function() {
      assert.isNotNull(result);
    });

    test('Observer is added before', function() {
      assert.isNotNull(window.MockNavigatorSettings.mObservers);
    });

    test('Observer is removed after', function() {
      assert.isNotNull(window.MockNavigatorSettings.mRemovedObservers);
    });
  });

  suite('Toggle status of mobile data', function() {
    test('toggle status of mobile data', function(done) {
      DataMobile.toggle(true, function() {
        assert.isTrue(window.MockNavigatorSettings.mSettings[settingToggleKey]);
        done();
      });
    });

    test('toggle status of mobile data', function(done) {
      DataMobile.toggle(false, function() {
        assert.isFalse(
          window.MockNavigatorSettings.mSettings[settingToggleKey]
        );
        done();
      });
    });
  });

  suite('Get data status', function() {

    var KEY = 'ril.data.enabled';
    var KEY_SV = 'ftu.ril.data.enabled';
    var clock;
    var realCurrentStep;

    var testCases = [
      {
        'title' : KEY + '= true' + ' and not ' + KEY_SV,
        'key': true,
        'expectedValue': true
      },
      {
        'title' : KEY + '= false' + ' and not ' + KEY_SV,
        'key': false,
        'expectedValue': false
      },
      {
        'title' : KEY + '= true' + ' and ' + KEY_SV + '= true',
        'key': true,
        'keySV': true,
        'expectedValue': true
      },
      {
        'title' : KEY + '= true' + ' and ' + KEY_SV + '= false',
        'key': true,
        'keySV': false,
        'expectedValue': false
      },
      {
        'title' : KEY + '= false' + ' and ' + KEY_SV + '= true',
        'key': false,
        'keySV': true,
        'expectedValue': true
      },
      {
        'title' : KEY + '= false' + ' and ' + KEY_SV + '= false',
        'key': false,
        'keySV': false,
        'expectedValue': false
      }
    ];

    setup(function() {
      realCurrentStep = Navigation.currentStep;
      Navigation.currentStep = DataMobile.STEP_DATA_3G;
      clock = this.sinon.useFakeTimers();
      DataMobile.init();
    });

    teardown(function() {
      window.MockNavigatorSettings.mTeardown();
      Navigation.currentStep = realCurrentStep;
      clock.restore();
    });

    testCases.forEach(function(testCase) {
      test(testCase.title, function(done) {
        window.MockNavigatorSettings.mSettings[KEY] = testCase.key;
        window.MockNavigatorSettings.mSettings[KEY_SV] = testCase.keySV;
        DataMobile.getStatus(function() {});
        clock.tick(TINY_TIMEOUT);
        assert.equal(DataMobile.isDataAvailable, testCase.expectedValue);
        done();
      });
    });
  });
});
