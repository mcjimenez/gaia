'use strict';
/* global Icon, Configurator */

(function(exports) {

  /**
   * ApplicationSource is responsible for populating the iniial application
   * results as well as mapping indexedDB records to app objects for launching.
   * @param {Object} store The backing database store class.
   */
  function ApplicationSource(store) {
    this.store = store;
    this.entries = [];
    this.entriesByManifestUrl = {};
    this.svPreviouslyInstalledApps = [];
    // Store the pending apps to be installed until SingleVariant conf is loaded
    var pendingInstallRequests = [];

    function addSVEventListener() {
      window.addEventListener('singlevariant-ready', function svFileReady(ev) {
        window.removeEventListener('singlevariant-ready', svFileReady);
        for (var i = 0; i < pendingInstallRequests; i++) {
          pendingInstallRequests[i]();
        }
      });
    }

    addSVEventListener();

    var appMgr = navigator.mozApps.mgmt;

    appMgr.getAll().onsuccess = function onsuccess(event) {
      for (var i = 0, iLen = event.target.result.length; i < iLen; i++) {
        this.makeIcons(event.target.result[i]);
      }
    }.bind(this);

    /*
     * Adds a new application to the layout when the user installed it
     * from market
     *
     * @param {Application} app
     *                      The application object
     */
    function install(application) {
      /* jshint validthis: true */
      // There is a last divider that is always in the list, but not rendered
      // unless in edit mode.
      // Remove this divider, append the app, then re-append the divider.
      var lastDivider = app.grid.getLastIfDivider();
      this.addIconToGrid(application);
      var svApp = Configurator.getSingleVariantApp(application.manifestURL);
      var lastElem = app.grid.getPostLastIcon();
      if (Configurator.isSimPresentOnFirstBoot && svApp &&
          !this.isPreviouslyInstalled(application.manifestURL) &&
          svApp.location < lastElem ) {
        app.grid.rearrange(lastElem, svApp.location);
        moveAHead(svApp.location + 1);
        this.addPreviouslyInstalledSvApp(application.manifestURL);
        app.itemStore.savePrevInstalledSvApp(this.svPreviouslyInstalledApps);
      }
      app.grid.addItem(lastDivider);

      app.grid.render();
      app.itemStore.save(app.grid.getItems());
    }

    function moveAHead(startPos) {
      var elems = app.grid.getItems();
      for (var i = startPos, len = elems.length; i < len; i++) {
        var item = elems[i];
        //At the moment SV only configures apps
        if (item instanceof Icon) {
          //elems[i].identifier returns manifestURL-entry_points
          var svApp = Configurator.getSingleVariantApp(elems[i].identifier);
          if (svApp && i > svApp.location) {
            app.grid.rearrange(i, i - 1);
          }
        }
      }
    }

    appMgr.oninstall = function oninstall(event) {
      if (Configurator.isSingleVariantReady) {
        install.bind(this)(event.application);
      } else {
        pendingInstallRequests.push(install.bind(this, event.application));
      }
    }.bind(this);

    appMgr.onuninstall = function onuninstall(event) {
      this.removeIconFromGrid(event.application.manifestURL);
      app.itemStore.save(app.grid.getItems());
    }.bind(this);

  }

  ApplicationSource.prototype = {

    /**
     * Synchronizes our local result set with mozApps.
     */
    synchronize: function() {
      var storeItems = this.store._allItems;
      var toAdd = [];

      var appIconsByManifestUrl = {};
      for (var i = 0, iLen = storeItems.length; i < iLen; i++) {
        var item = storeItems[i];
        if (!(item instanceof Icon)) {
          continue;
        }
        appIconsByManifestUrl[item.detail.manifestURL] = item;
      }

      for (i = 0, iLen = this.entries.length; i < iLen; i++) {
        var entry = this.entries[i];
        if (!appIconsByManifestUrl[entry.detail.manifestURL] &&
            !entry.app.manifest.entry_points) {
          toAdd.push(entry);
        } else {
          delete appIconsByManifestUrl[entry.detail.manifestURL];
        }
      }

      // Check for icons we need to delete
      for (i in appIconsByManifestUrl) {
        this.removeIconFromGrid(i);
      }

      toAdd.forEach(function _toAdd(newApp) {
        this.addIconToGrid(newApp.app);
      }, this);

      app.itemStore.save(app.grid.getItems());
    },

    /**
     * Adds a new icon to the grid
     */
    addIconToGrid: function(application) {
      this.makeIcons(application);
      var appObject = this.mapToApp({
        manifestURL: application.manifestURL
      });
      app.grid.addIcon(appObject.identifier, appObject);
      app.grid.render();
    },

    /**
     * Removes an icon from the grid.
     * @param {String} manifestURL
     */
    removeIconFromGrid: function(manifestURL) {
      var icons = app.grid.getIcons();
      var appObject = icons[manifestURL];
      app.grid.removeIconByIdentifier(manifestURL);

      var items = app.grid.getItems();
      var itemIndex = items.indexOf(appObject);
      app.grid.removeItemByIndex(itemIndex);
      app.grid.render();

      if (appObject.element) {
        appObject.element.parentNode.removeChild(appObject.element);
      }
    },

    /**
     * Populates the initial application data from mozApps.
     * @param {Function} success Called after we fetch all initial data.
     */
    populate: function(success) {
      success(this.entries);
    },

    /**
     * Creates entries for an app based on hidden roles and entry points.
     */
    makeIcons: function(eachApp) {
      var manifest = eachApp.manifest || eachApp.updateManifest;

      if (app.HIDDEN_ROLES.indexOf(manifest.role) !== -1) {
        return;
      }

      function eachIcon(icon) {
        /* jshint validthis:true */

        // If there is no icon entry, do not push it onto items.
        if (!icon.icon) {
          return;
        }
        icon.setPosition(this.store.getNextPosition());
        this.entries.push(icon);
      }

      this.entriesByManifestUrl[eachApp.manifestURL] = eachApp;

      if (manifest.entry_points) {
        for (var i in manifest.entry_points) {
          eachIcon.call(this, new Icon(eachApp, i));
        }
      } else {
        eachIcon.call(this, new Icon(eachApp));
      }
    },

    /**
     * Maps a database entry to a mozApps application
     */
    mapToApp: function(entry) {
      // Handle non app objects for applications which exist in our local store
      // but not mozApps.
      var app = this.entriesByManifestUrl[entry.manifestURL];
      app = app || {
        manifestURL: entry.manifestURL,
        manifest: {
          name: '',
          icons: []
        }
      };

      return new Icon(app,
        entry.entryPoint);
    },

    /**
     * Add a reference to singleVariant app previously installed
     */
    addPreviouslyInstalledSvApp: function(entry) {
      this.svPreviouslyInstalledApps.push({manifestURL:entry});
    },

    /*
     * Return true if manifest is in the array of installed singleVariant apps,
     * false otherwise
     * @param {string} app's manifest consulted
     */
    isPreviouslyInstalled: function(manifest) {
      for (var i = 0, elemNum = this.svPreviouslyInstalledApps.length;
           i < elemNum; i++) {
        if (this.svPreviouslyInstalledApps[i].manifestURL === manifest) {
          return true;
        }
      }
      return false;
    }

  };

  exports.ApplicationSource = ApplicationSource;

}(window));
