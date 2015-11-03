var helpers = require('../v2.helpers');

describe('helpers', function() {
  it('should updateTransformCSS()', function() {
    var div = {style: {transform: ''}};
    helpers.updateCSSTransform(div, 'translate', 20, 30);
    expect(div.style.transform).toBe('translate(20px, 30px)');

    helpers.updateCSSTransform(div, 'scale', 1.1);
    expect(div.style.transform).toBe('translate(20px, 30px) scale(1.1, 1.1)');

    helpers.updateCSSTransform(div, 'scale', 0.9, 0.8);
    expect(div.style.transform).toBe('translate(20px, 30px) scale(0.9, 0.8)');

    helpers.updateCSSTransform(div, 'translate', 40, 60);
    expect(div.style.transform).toBe('translate(40px, 60px) scale(0.9, 0.8)');

    helpers.updateCSSTransform(div, 'translate', 5, 5);
    helpers.updateCSSTransform(div, 'scale', 0.5);
    expect(div.style.transform).toBe('translate(5px, 5px) scale(0.5, 0.5)');
  });

  it('should groupBy()', function() {
    var list = [
      {srcType: 'url'},
      {srcType: 'url'},
      {srcType: 'file'},
      {srcType: 'file'}
    ];

    var groups = helpers.groupBy(list, 'srcType');
    expect(groups.url.length).toBe(2);
    expect(groups.file.length).toBe(2);
  });
});
