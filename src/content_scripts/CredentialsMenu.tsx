import { h } from 'hyperapp';

const MIN_WIDTH = 200;

const styles = {
  courtesy: {
    marginRight: '4px'
  }
};

const CredentialsMenu = ({
  bottom,
  left,
  width,
  credentials,
  selected,
  onSelect,
  onHover
}) => {
  // Workaround: for position type
  // https://github.com/Microsoft/TypeScript/issues/11465
  const style = {
    position: 'absolute' as 'absolute',
    top: `${bottom}px`,
    left: `${left}px`,
    minWidth: width > MIN_WIDTH ? `${Math.round(width)}px` : `${MIN_WIDTH}px`,
    minHeight: '30px',
    marginLeft: '2px',
    marginTop: '5px'
  };

  return (
    <div style={style}>
      <div className="keepassxc-card" style={{ width: '100%' }}>
        {Array.isArray(credentials) && credentials.length > 0
          ? <ul className="keepassxc-credentials">
              {credentials.map(({ uuid, name, login, password }, index) =>
                <li
                  key={uuid}
                  className={`keepassxc-credentials__item${selected ===
                    index
                    ? ' keepassxc-credentials__item--selected'
                    : ''}`}
                  onclick={() => {
                    onSelect(index);
                  }}
                  onmouseover={() => {
                    onHover(index);
                  }}
                >
                  <div className="keepassxc-credentials__username ">{login}</div>
                  <div className="keepassxc-credentials__url">{name}</div>
                </li>
              )}
            </ul>
          : <div className="keepassxc-credentials--empty" />}
        <div className="keepassxc-credentials__footer">
          <span style={styles.courtesy}>KeePassXC</span>
        </div>
      </div>
    </div>
  );
};

export default CredentialsMenu;
