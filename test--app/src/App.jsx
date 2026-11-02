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
import { getCurrentUser, 
        getUserProfile,
        getTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        getSavingsGoals,
        createSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        updateUserProfile,
        getUserSettings,
        updateUserSettings,
        loginUser
} from "./services/api";

    const mapTransaction = (transaction) => {
        const transactionDate = transaction.transaction_date || transaction.date;

        return {
            id: transaction.transaction_id || transaction.id,
            amount: Number(transaction.amount),
            type: transaction.type,
            category: transaction.category,
            paymentMethod: transaction.payment_method || transaction.paymentMethod,
            method: transaction.payment_method || transaction.paymentMethod || transaction.method,
            date: transactionDate
                ? transactionDate.slice(0, 10) + "T00:00"
                : "",
            note: transaction.note || ""
        };
    };

    const mapGoal = (goal) => ({
        id: goal.id,
        name: goal.goalName,
        targetAmount: Number(goal.targetAmount),
        currentSaved: Number(goal.currentSaved),
        targetDate: goal.targetDate || "",
        status: goal.status
    });

function App() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activePage, setActivePage] = useState("login");
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [goals, setGoals] = useState([]);
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

    const [user, setUser] = useState(null);
    const [profileDraft, setProfileDraft] = useState({});

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

    const loadTransactions = async () => {
        try {
            const data = await getTransactions();

            setTransactions(
                data.transactions.map(mapTransaction)
            );
        } catch (error) {
            console.error("Failed to load transactions:", error);
            alert(error.message);
        }
    };
    useEffect(() => {
        if (user) {
            loadTransactions();
        }
    }, [user]);

    // Open modal for adding a transaction
    const handleAddTransaction = () => {
        setEditingTransaction(null);
        setIsTransactionModalOpen(true);
    };

    const handleDeleteTransaction = async (id) => {
        try {
            await deleteTransaction(id);

            setTransactions((prev) =>
                prev.filter((transaction) => transaction.id !== id)
            );
        } catch (error) {
            console.error("Failed to delete transaction:", error);
            alert(error.message);
        }
    };

    // Open modal for editing a transaction
    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setIsTransactionModalOpen(true);
    };

    // Save a new or edited transaction
    const handleSaveTransaction = async (transactionData) => {
        try {
            const transactionPayload = {
                amount: Number(transactionData.amount),
                type: transactionData.type,
                category: transactionData.category,
                paymentMethod: transactionData.method || transactionData.paymentMethod,
                date: transactionData.date.slice(0, 10),
                note: transactionData.note || ""
            };

            if (editingTransaction) {
                await updateTransaction(
                    editingTransaction.id,
                    transactionPayload
                );

                if (settings.transactionNotifications) {
                    addNotification({
                        title: "Transaction Updated",
                        message: "Your transaction has been updated.",
                        type: "transaction"
                    });
                }
            } else {
                await createTransaction(transactionPayload);

                if (settings.transactionNotifications) {
                    addNotification({
                        title: "Transaction Added",
                        message: "Your new transaction has been added successfully.",
                        type: "transaction"
                    });
                }
            }

            await loadTransactions();

            setIsTransactionModalOpen(false);
            setEditingTransaction(null);

        } catch (error) {
            console.error("Failed to save transaction:", error);
            alert(error.message);
        }
    };

    const loadGoals = async () => {
        try {
            const data = await getSavingsGoals();

            setGoals(data.goals.map(mapGoal));
        } catch (error) {
            console.error("Failed to load savings goals:", error);
            alert(error.message);
        }
    };
    useEffect(() => {
        if (user) {
            loadGoals();
        }
    }, [user]);

    // Open modal for adding, deleting and editing a goal
    const handleAddGoal = () => {
        setEditingGoal(null);
        setIsGoalModalOpen(true);
    };

    const handleEditGoal = (goal) => {
        setEditingGoal(goal);
        setIsGoalModalOpen(true);
    };

    const handleDeleteGoal = async (id) => {
        try {
            await deleteSavingsGoal(id);

            setGoals((prev) =>
                prev.filter((goal) => goal.id !== id)
            );
        } catch (error) {
            console.error("Failed to delete savings goal:", error);
            alert(error.message);
        }
    };

    const handleSaveGoal = async (goalData) => {
        try {
            const goalPayload = {
                goalName: goalData.name,
                targetAmount: Number(goalData.targetAmount),
                currentSaved: Number(goalData.currentSaved),
                targetDate: goalData.targetDate
                    ? goalData.targetDate.slice(0, 10)
                    : null
            };

            if (editingGoal) {
                await updateSavingsGoal(editingGoal.id, goalPayload);
            } else {
                await createSavingsGoal(goalPayload);
            }

            await loadGoals();

            setIsGoalModalOpen(false);
            setEditingGoal(null);

        } catch (error) {
            console.error("Failed to save savings goal:", error);
            alert(error.message);
        }
    };

    const loadUserSettings = async () => {
        try {
            const data = await getUserSettings();

            const userSettings = {
                currency: data.settings.currency,
                theme: data.settings.theme,
                transactionNotifications: Boolean(data.settings.transactionNotifications),
                goalReminders: Boolean(data.settings.goalReminders),
                monthlySummary: Boolean(data.settings.monthlySummary)
            };

            setSettings(userSettings);
            setSettingsDraft({ ...userSettings });

            localStorage.setItem("finora-theme", userSettings.theme);

        } catch (error) {
            console.error("Failed to load user settings:", error);
            alert(error.message);
        }
    };

    const hasUnsavedChanges =
    JSON.stringify(settingsDraft) !== JSON.stringify(settings);

    // Settings page
    const handleSaveSettings = async () => {
        if (activePage === "settings") {
            try {
                const settingsData = {
                    currency: settingsDraft.currency,
                    theme: settingsDraft.theme,
                    transactionNotifications: settingsDraft.transactionNotifications,
                    goalReminders: settingsDraft.goalReminders,
                    monthlySummary: settingsDraft.monthlySummary
                };

                await updateUserSettings(settingsData);

                setSettings({ ...settingsData });
                setSettingsDraft({ ...settingsData });

                localStorage.setItem("finora-theme", settingsData.theme);

            } catch (error) {
                console.error("Failed to save settings:", error);
                alert(error.message);
                return;
            }
        }

        if (activePage === "profile") {
            // Keep your existing profile save logic here.
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

    // Restore login session when the app starts
    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setIsAuthLoading(false);
                return;
            }

            try {
                // Verify whether the saved JWT is still valid
                await getCurrentUser();

                // Retrieve the user's complete profile
                const data = await getUserProfile();

                const loggedInUser = {
                    userId: data.user.userId,
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone || "",
                    occupation: data.user.occupation || ""
                };

                setUser(loggedInUser);
                setProfileDraft({ ...loggedInUser });

                await loadUserSettings();

                setActivePage("dashboard");

            } catch (error) {
                console.error("Session restoration failed:", error);

                localStorage.removeItem("token");
                setUser(null);
                setActivePage("login");

            } finally {
                setIsAuthLoading(false);
            }
        };

        restoreSession();
    }, []);

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
        localStorage.removeItem("token");
        setUser(null);
        setActivePage("login");
        setMobileMenuOpen(false);
    };

    const handleLogin = async (loggedInUser) => {
        try {
            const data = await getUserProfile();

            const selectedUser = {
                userId: loggedInUser.user_id,
                name: data.user.name,
                email: data.user.email,
                phone: data.user.phone || "",
                occupation: data.user.occupation || ""
            };

            setUser(selectedUser);
            setProfileDraft({ ...selectedUser });
            await loadUserSettings();
            setActivePage("dashboard");

        } catch (error) {
            console.error("Failed to retrieve user profile:", error);
            alert("Login successful, but failed to load your profile.");

            localStorage.removeItem("token");
            setUser(null);
            setActivePage("login");
        }
    };

    const handleSelectAccount = async (email, password) => {
        const previousToken = localStorage.getItem("token");
        let newTokenInstalled = false;
        try {
            // Authenticate the new account.
            const data = await loginUser(email, password);

            // Replace the previous account's token.
            localStorage.setItem("token", data.token);

            newTokenInstalled = true;

            // Load the new account's profile and settings.
            const profileData = await getUserProfile();

            const selectedUser = {
                userId: profileData.user.userId,
                name: profileData.user.name,
                email: profileData.user.email,
                phone: profileData.user.phone || "",
                occupation: profileData.user.occupation || ""
            };

            await loadUserSettings();

            setUser(selectedUser);
            setProfileDraft({ ...selectedUser });
            setActivePage("dashboard");
            setMobileMenuOpen(false);

            return true;

        } catch (error) {
            console.error("Failed to switch account:", error);

            if (newTokenInstalled) {
                if (previousToken) {
                    localStorage.setItem("token", previousToken);
                } else {
                    localStorage.removeItem("token");
                }
            }

            throw error;
        }
    };

    const isAuthPage =
        activePage === "login" || activePage === "switch-account";

    const handleSaveProfile = async () => {
        try {
            const profileData = {
                name: profileDraft.name.trim(),
                phone: profileDraft.phone || "",
                occupation: profileDraft.occupation || ""
            };

            await updateUserProfile(profileData);

            const updatedUser = {
                ...user,
                ...profileData
            };

            setUser(updatedUser);
            setProfileDraft(updatedUser);
            setProfileHasUnsavedChanges(false);

            return true;

        } catch (error) {
            console.error("Failed to update profile:", error);
            alert(error.message);
            return false;
        }
    };

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
                        onUnsavedChange={setProfileHasUnsavedChanges}
                        onRequestDiscard={() => {
                            setPendingPage(null);
                            setShowUnsavedModal(true);
                        }}
                        onSaveProfile={handleSaveProfile}
                    />
                );

            case "switch-account":
                return (
                    <SwitchAccount
                        user={user}
                        onBack={() => setActivePage("dashboard")}
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

    if (isAuthLoading) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <h2>Finora</h2>
                    <p>Checking your session...</p>
                </div>
            </div>
        );
    }
    
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
