/* global Divider */
/* global GridView */

/**
 * The GaiaGrid component is a helper to display grid-like results.
 * You can find this component used in places like the homescreen and search
 * application.
 */
window.GaiaGrid = (function(win) {
  'use strict';

  // Extend from the HTMLElement prototype
  var proto = Object.create(HTMLElement.prototype);

  // Allow baseurl to be overridden (used for demo page)
  var baseurl = window.GaiaGridBaseurl ||
    '/shared/elements/gaia_grid/';

  proto.createdCallback = function() {
    var shadow = this.createShadowRoot();
    this._template = template.content.cloneNode(true);
    this._styleHack();

    // Todo: render in the shadowRoot
    // By changing the element to this._template we should be able to render
    // to the shadowRoot, although some things are not yet working.
    this._grid = new GridView({
      element: this,
      features: {
        dragdrop: this.getAttribute('dragdrop') !== null,
        zoom: this.getAttribute('zoom') !== null
      }
    });

    shadow.appendChild(this._template);
  };

  /**
   * Helper for GridView.prototype.add
   */
  proto.add = function() {
    this._grid.add.apply(this._grid, arguments);
  };

  /**
   * Helper for GridView.prototype.render
   */
  proto.render = function() {
    this._grid.render.apply(this._grid, arguments);
  };

  /**
   * Helper for GridView.prototype.start
   */
  proto.start = function() {
    this._grid.start.apply(this._grid, arguments);
  };

  /**
   * Helper for GridView.prototype.stop
   */
  proto.stop = function() {
    this._grid.stop.apply(this._grid, arguments);
  };

  /**
   * Adds an item to the grid.
   * Items (only dividers currently) are like icons, but do not need a
   * mapping to each one for click handling.
   * @param {String} identifier
   * @param {Object} obj
   */
  proto.addItem = function(item) {
    if (item) {
      this._grid.items.push(item);
    }
  };

  /**
   * Adds an icon to the grid.
   * Icons need an identifier to for object lookup during event bubbling.
   * @param {String} identifier
   * @param {Object} obj
   */
  proto.addIcon = function(identifier, obj) {
    this._grid.icons[identifier] = obj;
    this._grid.items.push(obj);
console.log('CJC addIcon --> items');
for (var i = 0, iLen= this._grid.items.length;i<iLen;i++) {
console.log('CJC '+this._grid.items[i].detail.manifestURL+':'+
            this._grid.items[i].detail.index);
}
  };

  /**
   * Returns a reference of the grid icons.
   */
  proto.getIcons = function() {
    return this._grid.icons;
  };

  /**
   * Returns a copy of the grid items.
   */
  proto.getItems = function() {
    return this._grid.items;
  };

  /**
   * Removes an icon by identifier.
   * @param {String} identifier
   */
  proto.removeIconByIdentifier = function(identifier) {
    delete this._grid.icons[identifier];
  };

  /**
   * Removes an item by an index.
   * @param {Integer} itemIndex
   */
  proto.removeItemByIndex = function(itemIndex) {
    this._grid.items.splice(itemIndex, 1);
  };

  /**
   * Returns the last item if a divider, otherwise returns null.
   * This is useful for operations which append to the end of the items array
   * as we always have a divider at the end of the list, but often want
   * to add to the last group.
   */
  proto.getLastIfDivider = function() {
    var items = this._grid.items;
    var lastItem = items[items.length - 1];
    if (lastItem instanceof Divider) {
      var divider = items.pop();
      return divider;
    }
    return null;
  };

  /**
   * Returns the position of the last item which is not a divider
   */
  proto.getPostLastIcon = function() {
    var items = this._grid.items;
    for (var i = this._grid.items.length - 1; i >= 0; i--) {
      if (!(items[i] instanceof Divider)) {
        return i;
      }
    }
  };

  /**
   * Move item on orig position to dst position
   * @param {number} orig Element's position to move
   * @param {number} orig New position of the item
   */
  proto.rearrange = function(orig, dst) {
    if (typeof this._grid.dragdrop.rearrange === 'function') {
      this._grid.dragdrop.rearrange(orig, dst);
    }
  };

  /**
   * We clone the scoped stylesheet and append
   * it outside the shadow-root so that we can
   * style projected <content> without the need
   * of the :content selector.
   *
   * When the :content selector lands, we won't
   * need this hack anymore and can style projected
   * <content> from stylesheets within the shadow root.
   * (bug 992249)
   *
   * @private
   */
  proto._styleHack = function() {
    var style = this._template.querySelector('style');
    this.appendChild(style.cloneNode(true));
  };

  var stylesheet = baseurl + 'style.css';
  var template = document.createElement('template');
  template.innerHTML = '<style scoped>' +
    '@import url(' + stylesheet + ');</style>' +
    '<content select=".icons"></content>';

  // Register and return the constructor
  return document.registerElement('gaia-grid', { prototype: proto });
})(window);
