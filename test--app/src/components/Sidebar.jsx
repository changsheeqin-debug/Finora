function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '▦' },
    { id: 'transactions', label: 'Transactions', icon: '▤' },
    { id: 'goals', label: 'Savings goals', icon: '◎' }
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">f.</div>
        finora
      </div>

      <div>
        <div className="nav-label">Workspace</div>

        <nav className="nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={activePage === item.id ? 'active' : ''}
              onClick={() => setActivePage(item.id)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        <div className="nav-label">Preferences</div>
        <nav className="nav">
          <button>⚙ Settings</button>
          <button>⇥ Sign out</button>
        </nav>
      </div>

      <div className="side-bottom">
        <div className="profile">
          <div className="avatar">JD</div>
          <div>
            <strong>Jamie Doe</strong>
            <small>Personal account</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;