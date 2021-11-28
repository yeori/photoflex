import { Dnd } from './dnd';
import dom from './dom';

const resolveWidth = (parentEl) => parentEl.offsetWidth;
/**
 * 이미지의 너비 또는 높이가 canvas를 넘지 않게 조정함
 * @param {Canvas} canvas
 * @param {double} scale
 * @param {Object} meta
 * @returns
 */
const fitByContain = (canvas, scale, meta) => {
  const { canvasWidth, canvasHeight } = canvas;
  const imageW = meta.width;
  const imageH = meta.height;
  const imgRatio = imageH / imageW;
  const canvasRatio = canvasHeight / canvasWidth;
  let ratio = 1;
  if (canvasRatio <= imgRatio) {
    // landscape
    ratio = canvasHeight / imageH;
  } else {
    // portrait
    ratio = canvasWidth / imageW;
  }
  return fitByOriginalSize(canvas, ratio, meta);
};
/**
 * 이미지가 캔버스를 가득 채우게 조정함
 * @param {Canvas} canvas
 * @param {double} scale
 * @param {width, height} meta
 * @returns
 */
const fitByCover = (canvas, scale, meta) => {
  const { canvasWidth, canvasHeight } = canvas;
  const imageW = meta.width;
  const imageH = meta.height;
  const imgRatio = imageH / imageW;
  const canvasRatio = canvasHeight / canvasWidth;
  let ratio = 1;
  if (canvasRatio <= imgRatio) {
    // landscape
    ratio = canvasWidth / imageW;
  } else {
    // portrait
    ratio = canvasHeight / imageH;
  }
  return fitByOriginalSize(canvas, ratio, meta);
};
/**
 * 이미지 원본 크기를 유지함(캔버스보다 클 수 있음)
 * @param {Canvans} canvas
 * @param {double} scale
 * @param {width, height} meta
 * @returns
 */
const fitByOriginalSize = (canvas, scale, meta) => {
  const { canvasWidth, canvasHeight } = canvas;
  const imageW = canvasWidth / scale;
  const imageH = canvasHeight / scale;
  const x = (meta.width - imageW) / 2;
  const y = (meta.height - imageH) / 2;
  return {
    x,
    y,
    width: imageW,
    height: imageH,
    ratio: scale
  };
};

const scaling = {
  cover: fitByCover,
  contain: fitByContain,
  none: fitByOriginalSize
};

function DndHandler(canvas) {
  // const { x: vx, y: vy } = canvas.$$.viewport;
  let vx;
  let vy;
  return {
    accept(el) {
      return el === canvas.$$.canvasEl;
    },
    beforeDrag() {
      vx = canvas.$$.viewport.x;
      vy = canvas.$$.viewport.y;
    },
    dragging(ctx) {
      // eslint-disable-next-line no-param-reassign
      canvas.$$.viewport.x = vx + ctx.dx;
      // eslint-disable-next-line no-param-reassign
      canvas.$$.viewport.y = vy + ctx.dy;
      canvas.repaint();
    },
    afterDrag() {}
  };
}

class Canvas {
  constructor(wrapperEl, config) {
    this.parentEl = wrapperEl;
    this.config = config;
    this.ctx = null;
    this.$$ = {
      viewport: null
    };
    this.injectCanvas();
    this.$$.dnd = new Dnd(new DndHandler(this));
  }

  injectCanvas() {
    // const div = dom.tag.div('.canvas-wrapper');
    // div.appendChild(canvasEl);
    const canvasEl = dom.tag.canvas();
    this.$$.canvasEl = canvasEl;
    canvasEl.width = this.canvasWidth;
    canvasEl.height = this.canvasHeight;
    this.ctx = canvasEl.getContext('2d');
    this.parentEl.appendChild(canvasEl);
    // this.$$.wrapperEl = div;
    this.repaint();
  }

  clearCanvas(ctx) {
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  copyImageAt(rect) {
    const imgData = this.ctx.getImageData(
      rect.x,
      rect.y,
      rect.width,
      rect.height
    );
    const copyCanvas = document.createElement('canvas');
    copyCanvas.width = rect.width;
    copyCanvas.height = rect.height;
    copyCanvas.getContext('2d').putImageData(imgData, 0, 0);
    return copyCanvas.toDataURL();
  }

  wrapperEl() {
    return this.$$.wrapperEl;
  }

  renderImage(ctx) {
    if (this.$$.image) {
      const { image, meta } = this.$$;
      // if (!this.$$.viewport) {
      //   const { ratio, fitMode } = this.config;
      //   this.$$.viewport = scaling[fitMode](this, ratio, meta);
      // }

      const { viewport } = this.$$;
      ctx.drawImage(
        image,
        viewport.x,
        viewport.y,
        viewport.width,
        viewport.height,
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
      );
      // dom.imageSize(image);
    }
  }

  setImage(img, meta) {
    this.$$.image = img;
    this.$$.meta = meta;
    const { ratio, fitMode } = this.config;
    this.$$.viewport = scaling[fitMode](this, ratio, meta);
    this.repaint();
  }

  setConfig(key, value) {
    this.config[key] = value;
    if (key === 'ratio' || key === 'fitMode') {
      const { ratio, fitMode } = this.config;
      this.$$.viewport = scaling[fitMode](this, ratio, this.$$.meta);
    }
    this.repaint();
  }

  repaint() {
    const { ctx } = this;
    this.clearCanvas(ctx);
    this.renderImage(ctx);
  }

  get canvasWidth() {
    return resolveWidth(this.parentEl, this.config.width);
  }

  get canvasHeight() {
    return this.config.height;
  }

  get image() {
    return this.config.image;
  }
}
export default Canvas;
