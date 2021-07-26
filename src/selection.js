/* eslint-disable no-param-reassign */
import dom from './dom';
import { Dnd } from './dnd';

let boxEl;
const drawRange = (el, selection) => {
  el.style.left = `${selection.x}px`;
  el.style.top = `${selection.y}px`;
  el.style.width = `${selection.width}px`;
  el.style.height = `${selection.height}px`;
};
const drawSize = (el, selection) => {
  el.innerHTML = `${selection.width} x ${selection.height}`;
};
const pos = {
  x: 0,
  y: 0,
  parent: null
};
const handler = {
  data: {},
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
  dragging(ctx, { selection }) {
    let left = Math.max(0, pos.x + ctx.dx);
    let top = Math.max(0, pos.y + ctx.dy);
    left = Math.min(left, pos.parent.width - pos.width);
    top = Math.min(top, pos.parent.height - pos.height);
    selection.selection.x = left;
    selection.selection.y = top;
    selection.repaint();
    // boxEl.style.left = `${left}px`;
    // boxEl.style.top = `${top}px`;
  },
  afterDrag(ctx) {
    console.log('[AFTER]', ctx);
  }
};
class Selection {
  constructor(parentEl, selection, ranges) {
    this.$$ = { parent: parentEl };
    this.selection = selection;
    this.ranges = ranges;
    this.visible = true;
    boxEl = this.prepareEl();
    this.dnd = new Dnd(handler, { selection: this });
    this.repaint();
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
    const sizeDiv = dom.tag.div('.size-box');

    /* size box */
    div.appendChild(sizeDiv);
    dom.event.click(sizeDiv, () => {
      this.eventBus.emit('sizebox', this.selection);
    });
    this.$$.sizeEl = sizeDiv;
    return div;
  }

  setRange(range) {
    this.selection = range;
    this.repaint();
  }

  mergeSelection(selection) {
    const { x, y, width, height } = selection;
    this.selection.x = x || this.selection.x;
    this.selection.y = y || this.selection.y;
    this.selection.width = width || this.selection.y;
    this.selection.height = height || this.selection.height;
    this.repaint();
  }

  repaint() {
    if (this.selection) {
      drawRange(this.$$.el, this.selection);
      drawSize(this.$$.sizeEl, this.selection);
    }
  }
}
export default Selection;
