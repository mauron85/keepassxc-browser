/* globals window */
import { h } from 'hyperapp';

const getStyle = ({ top, left, width, height }) => {
  return {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    height: `${height}px`,
    width: `${width}px`,
  };
};

const CredentialsForms = props => {
  const { scrollX, scrollY } = window;
  const { root, forms } = props;
  const frag = document.createDocumentFragment();
  forms.forEach(el => {
    let { top, left, width, height } = el.getBoundingClientRect();
    top += scrollY;
    left =+ scrollX;

    const node = el.cloneNode(true); // deep clone
    const style = getStyle({ top, left, width, height });
    for (let prop in style) {
      node.style[prop] = style[prop];
    }
    frag.appendChild(node);
  });
  root.appendChild(frag);

  return null;
};

export default CredentialsForms;
