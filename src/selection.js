/* eslint-disable no-param-reassign */
import dom from './dom';
import { Dnd } from './dnd';

let boxEl;
const drawRange = (el, range) => {
  console.log(el, range);
  el.style.left = `${range.x}px`;
  el.style.top = `${range.y}px`;
  el.style.width = `${range.width}px`;
  el.style.height = `${range.height}px`;
};
const pos = {
  x: 0,
  y: 0,
  parent: null
};
const handler = {
  accept(el) {
    const elem = dom.closest(el, '.btn-icon');
    return !!elem;
  },
  beforeDrag() {
    pos.x = boxEl.offsetLeft;
    pos.y = boxEl.offsetTop;
    pos.width = boxEl.offsetWidth;
    pos.height = boxEl.offsetHeight;
    pos.parent = {
      width: boxEl.parentElement.offsetWidth,
      height: boxEl.parentElement.offsetHeight
    };
    console.log('[BEFORE]', pos);
  },
  dragging(ctx) {
    let left = Math.max(0, pos.x + ctx.dx);
    let top = Math.max(0, pos.y + ctx.dy);
    left = Math.min(left, pos.parent.width - pos.width);
    top = Math.min(top, pos.parent.height - pos.height);
    boxEl.style.left = `${left}px`;
    boxEl.style.top = `${top}px`;
  },
  afterDrag(ctx) {
    console.log('[AFTER]', ctx);
  }
};
class Selection {
  constructor(parentEl, range) {
    this.$$ = { parent: parentEl };
    this.range = range;
    this.visible = true;
    boxEl = this.prepareEl();
    this.dnd = new Dnd(handler);
  }

  prepareEl() {
    const { parent } = this.$$;
    const div = dom.tag.div('.selection');
    const button = dom.tag.iconButton(
      '.btn-icon',
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>'
    );
    div.appendChild(button);
    parent.appendChild(div);
    this.$$.el = div;
    return div;
  }

  setRange(range) {
    this.range = range;
    this.repaint();
  }

  repaint() {
    if (this.range) {
      drawRange(this.$$.el, this.range);
    }
  }
}
export default Selection;
