import EventEmitter from 'events';
import ExampleImages from './example_images.json'

var _options = {
  demo: false
};

export default function(options) {
  this.options = Object.assign(_options, options);
}
