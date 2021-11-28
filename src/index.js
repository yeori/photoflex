import dom from './dom';
import Canvas from './canvas';
import Selection from './selection';
import rangebox from './rangebox';
import './photoflex.scss';

const captureFormatter = {
  image: (data) => {
    const img = new Image();
    img.src = data;
    return img;
  },
  dataUrl: (data) => data
};
class PhotoFlex {
  constructor(canvas, selection, el) {
    this.canvas = canvas;
    this.selection = selection;
    this.$$ = { ...el };

    const bus = dom.event.createEventBus();
    this.eventBus = bus;
    this.canvas.eventBus = bus;
    this.selection.eventBus = bus;

    this.eventBus.on('sizebox', (size) => {
      rangebox.showRangeBox(
        this.eventBus,
        this.$$.rootWrapper,
        size,
        this.getConfig('ranges')
      );
    });
    this.eventBus.on('range', (payload) => {
      console.log('[RANGE]', payload);
      const { range, save } = payload;
      this.selection.mergeSelection(range);
      if (save) {
        this.$$.config.ranges.push(`${range.width}x${range.height}`);
      }
    });
  }

  setConfig(key, value) {
    const { config } = this.canvas;
    if (!Object.prototype.hasOwnProperty.call(config, key)) {
      throw new Error(`no such config [${key}]`);
    }
    this.canvas.setConfig(key, value);
    // config[key] = value;
    // this.canvas.repaint();
  }

  getConfig(key) {
    return this.canvas.config[key];
  }

  capture(rectToCaputure, format) {
    const rect = rectToCaputure || this.getConfig('range');
    const dataURL = this.canvas.copyImageAt(rect);
    console.log(dataURL);
    const comma = dataURL.indexOf(',');
    /*
     * base64_encoded_data = original_data * 1.33
     * original_data       = base64_encoded_data * 0.75
     */
    const sizeInRealPic = parseInt((dataURL.length - (comma + 1)) * 0.75, 10);
    const formatMode = format || 'image';
    const img = captureFormatter[formatMode](dataURL);
    return {
      image: img,
      type: formatMode,
      meta: {
        size: sizeInRealPic,
        ...rectToCaputure
      }
    };
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
      this.selection.setVisible(true);
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
    ranges: {
      options: ['100x100', '200x200', '300x300'],
      active: 0
    },
    range: {
      x: 30,
      y: 30,
      width: 100,
      height: 100
    }
  };
  Object.assign(config, userConfig);
  if (validate(config)) {
    alert('error');
  }

  // inflate range options
  const { ranges } = config;
  const toInt = (v) => parseInt(v, 10);
  const options = ranges.options.map((r) => {
    const [width, height] = r.split('x').map(toInt);
    return { width, height };
  });
  ranges.options = options;
  const activeRange = ranges.options[ranges.active];
  config.range.width = activeRange.width;
  config.range.height = activeRange.height;

  const wrapper = document.querySelector(config.el);
  const canvasWrapper = dom.tag.div('.canvas-wrapper');
  dom.css(canvasWrapper, { width: config.width, height: config.height });
  wrapper.appendChild(canvasWrapper);

  return new Promise((resolve) => {
    setTimeout(() => {
      const canvas = new Canvas(canvasWrapper, config);
      const selection = new Selection(
        canvasWrapper,
        config.range,
        config.ranges
      );
      // selection.setRange(config.range, config.ranges);
      const instance = new PhotoFlex(canvas, selection, {
        rootWrapper: wrapper,
        canvasWrapper,
        config
      });
      if (config.image) {
        dom.tag.img(config.image).then((meta) => {
          instance.setImage(meta.img, meta);
        });
      }
      resolve(instance);
    }, 0);
  });
};
export { init };
export default { init };
