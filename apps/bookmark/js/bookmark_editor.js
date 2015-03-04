'use strict';

/* global UrlHelper, BookmarksDatabase, Icon */
/* exported BookmarkEditor */

var BookmarkEditor = {
  BOOKMARK_ICON_SIZE: 60,

  init: function bookmarkEditor_show(options) {
    this.data = options.data;
    this.onsaved = options.onsaved;
    this.oncancelled = options.oncancelled;
    var mode = 'add';
    BookmarksDatabase.get(this.data.url).then((function got(bookmark) {
      if (bookmark) {
        this.data = bookmark;
        mode = 'put';
      }
      this._init(mode);
    }).bind(this), this._init.bind(this, mode));
  },

  _init: function bookmarkEditor_init(mode) {
    var _ = navigator.mozL10n.get;
    this.mode = document.body.dataset.mode = mode;
    this.bookmarkTitle = document.getElementById('bookmark-title');
    this.bookmarkIcon = document.getElementById('bookmark-icon');
    this.cancelButton = document.getElementById('cancel-button');
    this.saveButton = document.getElementById('done-button');
    this.appInstallationSection = document.getElementById('app-installation');
    this.appNameText = document.getElementById('app-name');
    this.installAppButton = document.getElementById('install-app-button');

    this.cancelButton.addEventListener('click', this.close.bind(this));
    this.saveListener = this.save.bind(this);
    this.saveButton.addEventListener('click', this.saveListener);

    this.bookmarkTitle.value = this.data.name || '';

    this._renderIcon();

    if (this.data.manifestURL) {
      this.manifestURL = this.data.manifestURL;
      this._fetchManifest(this.manifestURL);
    }

    this._checkDoneButton();
    this.form = document.getElementById('bookmark-form');
    this.form.addEventListener('input', this._checkDoneButton.bind(this));
    this.form.addEventListener('submit', this._submit.bind(this));
    var touchstart = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
    this.clearButton = document.getElementById('bookmark-title-clear');
    this.clearButton.addEventListener(touchstart, this._clearTitle.bind(this));
    if (mode === 'put') {
      this._onEditMode();
      this.saveButton.textContent = _('done-action');
    } else {
      this.saveButton.textContent = _('add-action');
    }

    // We're appending new elements to DOM so to make sure headers are
    // properly resized and centered, we emmit a lazyload event.
    // This will be removed when the gaia-header web component lands.
    window.dispatchEvent(new CustomEvent('lazyload', {
      detail: document.body
    }));
  },

  _renderIcon: function renderIcon() {
    var icon = new Icon(this.bookmarkIcon, this.data.icon);
    icon.render({'size': this.BOOKMARK_ICON_SIZE});
  },

  _fetchManifest: function bookmarkEditor_fetchManifest(manifestURL) {
    var manifestPromise = window.WebManifestHelper.getManifest(manifestURL);

    manifestPromise.then((function(manifestData) {
      if (manifestData) {
        this.installAppButtonListener = this._installApp.bind(this);
        this.installAppButton.addEventListener('click',
          this.installAppButtonListener);
        this.appInstallationSection.classList.remove('hidden');
        this.appNameText.textContent = manifestData.short_name ||
          manifestData.name;
      }
    }).bind(this)).catch(function(error) {
      console.error('Unable to get web manifest: ' + error);
    });

    return manifestPromise;
  },

  _onEditMode: function bookmarkEditor_onEditMode() {
    // Done button will be disabled on edit mode once it is displayed
    this.saveButton.disabled = true;
  },

  close: function bookmarkEditor_close() {
    this.oncancelled();
  },

  /**
   * Handles the submit case for the form when the user presses the enter key.
   * @param {Event} event The form submit event.
   */
  _submit: function(event) {
    event.preventDefault();
    this.save();
  },

  _clearTitle: function bookmarkEditor_clearTitle(event) {
    event.preventDefault();
    this.bookmarkTitle.value = '';
    this._checkDoneButton();
  },

  _checkDoneButton: function bookmarkEditor_checkDoneButton() {
    // If one of the ﬁelds is blank, the “Done” button should be dimmed and
    // inactive
    var title = this.bookmarkTitle.value.trim();
    this.saveButton.disabled = title === '';
  },

  _installApp: function bookmarkEditor_installApp() {
    var request = window.navigator.mozApps.install(this.manifestURL);

    request.onerror = (evt) => {
      // Display the error information from the DOMError object
      var reason = evt.target.error.name;
      switch(reason) {
        case 'INVALID_MANIFEST':
        case 'MANIFEST_URL_ERROR':
        case 'MANIFEST_PARSE_ERROR':
        case 'MULTIPLE_APPS_PER_ORIGIN_FORBIDDEN':
          // All these errors will be handled in the same way.
          this._showInstallError('install_failed');
          break;
        case 'REINSTALL_FORBIDDEN':
        case 'NETWORK_ERROR':
          // Reinstalls of apps are forbidden or connection error.
          this._showInstallError(reason.toLowerCase());
          break;
        case 'DENIED':
          // Nothing to do here.
          break;
      }
    };
  },

  _showInstallError: function bookmarkEditor_showInstallError(reason) {
    alert(navigator.mozL10n.get(reason, {
      appName: this.appNameText.textContent
    }));
  },

  save: function bookmarkEditor_save(evt) {
    this.saveButton.removeEventListener('click', this.saveListener);
    if (this.installAppButtonListener) {
      this.installAppButton.removeEventListener('click',
        this.installAppButtonListener);
    }

    // Only allow urls to be bookmarked.
    // This is defensive check - callers should filter out non-URLs.
    var url = this.data.url.trim();
    if (UrlHelper.isNotURL(url)) {
      this.oncancelled();
      return;
    }

    this.data.name = this.bookmarkTitle.value;
    this.data.url = url;

    BookmarksDatabase[this.mode](this.data).then(this.onsaved.bind(this),
                                                 this.close.bind(this));
  }
};
