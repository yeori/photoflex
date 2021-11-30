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
 * 이미지가 캔버스를 가득 채우게 조정함(너비 또는 높이가 캔버스 영역보다 크면 잘림)
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
 * 원본 이미지를 주어진 비율만큼 확대(축소)함
 * @param {Canvas} canvas
 * @param {double} ratio 원본 이미지에 대한 확대, 축소 비율
 * @param {width, height} meta original image metadata(width, height etc)
 * @returns
 */
const fitByOriginalSize = (canvas, ratio, meta) => {
  const { canvasWidth, canvasHeight } = canvas;
  const x = (meta.width * ratio - canvasWidth) / 2;
  const y = (meta.height * ratio - canvasHeight) / 2;
  /*
   * x, y, width, height in context of viewport(canvas) not of original image
   */
  const cvs = {
    x: x,
    y: y,
    width: canvasWidth,
    height: canvasHeight,
    ratio
  };
  const image = {
    x: cvs.x / ratio,
    y: cvs.y / ratio,
    width: cvs.width / ratio,
    height: cvs.height / ratio
  };
  canvas.config.ratio = ratio;
  return { canvas: cvs, image };
};

const scaling = {
  cover: fitByCover,
  contain: fitByContain,
  none: fitByOriginalSize
};
/**
 * capture on viewport
 * @param {Canvas} canvas
 * @param {{x:number,y:number,width:number,height:number}} rect
 * @returns
 */
const captureOnViewport = (canvas, rect) => {
  // capture on viewport
  const imgData = canvas.ctx.getImageData(
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
};
/**
 * capture on original image
 * @param {Canvas} canvas
 * @param {{x:number,y:number,width:number,height:number}} rect
 * @returns
 */
const captureOnImage = (canvas, rect) => {
  // capture on image
  const { viewport, source } = canvas.$$;
  const { image } = viewport;
  const { ratio } = viewport.canvas;
  const scaledRect = {
    x: rect.x / ratio + image.x,
    y: rect.y / ratio + image.y,
    width: rect.width / ratio,
    height: rect.height / ratio
  };

  const imgData = source.capture(scaledRect);
  const copyCanvas = document.createElement('canvas');
  copyCanvas.width = Math.min(imgData.width);
  copyCanvas.height = Math.min(imgData.height);
  copyCanvas.getContext('2d').putImageData(imgData, 0, 0);
  return copyCanvas.toDataURL();
};

const capturing = {
  viewport: captureOnViewport,
  image: captureOnImage
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
      vx = canvas.$$.viewport.canvas.x;
      vy = canvas.$$.viewport.canvas.y;
    },
    dragging(ctx) {
      canvas.$$.viewport.canvas.x = vx - ctx.dx;
      canvas.$$.viewport.canvas.y = vy - ctx.dy;
      canvas.repaint();
    },
    afterDrag() {
      // update (x, y) of viewport.image
      const { viewport } = canvas.$$;
      const { ratio } = viewport.canvas;
      viewport.image.x = viewport.canvas.x / ratio;
      viewport.image.y = viewport.canvas.y / ratio;
    }
  };
}

class ImageSource {
  constructor(img, meta) {
    this.image = img;
    this.meta = meta;
    this.$$ = {
      canvas: null,
      ctx: null
    };
    const origin = dom.tag.canvas();
    origin.width = meta.width;
    origin.height = meta.height;
    const originCtx = origin.getContext('2d');
    originCtx.drawImage(img, 0, 0);
    this.$$.canvas = origin;
    this.$$.ctx = originCtx;
  }
  /**
   * capture image in the give rectangle
   * @param {{x:number,y:number,width:number,height:number}} rect
   * @returns ImageData
   */
  capture(rect) {
    return this.$$.ctx.getImageData(rect.x, rect.y, rect.width, rect.height);
  }
}
class Canvas {
  constructor(wrapperEl, config, eventBus) {
    this.parentEl = wrapperEl;
    this.config = config;
    this.ctx = null;
    this.$$ = {
      viewport: null,
      source: null
    };
    this.injectCanvas();
    this.$$.dnd = new Dnd(new DndHandler(this));
    this.eventBus = eventBus;
    eventBus.on('config-updated', (config) => {
      const { key } = config;
      if (key === 'ratio' || key === 'fitMode' || key === 'captureOn') {
        const { ratio, fitMode } = this.config;
        this.$$.viewport = scaling[fitMode](this, ratio, this.$$.source.meta);
        this.repaint();
        this.eventBus.emit('viewport', this.$$.viewport);
      }
    });
  }

  injectCanvas() {
    const canvasEl = dom.tag.canvas();
    this.$$.canvasEl = canvasEl;
    canvasEl.width = this.canvasWidth;
    canvasEl.height = this.canvasHeight;
    this.ctx = canvasEl.getContext('2d');
    this.parentEl.appendChild(canvasEl);
    this.repaint();
  }

  clearCanvas(ctx) {
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }
  copyImageAt(rect) {
    const { captureOn } = this.config;
    return capturing[captureOn](this, rect);
  }

  wrapperEl() {
    return this.$$.wrapperEl;
  }

  renderImage(ctx) {
    if (this.$$.source) {
      const { image } = this.$$.source;

      const { viewport } = this.$$;
      const { ratio } = viewport.canvas;
      const offsetX = viewport.canvas.x < 0 ? -viewport.canvas.x : 0;
      const offsetY = viewport.canvas.y < 0 ? -viewport.canvas.y : 0;

      ctx.drawImage(
        image,
        (viewport.canvas.x + offsetX) / ratio,
        (viewport.canvas.y + offsetY) / ratio,
        viewport.canvas.width / ratio,
        viewport.canvas.height / ratio,
        offsetX,
        offsetY,
        this.canvasWidth,
        this.canvasHeight
      );
      // dom.imageSize(image);
    }
  }

  setImage(img, meta) {
    this.$$.source = new ImageSource(img, meta);
    // this.$$.image = img;
    // this.$$.meta = meta;
    const { ratio, fitMode } = this.config;
    this.$$.viewport = scaling[fitMode](this, ratio, meta);
    this.eventBus.emit('viewport', this.$$.viewport);
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
    return this.$$.source.image;
  }
}
export default Canvas;
