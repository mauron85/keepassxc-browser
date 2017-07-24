/* globals window */
import { h } from 'hyperapp';

const getStyle = ({ top, left, width, height }) => {
  return {
    position: 'absolute',
    boxSizing: 'border-box',
    top: `${top}px`,
    left: `${left}px`,
    height: `${height}px`,
    width: `${width}px`,
    border: '2px solid #aaa',
    backgroundColor: '#ccc'
  };
};

const CredentialsFields = props => {
  const { fields } = props;
  const { scrollX, scrollY } = window;
  return (
    <div className="keepassxc-choose-credentials-fields">
      {fields.map(el => {
        let { top, left, width, height } = el.getBoundingClientRect();
        const style = getStyle({
          top: top + scrollY - 2,
          left: left + scrollX - 2,
          width: width + 2,
          height: height + 2
        });
        return <div style={style} />;
      })}
    </div>
  );
};

export default CredentialsFields;
