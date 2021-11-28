/* eslint-disable no-param-reassign */
import dom from './dom';
import { Dnd } from './dnd';

let boxEl;
const drawRange = (el, selection, editing) => {
  el.style.left = `${selection.x - 1}px`;
  el.style.top = `${selection.y - 1}px`;
  el.style.width = `${selection.width}px`;
  el.style.height = `${selection.height}px`;
  if (editing) {
    el.classList.add('editing');
  } else {
    el.classList.remove('editing');
  }
};
const drawSize = (el, selection) => {
  const w = parseInt(selection.width, 10);
  const h = parseInt(selection.height, 10);
  const textEl = el.querySelector('.size-text');
  textEl.innerHTML = `${w} x ${h}`;
};
const pos = {
  x: 0,
  y: 0,
  parent: null
};
const moveHandler = {
  accept(el) {
    const elem = dom.closest(el, '.btn-move');
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
  afterDrag() {
    // console.log('[AFTER]', ctx);
  }
};

function ResizeHandler(selection) {
  let sw;
  let sh;
  return {
    accept(el) {
      const btn = dom.closest(el, '.btn-resizer');
      // console.log('[ACCEPT] ', btn);
      return btn === selection.$$.btnResize;
    },
    beforeDrag() {
      sw = selection.selection.width;
      sh = selection.selection.height;
    },
    dragging(ctx) {
      selection.selection.width = sw + ctx.dx;
      selection.selection.height = sh + ctx.dy;
      selection.repaint();
    },
    afterDrag() {
      // console.log('[RESIZE] DONE');
    }
  };
}
class Selection {
  constructor(parentEl, selection, ranges) {
    this.$$ = { parent: parentEl, editing: false };
    this.selection = selection;
    this.ranges = ranges;
    boxEl = this.prepareEl();
    this.setVisible(false);
    this.dnd = new Dnd(moveHandler, { selection: this });
    this.resizeDnd = new Dnd(new ResizeHandler(this));
    this.repaint();
  }

  setVisible(visible) {
    this.visible = visible;
    const display = this.visible ? '' : 'none';
    dom.css(this.$$.el, { display });
  }
  prepareEl() {
    const { parent } = this.$$;
    const div = dom.tag.div('.selection');
    this.$$.el = div;
    dom.event.click(
      div,
      (e) => {
        e.stopPropagation();
        this.toggleEditing();
      },
      { stop: true }
    );
    /* move button */
    const button = dom.tag.iconButton(
      '.btn-move .btn-icon',
      '<svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>'
    );
    dom.event.consume(button, 'click');
    div.appendChild(button);
    parent.appendChild(div);

    /* resize button */
    const btnResize = dom.tag.iconButton(
      '.btn-icon .btn-resizer',
      '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="18px" viewBox="0 0 24 24" width="18px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><g/><polygon points="13,6.99 16,6.99 12,3 8,6.99 11,6.99 11,17.01 8,17.01 12,21 16,17.01 13,17.01"/></g></svg>'
    );
    div.appendChild(btnResize);
    this.$$.btnResize = btnResize;

    /* size box */
    const sizeDiv = dom.tag.div('.size-box');
    this.$$.sizeEl = sizeDiv;
    this.$$.sizeText = dom.tag.span('.size-text');
    sizeDiv.appendChild(this.$$.sizeText);
    sizeDiv.appendChild(
      dom.tag.iconButton(
        '.btn-range-lock',
        '<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 24 24" width="16px" fill="#ffffff"><g fill="none"><path d="M0 0h24v24H0V0z"/><path d="M0 0h24v24H0V0z" opacity=".87"/></g><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>'
      )
    );
    dom.event.click(this.$$.sizeText, (e) => {
      e.stopPropagation();
      this.eventBus.emit('sizebox', this.selection);
    });
    div.appendChild(sizeDiv);
    return div;
  }

  setRange(range) {
    this.selection = range;
    this.repaint();
  }

  toggleEditing() {
    this.$$.editing = !this.$$.editing;
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
      drawRange(this.$$.el, this.selection, this.$$.editing);
      drawSize(this.$$.sizeEl, this.selection);
    }
  }
}
export default Selection;
