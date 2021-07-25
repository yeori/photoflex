import dom from './dom';
/* eslint-disable no-param-reassign */
const DUMMY_DRAG_LISTENER = () => {};

// const convToMouseEvent = (te) => {
//   let touch = te.touches[0];
//   if (te.type === 'touchend') {
//     // eslint-disable-next-line prefer-destructuring
//     touch = te.changedTouches[0];
//   }
//   te.clientX = touch.clientX;
//   te.clientY = touch.clientY;
//   te.layerX = 0;
//   te.layerY = 0;
//   te.offsetX = 0;
//   te.offsetY = 0;
//   te.pageX = touch.pageX;
//   te.pageY = touch.pageY;
//   te.screenX = touch.screenX;
//   te.screenY = touch.screenY;
// };

const mousedown = (dnd, e) => {
  const { ctx } = dnd;
  if (!dnd.handler.accept(e.target)) {
    return;
  }
  // document.querySelector('body').style.cursor = 'e-resize'
  ctx.dragging = {
    originalEvent: e,
    sx: e.pageX,
    sy: e.pageY,
    dx: 0,
    dy: 0
  };
  dnd.beforeDrag(ctx.dragging);
};
const mousemove = (dnd, e) => {
  const { ctx } = dnd;
  if (ctx.dragging) {
    e.preventDefault();
    ctx.originalEvent = e;
    ctx.originalEvent = e;
    ctx.dragging.dx = e.pageX - ctx.dragging.sx;
    ctx.dragging.dy = e.pageY - ctx.dragging.sy;
    dnd.dragging(ctx.dragging);
  }
};
const mouseup = (dnd, e) => {
  // clearTimeout(ctx.touchTimer)
  // ctx.touchTimer = null
  const { ctx } = dnd;
  ctx.originalEvent = e;
  document.querySelector('body').style.cursor = '';
  try {
    if (ctx.dragging) {
      dnd.afterDrag(ctx.dragging);
    }
  } catch (err) {
    console.log('[DND error]', err);
  } finally {
    ctx.dragging = null;
  }
};

class Dnd {
  constructor(handler) {
    this.$$ = {};
    this.ctx = {
      dragging: null
    };
    this.handler = handler;
    this.beforeDrag = handler.beforeDrag || DUMMY_DRAG_LISTENER;
    this.dragging = handler.dragging || DUMMY_DRAG_LISTENER;
    this.afterDrag = handler.afterDrag || DUMMY_DRAG_LISTENER;
    dom.event.mousedown((e) => mousedown(this, e), window);
    dom.event.mousemove((e) => mousemove(this, e), window);
    dom.event.mouseup((e) => mouseup(this, e), window);
  }
}
export { Dnd };
export default { Dnd };
