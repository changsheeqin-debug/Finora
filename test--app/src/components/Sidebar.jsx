import { useState } from "react";

function Sidebar({
    activePage,
    setActivePage,
    sidebarCollapsed,
    setSidebarCollapsed,
    setMobileMenuOpen,
    user,
    onSwitchAccount,
    onLogout
}) {
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: "▦" },
        { id: "transactions", label: "Transactions", icon: "▤" },
        { id: "goals", label: "Savings goals", icon: "◎" }
    ];

    const preferenceItems = [
    { id: "profile", label: "My Profile", icon: "♙" },
    { id: "settings", label: "Settings", icon: "⚙" }
    ];

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-mark">f.</div>
                <span className="brand-name">finora</span>

                <button
                    className="sidebar-toggle"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    title="Collapse sidebar"
                >
                    {sidebarCollapsed ? "→" : "←"}
                </button>

                <button
                    className="mobile-close"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    ×
                </button>
            </div>

            <div>
                <div className="nav-label">Workspace</div>

                <nav className="nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={activePage === item.id ? "active" : ""}
                            onClick={() => setActivePage(item.id)}
                            title={sidebarCollapsed ? item.label : ""}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                <div className="nav-label">Preferences</div>

                <nav className="nav">
                    {preferenceItems.map((item) => (
                        <button
                            key={item.id}
                            className={activePage === item.id ? "active" : ""}
                            onClick={() => setActivePage(item.id)}
                            title={sidebarCollapsed ? item.label : ""}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="side-bottom">
                <div className="account-menu-container">
                    {accountMenuOpen && (
                        <div className="account-menu">
                            <div className="account-menu-header">
                                <span>{user?.name || "User"}</span>
                                <small>{user?.email || ""}</small>
                            </div>

                            <button
                                onClick={() => {
                                    setActivePage("profile");
                                    setAccountMenuOpen(false);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <span>♙</span>
                                View Profile
                            </button>

                            <button
                                onClick={() => {
                                    setAccountMenuOpen(false);
                                    setMobileMenuOpen(false);
                                    onSwitchAccount();
                                }}
                            >
                                <span>⇄</span>
                                Switch Account
                            </button>

                            <div className="account-menu-divider"></div>

                            <button
                                className="logout-option"
                                onClick={() => {
                                    setAccountMenuOpen(false);
                                    setMobileMenuOpen(false);
                                    onLogout();
                                }}
                            >
                                <span>⇥</span>
                                Log Out
                            </button>
                        </div>
                    )}

                    <button
                        className={`sidebar-profile-button ${
                            accountMenuOpen ? "account-active" : ""
                        }`}
                        onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    >
                        <div className="profile">
                            <div className="avatar">
                                {(user?.name || "User")
                                    .split(" ")
                                    .filter(Boolean)
                                    .map((part) => part[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>

                            <div className="profile-info">
                                <strong>{user?.name || "User"}</strong>
                                <small>Personal account</small>
                            </div>

                            <span className="account-menu-arrow">
                                {accountMenuOpen ? "⌄" : "⌃"}
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;