import dom from './dom';
import Canvas from './canvas';
import Selection from './selection';
import './photoflex.scss';
// const nums = [3, 5, 7, 11, 13];
// const sum = dom.sum(nums);
// const wrapper = document.querySelector('#photoflex-container');
// wrapper.innerHTML = `<h3>sum of array [${nums}] is ${sum}</h3>`;

class PhotoFlex {
  constructor(canvas, selection) {
    this.canvas = canvas;
    this.selection = selection;
  }

  setConfig(key, value) {
    const { config } = this.canvas;
    if (!Object.prototype.hasOwnProperty.call(config, key)) {
      throw new Error(`no such config [${key}]`);
    }
    config[key] = value;
    this.canvas.repaint();
  }

  capture(rect) {
    const imageData = this.canvas.copyAt(rect);
    console.log(imageData);
  }

  setRange(range) {
    this.setConfig('range', range);
    this.selection.setRange(range);
  }

  openImage(fileSource) {
    return dom.fileToImage(fileSource).then((fileMeta) => {
      console.log(fileMeta);
      const { file, img } = fileMeta;
      const meta = {
        size: file.size,
        type: file.type,
        width: img.width,
        height: img.height
      };
      this.canvas.setImage(fileMeta.img, meta);
    });
  }
}
const validate = (config) => !config;
const init = (userConfig) => {
  const config = {
    ratio: 1.0,
    width: 400,
    height: 400,
    fitMode: 'none',
    range: {
      x: 50,
      y: 50,
      width: 300,
      height: 300
    }
  };
  Object.assign(config, userConfig);
  if (validate(config)) {
    alert('error');
  }

  const wrapper = document.querySelector(config.el);
  const canvas = new Canvas(wrapper, config);
  const selection = new Selection(canvas.wrapperEl());
  selection.setRange(config.range);
  const instance = new PhotoFlex(canvas, selection);
  if (config.image) {
    dom.tag.img(config.image).then((meta) => {
      instance.setImage(meta.img, meta);
    });
  }
  return instance;
};
export { init };
export default { init };
