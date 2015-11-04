(function () {
  'use strict';

  var ProfilePhotoSize = 125;

  var _photos = [];
  var _croppedImageDataURL;

  var DemoPhotos = [
    {
      srcType: 'url',
      src: '/img/robot_u.jpeg',
      thumbnailSrc: null,
      selected: true
    },
    {
      srcType: 'url',
      src: '/img/robot_v.jpeg',
      thumbnailSrc: null,
      selected: false
    },
    {
      srcType: 'url',
      src: '/img/robot_w.jpeg',
      thumbnailSrc: null,
      selected: false
    },
    {
      srcType: 'url',
      src: '/img/robot_x.jpeg',
      thumbnailSrc: null,
      selected: false
    },
    {
      srcType: 'url',
      src: '/img/robot_y.jpeg',
      thumbnailSrc: null,
      selected: false
    },
    {
      srcType: 'url',
      src: '/img/robot_z.jpeg',
      thumbnailSrc: null,
      selected: false
    },
    {
      srcType: 'url',
      src: '/img/robot_s.jpeg',
      thumbnailSrc: null,
      selected: false
    }
  ];

  var _modes = [
    {
      name: 'profile',
      label: 'Profile',
      title: 'Profile Photo',
      selected: true,
      iconClass: 'fa fa-user',
      resizable: false,
      draggable: true,
      resolve: function(box, w, h) {
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
      label: 'Cover',
      title: 'Cover Photo',
      selected: false,
      iconClass: 'fa fa-picture-o',
      resizable: true,
      draggable: true,
      resolve: function(box, w, h) {
        if(w > box.width) {
          w = box.width;
          h = box.height;
        }

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

  var _carousel = false;
  var _fixedMode = true;

  var DataStore = Object.assign({}, EventEmitter.prototype, {
    initialize: function(config) {
      _photos = config.isDemo ? DemoPhotos : (config.photos || []);
      if(config.mode) {
        this.setSelectedMode({name: config.mode}, true);
      }
      if(config.photo) {
        if(_photos.length === 0) {
          _photos.push(config.photo);
        }
        this.setSelectedPhoto(config.photo, true)
      }
      this.setCarousel(config.carousel, true);
      this.setFixedMode(config.fixedMode, true);
    },
    setCarousel: function(carousel, pass) {
      _carousel = !!carousel;
      if(!pass) DataStore.trigger('change');
    },
    getCarousel: function() {
      return _carousel;
    },
    setFixedMode: function(fixedMode, pass) {
      _fixedMode = fixedMode;
      if(!pass) DataStore.trigger('change');
    },
    getFixedMode: function() {
      return _fixedMode;
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
    setSelectedPhoto: function(photo, pass) {
      if(_photos.length === 0) {
        photo.selected = true;
        _photos.push(photo);
      } else {
        var selectedPhoto = this.getSelectedPhoto();
        if(selectedPhoto) {
          selectedPhoto.selected = false;
        }
        var targetPhoto = _photos.find(function(p) {
          return p.src === photo.src;
        });
        if(targetPhoto) {
          targetPhoto.selected = true;
        } else {
          photo.selected = true;
          _photos.push(photo);
        }
      }
      if(!pass) DataStore.trigger('change');
    },
    getModes: function() {
      return _modes;
    },
    getSelectedMode: function() {
      return _modes.find(function(m) {
        return m.selected;
      });
    },
    setSelectedMode: function(mode, pass) {
      this.getSelectedMode().selected = false;
      _modes.find(function(m) {
        return m.name === mode.name;
      }).selected = true;
      if(!pass) DataStore.trigger('change');
    },
    setCroppedImage: function(dataURL) {
      _croppedImageDataURL = dataURL;
    },
    getCroppedImage: function() {
      return _croppedImageDataURL;
    }
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
