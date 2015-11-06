import * as EventEmitter from 'events';
import ExampleImages from './example_images.js';

var _config = {
  demo: false
};

export default class extends EventEmitter {
  constructor(config) {
    super();
    this.config = Object.assign(_config, config);
    console.log(ExampleImages);
  }
}
