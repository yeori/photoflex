import dom from './dom';

const template = {
  wrapper: `<div class="range-bg">
    <div class="range-box">
      <h3>선택영역</h3>
      <div class="range-input">
        <input type="text" placeholder="ex) 600 400" data-range-input>
        <button data-range-add>ADD</button>
      </div>
      <ul class="range-list">
      </ul>
      <div class="footer">
        <button data-range-close>CLOSE</button>
      </div>
    </div>
  </div>`,
  range: '<li class="range" data-w="@w" data-h="@h">@text</li>'
};
let wrapper;
let bus;
const close = () => {
  wrapper.remove();
};
const installListener = () => {
  dom.event.click(wrapper, (e) => {
    const { target } = e;
    dom.is(target, 'li.range', () => {
      const data = dom.data.int(target, ['w', 'h']);
      bus.emit('range', {
        range: {
          width: data.w,
          height: data.h
        },
        save: false
      });
    });
    dom.is(target, '[data-range-add]', () => {
      const input = dom.findOne(wrapper, '[data-range-input]');
      const [width, height] = input.value
        .split(' ')
        .map((t) => parseInt(t, 10));
      bus.emit('range', {
        range: {
          width,
          height
        },
        save: true
      });
    });
    dom.is(target, '[data-range-close]', () => {
      close();
    });
  });
};
const showRangeBox = (eventBus, parentEl, selection, ranges) => {
  bus = eventBus;
  const el = dom.parseTemplate(template.wrapper, {});
  console.log(el);
  const ul = dom.findOne(el, '.range-list');
  ranges.forEach((r) => {
    const text = r;
    const [w, h] = text.split('x');
    const li = dom.parseTemplate(template.range, { text, w, h });
    ul.appendChild(li);
  });
  wrapper = el;
  parentEl.appendChild(wrapper);
  installListener();
};

export default {
  showRangeBox,
  close
};
