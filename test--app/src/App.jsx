import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import TransactionModal from "./components/TransactionModal";
import { initialTransactions, mockGoals } from "./mockData";
import SavingsGoals from "./pages/SavingsGoals";
import GoalModal from "./components/GoalModal";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import NotificationDropdown from "./components/NotificationDropdown";
import SwitchAccount from "./pages/SwitchAccount";
import Login from "./pages/Login";

function App() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activePage, setActivePage] = useState("dashboard");
    const [transactions, setTransactions] = useState(initialTransactions);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [goals, setGoals] = useState(mockGoals);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [profileHasUnsavedChanges, setProfileHasUnsavedChanges] = useState(false);

    const [settings, setSettings] = useState({
        currency: "MYR",
        theme: localStorage.getItem("finora-theme") || "light",
        transactionNotifications: true,
        goalReminders: true,
        monthlySummary: false
    });

    const [settingsDraft, setSettingsDraft] = useState({...settings});
    const [pendingPage, setPendingPage] = useState(null);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    const [user, setUser] = useState({
        name: "Jamie Doe",
        email: "jamie@example.com",
        phone: "",
        occupation: ""
    });
    
    const [profileDraft, setProfileDraft] = useState({ ...user });

    const handleNavigate = (page) => {
        if (
            (activePage === "settings" && hasUnsavedChanges) ||
            (activePage === "profile" && profileHasUnsavedChanges)
        ) {
            setPendingPage(page);
            setShowUnsavedModal(true);
            return;
        }

        setActivePage(page);
        setMobileMenuOpen(false);
    };

    // Open modal for adding a transaction
    const handleAddTransaction = () => {
        setEditingTransaction(null);
        setIsTransactionModalOpen(true);
    };
    const handleDeleteTransaction = (id) => {
        setTransactions((prev) =>
            prev.filter((transaction) => transaction.id !== id)
        );
    };
    // Open modal for editing a transaction
    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setIsTransactionModalOpen(true);
    };

    // Save a new or edited transaction
    const handleSaveTransaction = (transactionData) => {
        if (editingTransaction) {
            setTransactions((prev) =>
                prev.map((transaction) =>
                    transaction.id === editingTransaction.id
                        ? { ...transaction, ...transactionData }
                        : transaction
                )
            );

            if (settings.transactionNotifications) {
                addNotification({
                    title: "Transaction Updated",
                    message: "Your transaction has been updated.",
                    type: "transaction"
                });
            }
        } else {
            const newTransaction = {
                ...transactionData,
                id: `txn_${Date.now()}`
            };

            setTransactions((prev) => [...prev, newTransaction]);

            if (settings.transactionNotifications) {
                addNotification({
                    title: "Transaction Added",
                    message: "Your new transaction has been added successfully.",
                    type: "transaction"
                });
            }
        }

        setIsTransactionModalOpen(false);
        setEditingTransaction(null);
    };

    // Open modal for adding, deleting and editing a goal
    const handleAddGoal = () => {
        setEditingGoal(null);
        setIsGoalModalOpen(true);
    };

    const handleEditGoal = (goal) => {
        setEditingGoal(goal);
        setIsGoalModalOpen(true);
    };

    const handleDeleteGoal = (id) => {
        setGoals((prev) =>
            prev.filter((goal) => goal.id !== id)
        );
    };

    const handleSaveGoal = (goalData) => {
        if (editingGoal) {
            setGoals((prev) =>
                prev.map((goal) =>
                    goal.id === editingGoal.id
                        ? { ...goal, ...goalData }
                        : goal
                )
            );
        } else {
            const newGoal = {
                ...goalData,
                id: `goal_${Date.now()}`
            };

            setGoals((prev) => [...prev, newGoal]);
        }

        setIsGoalModalOpen(false);
        setEditingGoal(null);
    };

    const hasUnsavedChanges =
    JSON.stringify(settingsDraft) !== JSON.stringify(settings);

    // Settings page
    const handleSaveSettings = () => {
        if (activePage === "settings") {
            setSettings({ ...settingsDraft });
            localStorage.setItem("finora-theme", settingsDraft.theme);
        }

        if (activePage === "profile") {
            setUser({ ...profileDraft });
            setProfileHasUnsavedChanges(false);
        }

        setShowUnsavedModal(false);
        setMobileMenuOpen(false);

        if (pendingPage !== null) {
            setActivePage(pendingPage);
            setPendingPage(null);
        }
    };

    const handleDiscardSettings = () => {
        if (activePage === "settings") {
            setSettingsDraft({ ...settings });
        }

        if (activePage === "profile") {
            setProfileDraft({ ...user });
            setProfileHasUnsavedChanges(false);
        }

        setShowUnsavedModal(false);
        setMobileMenuOpen(false);

        if (pendingPage !== null) {
            setActivePage(pendingPage);
            setPendingPage(null);
        }
    };

    const handleStayOnSettings = () => {
        setShowUnsavedModal(false);
        setPendingPage(null);
        setMobileMenuOpen(false);
    };


    useEffect(() => {
        document.documentElement.style.colorScheme = settingsDraft.theme;
    }, [settingsDraft.theme]);

    // notification
    const addNotification = (notification) => {
        setNotifications((prev) => [
            {
                id: `notification_${Date.now()}`,
                date: new Date().toISOString(),
                isRead: false,
                ...notification
            },
            ...prev
        ]);
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    const handleToggleNotifications = () => {
        setShowNotifications((prev) => !prev);
    };

    const handleMarkAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((notification) => ({
                ...notification,
                isRead: true
            }))
        );
    };

    //display switch account
    const handleSwitchAccount = () => {
        setActivePage("switch-account");
    };

    const handleLogout = () => {
        setActivePage("login");
        setMobileMenuOpen(false);
    };

    const handleLogin = (email) => {
        const selectedUser = {
            name: email.split("@")[0],
            email: email,
            phone: "",
            occupation: ""
        };

        setUser(selectedUser);
        setProfileDraft({ ...selectedUser });
        setActivePage("dashboard");
    };

    const isAuthPage =
        activePage === "login" || activePage === "switch-account";

    // Render the selected page
    const renderPage = () => {
        switch (activePage) {
            case "dashboard":
                return (
                    <Dashboard
                        transactions={transactions}
                        goals={goals}
                        currency={settings.currency}
                        notifications={notifications}
                        onAddTransaction={handleAddTransaction}
                        onNavigate={handleNavigate}
                        user={user}
                    />
                );

            case "transactions":
                return (
                    <Transactions
                        transactions={transactions}
                        currency={settings.currency}
                        onAddTransaction={handleAddTransaction}
                        onEditTransaction={handleEditTransaction}
                        onDeleteTransaction={handleDeleteTransaction}
                    />
                );

            case "goals":
                return (
                    <SavingsGoals
                        goals={goals}
                        currency={settings.currency}
                        onAddGoal={handleAddGoal}
                        onEditGoal={handleEditGoal}
                        onDeleteGoal={handleDeleteGoal}
                    />
                );

            case "settings":
                return (
                    <Settings
                        settings={settingsDraft}
                        onUpdateSettings={setSettingsDraft}
                        onSaveSettings={handleSaveSettings}
                    />
                );

            case "profile":
                return (
                    <UserProfile
                        user={user}
                        profileDraft={profileDraft}
                        onUpdateProfileDraft={setProfileDraft}
                        onUpdateUser={setUser}
                        onUnsavedChange={setProfileHasUnsavedChanges}
                        onRequestDiscard={() => {
                            setPendingPage(null);
                            setShowUnsavedModal(true);
                        }}
                    />
                );

            case "switch-account":
                return (
                    <SwitchAccount
                        user={user}
                        onBack={() => setActivePage("dashboard")}
                        onSelectAccount={(selectedUser) => {
                            setUser(selectedUser);
                            setProfileDraft({ ...selectedUser });
                            setActivePage("dashboard");
                        }}
                        onAddAccount={() => setActivePage("login")}
                    />
                );

            case "login":
                return (
                    <Login onLogin={handleLogin} />
                );

            default:
                return <Dashboard
                    transactions={transactions}
                    onAddTransaction={handleAddTransaction}
                    onNavigate={handleNavigate}
                />;
        }
    };

    return (
    <div
        className={`app ${
            sidebarCollapsed ? "sidebar-collapsed" : ""
        } ${mobileMenuOpen ? "mobile-menu-open" : ""}`}
        
    >
        {!isAuthPage && (
            <Sidebar
                activePage={activePage}
                setActivePage={handleNavigate}
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                setMobileMenuOpen={setMobileMenuOpen}
                user={user}
                onSwitchAccount={handleSwitchAccount}
                onLogout={handleLogout}
            />
        )}
        
        <main className="main-content">

            <div className="app-header">
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    ☰
                </button>

                <NotificationDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                />

            </div>

            {renderPage()}

        </main>

        <TransactionModal
            isOpen={isTransactionModalOpen}
            onClose={() => setIsTransactionModalOpen(false)}
            onSave={handleSaveTransaction}
            initialData={editingTransaction}
            currency={settings.currency}
        />

        <GoalModal
            isOpen={isGoalModalOpen}
            onClose={() => {
                setIsGoalModalOpen(false);
                setEditingGoal(null);
            }}
            onSave={handleSaveGoal}
            initialData={editingGoal}
        />

            {showUnsavedModal && (
        <div className="modal-overlay">
            <div className="modal unsaved-modal">
                <div className="unsaved-icon">!</div>

                <h2>Unsaved Changes</h2>

                <p>
                    You have unsaved changes. Would you like to save
                    them before leaving this page?
                </p>

                <div className="unsaved-actions">
                    <button
                        className="btn-secondary"
                        onClick={handleStayOnSettings}
                    >
                        Stay
                    </button>

                    <button
                        className="btn-danger"
                        onClick={handleDiscardSettings}
                    >
                        Discard
                    </button>

                    <button
                        className="btn-primary"
                        onClick={handleSaveSettings}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )}
    </div>
);
}

export default App;
