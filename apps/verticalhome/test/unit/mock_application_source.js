'use strict';

var entries = [
{
  'app':{},
  'detail':{
    'type':'app',
    'manifestURL':'app://gallery.gaiamobile.org/manifest.webapp',
    'index':0
  },
  'accurateIcon':'app://gallery.gaiamobile.org/style/icons/Gallery_120.png'
},{
  'app':{},
  'detail':{
    'type':'app',
    'manifestURL':'app://clock.gaiamobile.org/manifest.webapp',
    'index':1
  },
  'accurateIcon':'app://clock.gaiamobile.org/style/icons/Clock_120.png'
},{
  'app':{},
  'detail':{
    'type':'app',
    'manifestURL':'app://keyboard.gaiamobile.org/manifest.webapp',
    'index':2
  },
  'accurateIcon':'style/images/default_icon.png'
},{
  'app':{},
  'detail':{
    'type':'app',
    'manifestURL':'app://camera.gaiamobile.org/manifest.webapp',
    'index':3
  },
  'accurateIcon':'app://camera.gaiamobile.org/style/icons/Camera_120.png'
},{
  'app':{},
  'detail':{
    'type':'app',
    'manifestURL':'app://music.gaiamobile.org/manifest.webapp',
    'index':4
  },
  'accurateIcon':'app://music.gaiamobile.org/style/icons/Music_120.png'
},{
  'app':{},
  'detail':{
    'type':'app',
    'manifestURL':'app://browser.gaiamobile.org/manifest.webapp',
    'index':5
  },
  'accurateIcon':'app://browser.gaiamobile.org/icons/Browser_120.png'
},{
  'app':{},
  'detail':{
    'type':'app',
    'manifestURL':'app://email.gaiamobile.org/manifest.webapp',
    'index':6
  },
  'accurateIcon':'app://email.gaiamobile.org/style/icons/Email_120.png'
},{
  'app':{},
  'entryPoint':'contacts',
  'detail':{
    'type':'app',
    'manifestURL':'app://communications.gaiamobile.org/manifest.webapp',
    'entryPoint':'contacts',
    'index':7
  },
  'accurateIcon':'app://communications.gaiamobile.org/contacts/style/icons/Cont'
},{
  'app':{},
  'entryPoint':'dialer',
  'detail':{
    'type':'app',
    'manifestURL':'app://communications.gaiamobile.org/manifest.webapp',
    'entryPoint':'dialer',
    'index':8
  },
  'accurateIcon':'app://communications.gaiamobile.org/dialer/icons/Dialer.png'
}];

function MockApplicationSource() {
  this.entries = entries;
}

MockApplicationSource.prototype = {
  addPreviouslyInstalledSvApp: function(manifestURL) {
  },
  mapToApp: function (item) {
  },
  populate: function (next){
    next(this.entries);
  }
};

