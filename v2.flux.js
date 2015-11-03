(function () {
  'use strict';

  var ProfilePhotoSize = 125;

  var _photos = [];

  var DemoPhotos = [
    {
      srcType: 'url',
      src: '/v2/img/robot_u.jpeg',
      thumbnailSrc: null,
      selected: false
    },
    {
      srcType: 'url',
      src: '/v2/img/robot_v.jpeg',
      thumbnailSrc: null,
      selected: true
    },
    {
      srcType: 'url',
      src: '/v2/img/robot_w.jpeg',
      thumbnailSrc: null,
      selected: false
    },
    {
      srcType: 'url',
      src: '/v2/img/robot_x.jpeg',
      thumbnailSrc: null,
      selected: false
    },
    {
      srcType: 'url',
      src: '/v2/img/robot_y.jpeg',
      thumbnailSrc: null,
      selected: false
    },
    {
      srcType: 'url',
      src: '/v2/img/robot_z.jpeg',
      thumbnailSrc: null,
      selected: false
    },
    {
      srcType: 'url',
      src: '/v2/img/robot_s.jpeg',
      thumbnailSrc: null,
      selected: false
    }
  ];

  var _modes = [
    {
      name: 'profile',
      label: 'Profile',
      selected: true,
      iconClass: 'fa fa-user',
      resizable: false,
      draggable: true,
      resolve: function(w, h) {
        if(w / h > 1) {
          w = (w > ProfilePhotoSize ? ProfilePhotoSize : h);
          h = w;
        } else {
          h = (h > ProfilePhotoSize ? ProfilePhotoSize : w);
          w = h;
        }
        return [w, h];
      }
    },
    {
      name: 'coverPhoto',
      label: 'Cover Photo',
      selected: false,
      iconClass: 'fa fa-picture-o',
      resizable: true,
      draggable: true,
      resolve: function(w, h) {
        if(w / 3 > h) {
          h *= 0.8;
          w = h * 3;
        } else {
          w *= 0.8;
          h = w / 3;
        }
        return [w, h];
      }
    }
  ];

  var DataStore = Object.assign({}, EventEmitter.prototype, {
    initialize: function(config) {
      _photos = config.isDemo ? DemoPhotos : config.photos;
    },
    getPhotos: function() {
      return _photos;
    },
    getSelectedPhoto: function() {
      return _photos.find(function(p) {
        return p.selected;
      });
    },
    addPhoto: function(photo) {
      _photos.push(photo);
      DataStore.trigger('change');
    },
    setSelectedPhoto: function(photo) {
      this.getSelectedPhoto().selected = false;
      _photos.find(function(p) {
        return p.src === photo.src;
      }).selected = true;
      DataStore.trigger('change');
    },
    getModes: function() {
      return _modes;
    },
    getSelectedMode: function() {
      return _modes.find(function(m) {
        return m.selected;
      });
    },
    setSelectedMode: function(mode) {
      this.getSelectedMode().selected = false;
      _modes.find(function(m) {
        return m.name === mode.name;
      }).selected = true;
      DataStore.trigger('change');
    },
  });

  var Dispatcher = new Flux.Dispatcher();

  Dispatcher.register(function(payload) {
    if (payload.actionType === 'select-photo') {
      DataStore.setSelectedPhoto(payload.selectedPhoto);
    }
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports = {
      Dispatcher: Dispatcher,
      DataStore: DataStore
    };
  } else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    // register as 'classnames', consistent with npm package name
    define('Dispatcher', function () {
      return Dispathcer;
    });
    define('DataStore', function () {
      return DataStore;
    });
  } else {
    window.Dispatcher = Dispatcher;
    window.DataStore = DataStore;
  }
}());
