(function () {
  'use strict';

  var Header = React.createClass({
    closePhotoEditor: function() {
      Dispatcher.dispatch({
        actionType: 'close-all'
      });
    },
    render: function() {
      var selectedMode = this.props.modes.find(function(mode) {
        return mode.selected;
      });
      var h3;
      if(this.props.fixedMode) {
        h3 = <h3>Edit {selectedMode.title}</h3>
      } else {
        h3 = <h3>Profile / Cover Photo Editor</h3>
      }
      return (
        <header>
          {h3}
          <i className="fa fa-remove" onClick={this.closePhotoEditor}></i>
        </header>
      );
    }
  });

  var Footer = React.createClass({
    savePhoto: function() {
      Dispatcher.dispatch({
        actionType: 'save-photo'
      });
    },
    closePhotoEditor: function() {
      Dispatcher.dispatch({
        actionType: 'close-all'
      });
    },
    render: function() {
      return (
        <footer>
          <button className="pe-btn" onClick={this.savePhoto}>Save</button>
          <button className="pe-btn pe-cancel" onClick={this.closePhotoEditor}>Cancel</button>
        </footer>
      );
    }
  });

  var Menu = React.createClass({
    selectMode: function(mode) {
      DataStore.setSelectedMode(mode);
    },
    render: function() {
      var self = this;
      var menuItems = this.props.modes.map(function(mode, id) {
        var classes = classNames({
          'pe-menu-item' : true,
          'pe-active': mode.selected,
          'pe-hide': !mode.selected && self.props.fixedMode
        });
        return (
          <div className={classes} title={mode.title} key={id} onClick={self.selectMode.bind(self, mode)}>
            <div><i className={mode.iconClass}></i></div>
            <div><span className="pe-menu-label">{mode.label}</span></div>
          </div>
        );
      });

      return (
        <div className="pe-menu">
          {menuItems}
        </div>
      );
    }
  });

  var Carousel = React.createClass({
    scroll: function(e) {
      e.currentTarget.scrollTop += e.deltaY;
    },
    selectPhoto: function(photo) {
      Dispatcher.dispatch({
        actionType: 'select-photo',
        selectedPhoto: photo
      });
    },
    componentDidMount: function() {
      var options = {
        url: '/file/upload',
        createImageThumbnails: true,
        thumbnailWidth: 120,
        acceptedFiles: 'image/*',
        previewsContainer: false,
        autoProcessQueue: false
      };
      var dz = new Dropzone(this.refs.dz, options);
      dz.on('thumbnail', function(imageFile, thumbnailSrc) {
        DataStore.addPhoto({
          srcType: 'file',
          src: imageFile,
          thumbnailSrc: thumbnailSrc,
          selected: false
        });
      });
    },
    render: function() {
      var self = this;
      var photoGroups = helpers.groupBy(this.props.photos, 'srcType');
      var mapFn = function(photo, id) {
        var classes = photo.selected ? 'pe-c-item pe-active' : 'pe-c-item';
        return (
          <div className={classes} key={id}>
            <img src={photo.thumbnailSrc || photo.src} onClick={self.selectPhoto.bind(self, photo)}/>
          </div>
        );
      };
      var fromUploads = photoGroups.file ? photoGroups.file.map(mapFn) : null;
      var fromURLs = photoGroups.url ? photoGroups.url.map(mapFn) : null;

      return (
        <div className="pe-carousel">
          <div className="pe-c-drop" ref="dz"></div>

          <div className="pe-c-scroll" onWheel={this.scroll}>
            <div className="pe-c-list">{fromUploads}</div>
            <div className="pe-c-list">{fromURLs}</div>
          </div>
        </div>
      );
    }
  });

  var Preview = React.createClass({
    componentDidMount: function() {
      var canvas = helpers.createCanvas();
      Dispatcher.register(function(payload) {
        if(payload.actionType === 'load-photo') {
          var cropBoxRect = payload.cropBox.getBoundingClientRect();
          var canvasRect = payload.canvas.getBoundingClientRect();
          var x = cropBoxRect.left - canvasRect.left;
          var y = cropBoxRect.top - canvasRect.top;
          var w = cropBoxRect.width;
          var h = cropBoxRect.height;
          var scale = payload.scale;

          if(x < 0 || y < 0 || w > canvasRect.width || h > canvasRect.height) return;

          canvas.width = canvasRect.width;
          canvas.height = canvasRect.height;
          canvas.getContext('2d')
            .drawImage(payload.canvas,
                       0, 0, payload.canvas.width, payload.canvas.height,
                       0, 0, canvasRect.width, canvasRect.height);

          helpers.syncPrevImage(canvas, this.refs.previewImg, x, y, w, h, function(dataURL) {
            DataStore.setCroppedImage(dataURL);
          });
        }
      }.bind(this));
    },

    render: function() {
      var classes = classNames({
        'pe-preview' : true,
        'pe-hide': this.props.hide
      });

      var mode = this.props.mode;
      var template;

      if(mode && mode.name === 'profile') {
        template = (
          <div className="pe-preview-profile">
            <div className="pe-prev-img">
              <div className="pe-wrapper"><img ref="previewImg"/></div>
            </div>
          </div>
        );
      } else if (mode && mode.name == 'coverPhoto') {
        template = (
          <div className="pe-preview-coverphoto">
            <div className="pe-header">
              <a className="logo" href="#yp"><img src="http://i4.ypcdn.com/ypu/images/logo-yp.png"/></a>
            </div>
            <div className="pe-banner-x">
              <img id="pe-img" ref="previewImg"/>
            </div>
            <div className="pe-mip" ref="mip"></div>
          </div>
        );
      }

      return (
        <div className={classes}>
          <div className="pe-preview-box">
            {template}
          </div>
        </div>
      );
    }
  });

  var Body = React.createClass({
    render: function() {
      var carousel;
      if(this.props.carousel) {
        carousel = <Carousel photos={this.props.photos} />;
      }
      return (
        <div className="pe-body">
          <Menu modes={this.props.modes} fixedMode={this.props.fixedMode}/>
          {carousel}
          <Editor photo={this.props.selectedPhoto} mode={this.props.selectedMode} carousel={this.props.carousel}/>
        </div>
      );
    }
  });

  // Photo Editor
  var PhotoEditor = React.createClass({
    getInitialState: function() {
      return {
        photos: DataStore.getPhotos(),
        selectedPhoto: DataStore.getSelectedPhoto(),
        modes: DataStore.getModes(),
        selectedMode: DataStore.getSelectedMode(),
        carousel: DataStore.getCarousel(),
        fixedMode: DataStore.getFixedMode()
      }
    },
    componentDidMount: function() {
      var self = this;
      Dispatcher.register(function(payload) {
        if(payload.actionType === 'close-all') {
          self.refs.editor.parentNode.style.display = 'none';
        }
      });
      DataStore.on('change', this._onChange);
    },
    componentWillUnmount: function() {
      DataStore.off('change', this._onChange);
    },
    render: function() {
      return (
        <div className="pe unselectable" ref="editor">
          <Header modes={this.state.modes}
            fixedMode={this.state.fixedMode}/>
          <Body photos={this.state.photos}
            selectedPhoto={this.state.selectedPhoto}
            modes={this.state.modes}
            selectedMode={this.state.selectedMode}
            carousel={this.state.carousel}
            fixedMode={this.state.fixedMode}/>
          <Footer />
        </div>
      );
    },
    _onChange: function() {
      this.setState({
        photos: DataStore.getPhotos(),
        selectedPhoto: DataStore.getSelectedPhoto(),
        modes: DataStore.getModes(),
        selectedMode: DataStore.getSelectedMode(),
        carousel: DataStore.getCarousel(),
        fixedMode: DataStore.getFixedMode()
      });
    }
  });

  var Editor = React.createClass({
    getInitialState: function() {
      return {layout: {preview: true}};
    },

    togglePreview: function() {
      var newState = !this.state.layout.preview;
      this.setState({layout: {preview: newState}});
      this._onCanvasChange();
    },

    _setupCanvas: function(photo, mode) {
      console.log(photo, mode);
      if(!photo || !mode) return;
      var $canvasBox= this.refs.canvasBox;
      var $cropBox= this.refs.cropBox;

      if(this._$canvas) {
        interact(this._$canvas).unset();
        $canvasBox.removeChild(this._$canvas);
        this._$canvas = null;
        this._resetSlider();
      }

      var $img = new Image();
      $img.crossOrigin = "Anonymous";

      var self = this;
      $img.onload = function() {
        var box = self.refs.editBox.getBoundingClientRect();
        var $canvas = document.createElement('canvas');
        var w = $canvas.width = $img.naturalWidth;
        var h = $canvas.height = $img.naturalHeight;
        var wh = mode.resolve(box, w, h);
        w = wh[0], h = wh[1];

        $cropBox.style.width = w + 'px';
        $cropBox.style.height = h + 'px';
        $cropBox.style.marginLeft = -w / 2 + 'px';
        $cropBox.style.marginTop = -h / 2 + 'px';

        $canvas.getContext('2d').drawImage($img, 0, 0);

        if(mode.resizable) {
          interact($canvas).resizable({
            edges: {right: true, bottom: true, top: true, left: true}
          }).on('resizemove', function(event) {
            var target = event.target;
            var x = (parseFloat(target.getAttribute('data-x')) || 0);
            var y = (parseFloat(target.getAttribute('data-y')) || 0);

            target.style.width  = event.rect.width + 'px';
            target.style.height = event.rect.height + 'px';

            if(!event.deltaRect.left && !event.deltaRect.top) {
              x += event.deltaRect.left;
              y += event.deltaRect.top;

              helpers.updateCSSTransform(target, 'translate', x, y);

              target.setAttribute('data-x', x);
              target.setAttribute('data-y', y);
            }

            self._resetSlider();
          });
        }

        if(mode.draggable) {
          interact($canvas).draggable({
            onmove: function(event) {
              var target = event.target;
              var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
              var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

              helpers.updateCSSTransform(target, 'translate', x, y);

              target.setAttribute('data-x', x);
              target.setAttribute('data-y', y);

              if(self.state.layout.preview) {
                self._onCanvasChange();
              }
            }
          });
        }

        $canvasBox.appendChild($canvas);
        self._$canvas = $canvas;
        self._$cropBox = $cropBox;
        self._onCanvasChange();
      };

      helpers.loadImage($img, photo);
    },

    _resetSlider: function() {
      this._scale = 1;
      this.refs.slider && this.refs.slider.noUiSlider.set(50);
    },

    _onCanvasChange: function() {
      Dispatcher.dispatch({
        actionType: 'load-photo',
        canvas: this._$canvas,
        cropBox: this._$cropBox,
        scale: this._scale || 1
      });
    },

    _setupSlider: function() {
      var $slider = this.refs.slider;
      noUiSlider.create($slider, {
        start: 50,
        step: 2,
        range: {min: 0, max: 100}
      });

      $slider.noUiSlider.on('update', function() {
        var d = $slider.noUiSlider.get();
        var scale;
        if (d > 50) {
          scale = 1 + 7 / 50 * (d - 50) ;
        } else if (d < 50){
          scale = 0.125 + 0.875 * d / 50;
        } else {
          scale = 1;
        }
        if(this._$canvas) {
          this._scale = scale;
          helpers.updateCSSTransform(this._$canvas, 'scale', scale);
          if(this.state.layout.preview) {
            this._onCanvasChange();
          }
        }
      }.bind(this));
    },

    componentWillReceiveProps: function(newProps) {
      this._setupCanvas(newProps.photo, newProps.mode);
    },

    componentDidMount: function() {
      this._setupCanvas(this.props.photo, this.props.mode);
      this._setupSlider();
    },

    render: function() {
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

      var classes = classNames({
        'pe-editor': true,
        'pe-with-carousel': this.props.carousel
      });

      return (
        <div className={classes}>
          <div className={classesA} ref="editBox">
            <div className="pe-edit-area" ref="editArea">
              <div className="pe-canvas" ref="canvasBox"></div>
            </div>
            <div className="pe-crop" ref="cropBox"></div>
          </div>

          <div className={classesC}>
            <a className="pe-close" onClick={this.togglePreview}>Preview</a>
          </div>

          <div className={classesB}>
            <div className="pe-slider" ref="slider"></div>
          </div>
          <Preview hide={!this.state.layout.preview} mode={this.props.mode}/>
        </div>
      );
    }
  });

  function LincolnPhotoEditor($elem, config) {
    DataStore.initialize(config || {});

    this.initialized = false;
    this.close = function() {
      $elem.style.display = 'none';
    };
    this.open = function(mode, photo) {
      if(!this.initialized) {
        ReactDOM.render(
          <PhotoEditor />,
          $elem
        );
      }
      this.initialized = true;
      $elem.style.display = 'block';

      if(mode) DataStore.setSelectedMode({name: mode}, true);
      if(photo) DataStore.setSelectedPhoto(photo);
    };
    this.onsave = function(callback) {
      Dispatcher.register(function(payload) {
        if(payload.actionType === 'save-photo') {
          if(callback) callback(DataStore.getSelectedPhoto(), DataStore.getCroppedImage());
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

  // var editor = new LincolnPhotoEditor(
  //               document.getElementById('photo-editor'), {
  //                 isDemo: true});
  // editor.onsave(function(photo, processedPhoto) {
  //   console.log(photo);
  // });
  // editor.open();
}());
