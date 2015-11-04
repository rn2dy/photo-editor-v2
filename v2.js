(function () {
  'use strict';

  var Header = React.createClass({
    closePhotoEditor: function () {
      Dispatcher.dispatch({
        actionType: 'close-all'
      });
    },
    render: function () {
      return React.createElement(
        'header',
        null,
        React.createElement(
          'h3',
          null,
          'Profile / Cover Photo Editor'
        ),
        React.createElement('i', { className: 'fa fa-remove', onClick: this.closePhotoEditor })
      );
    }
  });

  var Footer = React.createClass({
    savePhoto: function () {
      Dispatcher.dispatch({
        actionType: 'save-photo'
      });
    },
    closePhotoEditor: function () {
      Dispatcher.dispatch({
        actionType: 'close-all'
      });
    },
    render: function () {
      return React.createElement(
        'footer',
        null,
        React.createElement(
          'button',
          { className: 'pe-btn', onClick: this.savePhoto },
          'Save'
        ),
        React.createElement(
          'button',
          { className: 'pe-btn pe-cancel', onClick: this.closePhotoEditor },
          'Cancel'
        )
      );
    }
  });

  var Menu = React.createClass({
    selectMode: function (mode) {
      DataStore.setSelectedMode(mode);
    },
    render: function () {
      var self = this;
      var menuItems = this.props.modes.map(function (mode, id) {
        var classes = classNames({
          'pe-menu-item': true,
          'pe-active': mode.selected
        });
        return React.createElement(
          'div',
          { className: classes, title: mode.label, key: id },
          React.createElement('i', { className: mode.iconClass, onClick: self.selectMode.bind(self, mode) })
        );
      });

      return React.createElement(
        'div',
        { className: 'pe-menu' },
        menuItems
      );
    }
  });

  var Carousel = React.createClass({
    scroll: function (e) {
      e.currentTarget.scrollTop += e.deltaY;
    },
    selectPhoto: function (photo) {
      Dispatcher.dispatch({
        actionType: 'select-photo',
        selectedPhoto: photo
      });
    },
    componentDidMount: function () {
      var options = {
        url: '/file/upload',
        createImageThumbnails: true,
        thumbnailWidth: 120,
        acceptedFiles: 'image/*',
        previewsContainer: false,
        autoProcessQueue: false
      };
      var dz = new Dropzone(this.refs.dz, options);
      dz.on('thumbnail', function (imageFile, thumbnailSrc) {
        DataStore.addPhoto({
          srcType: 'file',
          src: imageFile,
          thumbnailSrc: thumbnailSrc,
          selected: false
        });
      });
    },
    render: function () {
      var self = this;
      var photoGroups = helpers.groupBy(this.props.photos, 'srcType');
      var mapFn = function (photo, id) {
        var classes = photo.selected ? 'pe-c-item pe-active' : 'pe-c-item';
        return React.createElement(
          'div',
          { className: classes, key: id },
          React.createElement('img', { src: photo.thumbnailSrc || photo.src, onClick: self.selectPhoto.bind(self, photo) })
        );
      };
      var fromUploads = photoGroups.file ? photoGroups.file.map(mapFn) : null;
      var fromURLs = photoGroups.url ? photoGroups.url.map(mapFn) : null;

      return React.createElement(
        'div',
        { className: 'pe-carousel' },
        React.createElement('div', { className: 'pe-c-drop', ref: 'dz' }),
        React.createElement(
          'div',
          { className: 'pe-c-scroll', onWheel: this.scroll },
          React.createElement(
            'div',
            { className: 'pe-c-list' },
            fromUploads
          ),
          React.createElement(
            'div',
            { className: 'pe-c-list' },
            fromURLs
          )
        )
      );
    }
  });

  var Preview = React.createClass({
    componentDidMount: function () {
      var canvas = helpers.createCanvas();
      Dispatcher.register((function (payload) {
        if (payload.actionType === 'load-photo') {
          var cropBoxRect = payload.cropBox.getBoundingClientRect();
          var canvasRect = payload.canvas.getBoundingClientRect();
          var x = cropBoxRect.left - canvasRect.left;
          var y = cropBoxRect.top - canvasRect.top;
          var w = cropBoxRect.width;
          var h = cropBoxRect.height;
          var scale = payload.scale;

          if (x < 0 || y < 0 || w > canvasRect.width || h > canvasRect.height) return;

          canvas.width = canvasRect.width;
          canvas.height = canvasRect.height;
          canvas.getContext('2d').drawImage(payload.canvas, 0, 0, payload.canvas.width, payload.canvas.height, 0, 0, canvasRect.width, canvasRect.height);

          helpers.syncPrevImage(canvas, this.refs.previewImg, x, y, w, h, function (dataURL) {
            DataStore.setCroppedImage(dataURL);
          });
        }
      }).bind(this));
    },

    render: function () {
      var classes = classNames({
        'pe-preview': true,
        'pe-hide': this.props.hide
      });

      var mode = this.props.mode;
      var template;

      if (mode && mode.name === 'profile') {
        template = React.createElement(
          'div',
          { className: 'pe-preview-profile' },
          React.createElement(
            'div',
            { className: 'pe-prev-img' },
            React.createElement(
              'div',
              { className: 'pe-wrapper' },
              React.createElement('img', { ref: 'previewImg' })
            )
          )
        );
      } else if (mode && mode.name == 'coverPhoto') {
        template = React.createElement(
          'div',
          { className: 'pe-preview-coverphoto' },
          React.createElement(
            'div',
            { className: 'pe-header' },
            React.createElement(
              'a',
              { className: 'logo', href: '#yp' },
              React.createElement('img', { src: '/v2/img/logo-yp.png' })
            )
          ),
          React.createElement(
            'div',
            { className: 'pe-banner-x' },
            React.createElement('img', { id: 'pe-img', ref: 'previewImg' })
          ),
          React.createElement('div', { className: 'pe-mip', ref: 'mip' })
        );
      }

      return React.createElement(
        'div',
        { className: classes },
        React.createElement(
          'div',
          { className: 'pe-preview-box' },
          template
        )
      );
    }
  });

  var Body = React.createClass({
    render: function () {
      return React.createElement(
        'div',
        { className: 'pe-body' },
        React.createElement(Menu, { modes: this.props.modes }),
        React.createElement(Carousel, { photos: this.props.photos }),
        React.createElement(Editor, { photo: this.props.selectedPhoto, mode: this.props.selectedMode })
      );
    }
  });

  // Photo Editor
  var PhotoEditor = React.createClass({
    getInitialState: function () {
      return {
        photos: DataStore.getPhotos(),
        selectedPhoto: DataStore.getSelectedPhoto(),
        modes: DataStore.getModes(),
        selectedMode: DataStore.getSelectedMode()
      };
    },
    componentDidMount: function () {
      var self = this;
      Dispatcher.register(function (payload) {
        if (payload.actionType === 'close-all') {
          self.refs.editor.parentNode.style.display = 'none';
        }
      });
      DataStore.on('change', this._onChange);
    },
    componentWillUnmount: function () {
      DataStore.off('change', this._onChange);
    },
    render: function () {
      return React.createElement(
        'div',
        { className: 'pe', ref: 'editor' },
        React.createElement(Header, null),
        React.createElement(Body, { photos: this.state.photos,
          selectedPhoto: this.state.selectedPhoto,
          modes: this.state.modes,
          selectedMode: this.state.selectedMode }),
        React.createElement(Footer, null)
      );
    },
    _onChange: function () {
      this.setState({
        photos: DataStore.getPhotos(),
        selectedPhoto: DataStore.getSelectedPhoto(),
        modes: DataStore.getModes(),
        selectedMode: DataStore.getSelectedMode()
      });
    }
  });

  var Editor = React.createClass({
    getInitialState: function () {
      return { layout: { preview: true } };
    },

    togglePreview: function () {
      var newState = !this.state.layout.preview;
      this.setState({ layout: { preview: newState } });
      this._onCanvasChange();
    },

    _setupCanvas: function (photo, mode) {
      if (!photo || !mode) return;
      var $canvasBox = this.refs.canvasBox;
      var $cropBox = this.refs.cropBox;

      if (this._$canvas) {
        interact(this._$canvas).unset();
        $canvasBox.removeChild(this._$canvas);
        this._$canvas = null;
        this._resetSlider();
      }

      var $img = new Image();
      $img.crossOrigin = "Anonymous";

      var self = this;
      $img.onload = function () {
        var $canvas = document.createElement('canvas');
        var w = $canvas.width = $img.naturalWidth;
        var h = $canvas.height = $img.naturalHeight;
        var wh = mode.resolve(w, h);
        w = wh[0], h = wh[1];

        $cropBox.style.width = w + 'px';
        $cropBox.style.height = h + 'px';
        $cropBox.style.marginLeft = -w / 2 + 'px';
        $cropBox.style.marginTop = -h / 2 + 'px';

        $canvas.getContext('2d').drawImage($img, 0, 0);

        if (mode.resizable) {
          interact($canvas).resizable({
            edges: { right: true, bottom: true, top: true, left: true }
          }).on('resizemove', function (event) {
            var target = event.target;
            var x = parseFloat(target.getAttribute('data-x')) || 0;
            var y = parseFloat(target.getAttribute('data-y')) || 0;

            target.style.width = event.rect.width + 'px';
            target.style.height = event.rect.height + 'px';

            if (!event.deltaRect.left && !event.deltaRect.top) {
              x += event.deltaRect.left;
              y += event.deltaRect.top;

              helpers.updateCSSTransform(target, 'translate', x, y);

              target.setAttribute('data-x', x);
              target.setAttribute('data-y', y);
            }

            self._resetSlider();
          });
        }

        if (mode.draggable) {
          interact($canvas).draggable({
            onmove: function (event) {
              var target = event.target;
              var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
              var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

              helpers.updateCSSTransform(target, 'translate', x, y);

              target.setAttribute('data-x', x);
              target.setAttribute('data-y', y);

              if (self.state.layout.preview) {
                self._onCanvasChange();
              }
            }
          });
        }

        $canvasBox.appendChild($canvas);
        self._$canvas = $canvas;
        self._$cropBox = $cropBox;
        if (self.state.layout.preview) {
          self._onCanvasChange();
        }
      };

      helpers.loadImage($img, photo);
    },

    _resetSlider: function () {
      this._scale = 1;
      this.refs.slider && this.refs.slider.noUiSlider.set(50);
    },

    _onCanvasChange: function () {
      Dispatcher.dispatch({
        actionType: 'load-photo',
        canvas: this._$canvas,
        cropBox: this._$cropBox,
        scale: this._scale || 1
      });
    },

    _setupSlider: function () {
      var $slider = this.refs.slider;
      noUiSlider.create($slider, {
        start: 50,
        step: 2,
        range: { min: 0, max: 100 }
      });

      $slider.noUiSlider.on('update', (function () {
        var scale = (1 + ($slider.noUiSlider.get() - 50) / 50).toPrecision(2);
        if (this._$canvas) {
          this._scale = scale;
          helpers.updateCSSTransform(this._$canvas, 'scale', scale);
          if (this.state.layout.preview) {
            this._onCanvasChange();
          }
        }
      }).bind(this));
    },

    componentWillReceiveProps: function (newProps) {
      this._setupCanvas(newProps.photo, newProps.mode);
    },

    componentDidMount: function () {
      this._setupCanvas(this.props.photo, this.props.mode);
      this._setupSlider();
    },

    render: function () {
      var classesA = classNames({
        'pe-editor-box': true,
        'pe-full': !this.state.layout.preview
      });

      var classesB = classNames({
        'pe-slider-box': true,
        'pe-full': !this.state.layout.preview
      });

      var classesC = classNames({
        'pe-control': true,
        'pe-full': !this.state.layout.preview
      });

      return React.createElement(
        'div',
        { className: 'pe-editor' },
        React.createElement(
          'div',
          { className: classesA },
          React.createElement(
            'div',
            { className: 'pe-edit-area', ref: 'editArea' },
            React.createElement(
              'div',
              { className: 'pe-canvas', ref: 'canvasBox' },
              React.createElement('div', { className: 'pe-crop', ref: 'cropBox' })
            )
          )
        ),
        React.createElement(
          'div',
          { className: classesC },
          React.createElement(
            'a',
            { className: 'pe-close', onClick: this.togglePreview },
            'Preview'
          )
        ),
        React.createElement(
          'div',
          { className: classesB },
          React.createElement('div', { className: 'pe-slider', ref: 'slider' })
        ),
        React.createElement(Preview, { hide: !this.state.layout.preview, mode: this.props.mode })
      );
    }
  });

  function LincolnPhotoEditor($elem, config) {
    DataStore.initialize(config);

    this.initialized = false;
    this.close = function () {
      $elem.style.display = 'none';
    };
    this.open = function () {
      if (!this.initialized) {
        ReactDOM.render(React.createElement(PhotoEditor, null), $elem);
      }
      this.initialized = true;
      $elem.style.display = 'block';
    };
    this.onsave = function (callback) {
      Dispatcher.register(function (payload) {
        if (payload.actionType === 'save-photo') {
          callback(DataStore.getSelectedPhoto(), DataStore.getCroppedImage());
        }
      });
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports = LincolnPhotoEditor;
  } else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    // register as 'classnames', consistent with npm package name
    define('LincolnPhotoEditor', function () {
      return LincolnPhotoEditor;
    });
  } else {
    window.LincolnPhotoEditor = LincolnPhotoEditor;
  }
})();