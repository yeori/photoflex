class Attr {
  constructor(attrExpression) {
    this.expression = attrExpression;
  }

  get isClass() {
    return this.expression.charAt(0) === '.';
  }

  get isId() {
    return this.expression.charAt(0) === '#';
  }

  get value() {
    return this.expression.substring(1);
  }

  setAttribute(el) {
    if (this.isId) {
      el.setAttribute('id', this.value);
    } else if (this.isClass) {
      el.classList.add(this.value);
    } else {
      throw new Error(`neither id nor class : [${this.expression}]`);
    }
  }
}
const closest = (elem, selector) => {
  if (elem.nodeType === 1) {
    return elem.closest(selector);
  }
  if (elem.nodeType === 3) {
    return elem.parentElement.closest(selector);
  }
  throw new Error(`node type ${elem.nodeTye}, tag(${elem.nodeName})`);
};

const parseAttr = (expression) => {
  const attr = expression || '';
  return attr
    .split(',')
    .map((val) => val.trim())
    .filter((val) => val.length > 0);
};
const createEl = (tagName, attributes) => {
  const tag = document.createElement(tagName);
  attributes.forEach((value) => {
    const attr = new Attr(value);
    attr.setAttribute(tag);
  });
  return tag;
};
const tag = {
  iconButton: (attrs, content) => {
    const button = createEl('BUTTON', parseAttr(attrs));
    button.innerHTML = content;
    return button;
  },
  img: (imgUrl) => {
    const img = document.createElement('img');
    return new Promise((resolve) => {
      img.addEventListener('load', () => {
        // img.crossOrigin = 'Anonymous';
        resolve({ img, width: 600, height: 600 });
      });
      img.src = imgUrl;
    });
  },
  div: (attr) => createEl('DIV', parseAttr(attr)),
  canvas: (attr) => createEl('CANVAS', parseAttr(attr))
};

const imageSize = (imgUrl) => {
  const xhr = new XMLHttpRequest();
  xhr.open('HEAD', imgUrl, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.DONE) {
      console.log(xhr.getResponseHeader('Content-Length'));
    }
  };
  xhr.send();
};

const fileToImage = (file) => {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.addEventListener('load', () => {
      const img = document.createElement('img');
      img.src = reader.result;
      resolve({ file, img });
    });
    reader.readAsDataURL(file);
  });
};

const registerEvent = (target, eventName, callback) => {
  const el = target || window;
  el.addEventListener(eventName, callback);
};
const event = {
  mousedown: (callback, target) => {
    registerEvent(target, 'mousedown', callback);
  },
  mousemove: (callback, target) => {
    registerEvent(target, 'mousemove', callback);
  },
  mouseup: (callback, target) => {
    registerEvent(target, 'mouseup', callback);
  }
};
export default { tag, closest, imageSize, fileToImage, event };
