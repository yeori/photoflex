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
  range: '<li class="range" data-w="@w" data-h="@h"><span>@text</span></li>'
};
let wrapper;
let ranges;
let bus;
const close = () => {
  wrapper.remove();
};
const renderOptions = () => {
  const ul = dom.findOne(wrapper, '.range-list');
  ul.replaceChildren();
  ranges.options.forEach((option, idx) => {
    const { width: w, height: h } = option;
    const text = `${w}x${h}`;
    const li = dom.parseTemplate(template.range, { text, w, h });
    if (idx === ranges.active) {
      li.classList.add('active');
    }
    ul.appendChild(li);
  });
};
const installListener = () => {
  dom.event.click(wrapper, (e) => {
    const { target } = e;
    dom.is(target, 'li.range', (li) => {
      const data = dom.data.int(li, ['w', 'h']);
      const activeIndex = ranges.options.findIndex(
        (r) => r.width === data.w && r.height === data.h
      );
      ranges.active = activeIndex;
      renderOptions();
      bus.emit('range', {
        range: {
          width: data.w,
          height: data.h
        },
        active: activeIndex,
        save: false
      });
    });
    dom.is(target, '[data-range-add]', () => {
      const input = dom.findOne(wrapper, '[data-range-input]');
      const [width, height] = input.value
        .split(' ')
        .map((t) => parseInt(t, 10));
      const range = { width, height };
      ranges.options.push(range);
      const activeIndex = ranges.options.length - 1;
      ranges.active = activeIndex;
      renderOptions();
      bus.emit('range', {
        range,
        active: activeIndex,
        save: true
      });
    });
    dom.is(target, '[data-range-close]', () => {
      close();
    });
  });
};

const showRangeBox = (eventBus, parentEl, selection, _ranges) => {
  bus = eventBus;
  ranges = _ranges;
  const el = dom.parseTemplate(template.wrapper, {});
  wrapper = el;
  console.log(el);
  renderOptions(ranges);
  parentEl.appendChild(wrapper);
  installListener();
};

export default {
  showRangeBox,
  close
};
