import { h } from 'hyperapp';

const MIN_WIDTH = 200;

const styles = {
  footer: {
    width: '100%',
    lineHeight: '11px',
    textAlign: 'right',
    fontSize: '8px',
    color: '#fff',
    backgroundColor: '#4A8F38'
  },
  courtesy: {
    marginRight: '4px'
  }
};

const CredentialsMenu = ({
  top,
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
    top: `${top}px`,
    left: `${left}px`,
    minWidth: width > MIN_WIDTH ? `${Math.round(width)}px` : `${MIN_WIDTH}px`,
    minHeight: '30px'
  };

  return (
    <div style={style}>
      <div className="card card-2 card--credentials">
        {Array.isArray(credentials) && credentials.length > 0
          ? <ul className="keepassxc-credentials-menu">
              {credentials.map(({ uuid, name, login, password }, index) =>
                <li
                  key={uuid}
                  className={`keepassxc-credentials-menu__item${selected ===
                    index
                    ? ' keepassxc-credentials-menu__item--selected'
                    : ''}`}
                  onclick={() => {
                    onSelect(index);
                  }}
                  onmouseover={() => {
                    onHover(index);
                  }}
                >
                  <div className="keepassxc-credentials-menu__username ">{login}</div>
                  <div className="keepassxc-credentials-menu__url">{name}</div>
                </li>
              )}
            </ul>
          : <div className="keepassxc-credentials-menu--empty" />}
        <div style={styles.footer}>
          <span style={styles.courtesy}>KeePassXC</span>
        </div>
      </div>
    </div>
  );
};

export default CredentialsMenu;
