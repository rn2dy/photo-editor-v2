(function () {
  'use strict';

  var helpers = {};

  helpers.loadImage = function($img, photo) {
    if(photo.srcType === 'file') {
      var reader = new FileReader();
      reader.onload = function(e) {
        $img.src = e.target.result;
      };
      reader.readAsDataURL(photo.src);
    } else if (photo.srcType === 'url') {
      $img.src = photo.src;
    }
  };

  helpers.groupBy = function(list, key) {
    var groups = {};
    list.forEach(function(item) {
      if(groups[item[key]]) {
        groups[item[key]].push(item);
      } else {
        groups[item[key]] = [item];
      }
    });
    return groups;
  };

  helpers.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  helpers.createCanvas = function(width, height) {
    var $canvas = document.createElement('canvas');
    if(width) $canvas.width = width;
    if(height) $canvas.height = height;
    return $canvas;
  }

  helpers.syncPrevImage = helpers.debounce(function($srcCanvas, $destImg, x, y, w, h, callback) {
    var $canvas = helpers.createCanvas(w, h);
    var ctx = $canvas.getContext('2d');
    var imgData = $srcCanvas.getContext('2d').getImageData(x || 0, y || 0, w, h);
    ctx.putImageData(imgData, 0, 0);
    $destImg.src = $canvas.toDataURL();
    callback($destImg.src);
  }, 150);

  helpers.updateCSSTransform = function($elem, attr, x, y) {
    var transform = $elem.style.transform;
    var i = transform.indexOf(attr);
    var style = '', regex = '';
    switch(attr) {
      case 'scale':
        style = 'scale(' + x + ', ' + (y || x) + ')';
        regex = /scale\(.*?\)/i;
        break;
      case 'translate':
        style = 'translate(' + x + 'px, ' + (y || x) + 'px)';
        regex = /translate\(.*?\)/i;
        break;
      case 'rotate':
        style = 'rotate(' + x + 'deg)';
        regex = /rotate\(.*?\)/i;
        break;
    }

    if(i != -1) {
      $elem.style.transform = transform.replace(regex, style);
    } else {
      $elem.style.transform = (transform + ' ' + style).trim();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports = helpers;
  } else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    // register as 'classnames', consistent with npm package name
    define('helpers', function () {
      return helpers;
    });
  } else {
    window.helpers = helpers;
  }
}());

