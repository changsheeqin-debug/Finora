import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { showSuccessToast, showErrorToast } from "./utils/showToast";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import TransactionModal from "./components/TransactionModal";
import SavingsGoals from "./pages/SavingsGoals";
import GoalModal from "./components/GoalModal";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import NotificationDropdown from "./components/NotificationDropdown";
import SwitchAccount from "./pages/SwitchAccount";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

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
        loginUser,
        getNotifications,
        createNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead
} from "./services/api";

const initialResetToken =
    new URLSearchParams(window.location.search).get("resetToken") || "";

    const mapTransaction = (transaction) => {
        const transactionDate = transaction.transaction_date || transaction.date;

        return {
            id: transaction.transaction_id || transaction.id,
            amount: Number(transaction.amount),
            type: transaction.type,
            category: transaction.category,
            paymentMethod: transaction.payment_method || transaction.paymentMethod,
            method: transaction.payment_method || transaction.paymentMethod || transaction.method,
            date: transaction.transaction_date || "",
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
    const [activePage, setActivePage] = useState(
        initialResetToken ? "forgot-password" : "login"
    );
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [goals, setGoals] = useState([]);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [notifications, setNotifications] = useState([]);
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

    const [rememberedAccounts, setRememberedAccounts] = useState(() => {
    return JSON.parse(
        localStorage.getItem("rememberedAccounts") || "[]"
    );
});

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
            showErrorToast(error.message);
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

            await loadNotifications();

            showSuccessToast("Transaction deleted successfully!");

        } catch (error) {
            console.error("Failed to delete transaction:", error);
            showErrorToast(error.message);
        }
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
                await updateTransaction(editingTransaction.id, transactionPayload);
                showSuccessToast("Transaction updated successfully!");
            } else {
                await createTransaction(transactionPayload);
                showSuccessToast("Transaction added successfully!");
            }

            await loadTransactions();
            await loadNotifications();

            setIsTransactionModalOpen(false);
            setEditingTransaction(null);

        } catch (error) {
            console.error("Failed to save transaction:", error);
            showErrorToast(error.message);
        }
    };
    // Open modal for editing a transaction
    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setIsTransactionModalOpen(true);
    };


    const loadGoals = async () => {
        try {
            const data = await getSavingsGoals();

            setGoals(data.goals.map(mapGoal));
        } catch (error) {
            console.error("Failed to load savings goals:", error);
            showErrorToast(error.message);
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

            await loadNotifications();

            showSuccessToast("Savings goal deleted successfully!");

        } catch (error) {
            console.error("Failed to delete savings goal:", error);
            showErrorToast(error.message);
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
                showSuccessToast("Savings goal updated successfully!");
            } else {
                await createSavingsGoal(goalPayload);
                showSuccessToast("Savings goal created successfully!");
            }

            await loadGoals();
            await loadNotifications();

            setIsGoalModalOpen(false);
            setEditingGoal(null);

        } catch (error) {
            console.error("Failed to save savings goal:", error);
            showErrorToast(error.message);
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
            showErrorToast(error.message);
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
                showSuccessToast("Settings saved successfully!");

                setSettings({ ...settingsData });
                setSettingsDraft({ ...settingsData });

                localStorage.setItem("finora-theme", settingsData.theme);

            } catch (error) {
                console.error("Failed to save settings:", error);
                showErrorToast(error.message);
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

                if (!initialResetToken) {
                    setActivePage("dashboard");
                }

            } catch (error) {
                console.error("Session restoration failed:", error);

                localStorage.removeItem("token");
                setUser(null);
                setActivePage(initialResetToken ? "forgot-password" : "login");

            } finally {
                setIsAuthLoading(false);
            }
        };

        restoreSession();
    }, []);

    const addNotification = async (notification) => {
        try {
            const data = await createNotification(notification);

            console.log("Created notification:", data.notification);

            setNotifications((prev) => [
                data.notification,
                ...prev
            ]);
        } catch (error) {
            console.error("Failed to create notification:", error);
        }
    };

    const loadNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data.notifications);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        }
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    isRead: true
                }))
            );
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
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

            // Remember this account
            const token = localStorage.getItem("token");

            const updatedAccounts = saveRememberedAccount(
                selectedUser,
                token
            );

            setRememberedAccounts(updatedAccounts);

            setUser(selectedUser);
            setProfileDraft({ ...selectedUser });

            await loadUserSettings();
            await loadNotifications();

            setActivePage("dashboard");

        } catch (error) {
            console.error("Failed to retrieve user profile:", error);
            showErrorToast("Login successful, but failed to load your profile.");

            localStorage.removeItem("token");
            setUser(null);
            setActivePage("login");
        }
    };

    const handleSelectAccount = async (email, password) => {
        const previousToken = localStorage.getItem("token");
        let newTokenInstalled = false;

        try {
            // Authenticate the selected account
            const data = await loginUser(email, password);

            // Replace the previous account's token
            localStorage.setItem("token", data.token);
            newTokenInstalled = true;

            // Load the selected account's profile
            const profileData = await getUserProfile();

            const selectedUser = {
                userId: profileData.user.userId,
                name: profileData.user.name,
                email: profileData.user.email,
                phone: profileData.user.phone || "",
                occupation: profileData.user.occupation || ""
            };

            // Load the selected account's settings
            await loadUserSettings();
            await loadNotifications();

            // Remember the successfully logged-in account
            const updatedAccounts = saveRememberedAccount(
                selectedUser,
                data.token
            );

            setRememberedAccounts(updatedAccounts);

            // Update the current user
            setUser(selectedUser);
            setProfileDraft({ ...selectedUser });

            // Clear previous account's data
            setTransactions([]);
            setGoals([]);

            setActivePage("dashboard");
            setMobileMenuOpen(false);

            return true;

        } catch (error) {
            console.error("Failed to switch account:", error);

            // Restore the previous account's token if switching fails
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

    const handleRemoveAccount = (userId) => {
    const updatedAccounts = rememberedAccounts.filter(
        (account) => String(account.userId) !== String(userId)
    );

    setRememberedAccounts(updatedAccounts);

    localStorage.setItem(
        "rememberedAccounts",
        JSON.stringify(updatedAccounts)
    );
};

    const isAuthPage =
        activePage === "login" ||
        activePage === "switch-account" ||
        activePage === "forgot-password";


    const handleSaveProfile = async () => {
        try {
            const profileData = {
                name: profileDraft.name.trim(),
                phone: profileDraft.phone || "",
                occupation: profileDraft.occupation || ""
            };

            await updateUserProfile(profileData);

            showSuccessToast("Profile updated successfully!");

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
            showErrorToast(error.message);
            return false;
        }
    };

    // switch acc: Remember accounts after successful login.
    const saveRememberedAccount = (user, token) => {
        const savedAccounts = JSON.parse(
            localStorage.getItem("rememberedAccounts") || "[]"
        );

        const updatedAccount = {
            userId: user.userId,
            name: user.name,
            email: user.email,
            token
        };

        // Replace the existing account if it is already remembered
        const updatedAccounts = [
            updatedAccount,
            ...savedAccounts.filter(
                (account) =>
                    String(account.userId) !== String(user.userId)
            )
        ];

        localStorage.setItem(
            "rememberedAccounts",
            JSON.stringify(updatedAccounts)
        );

        return updatedAccounts;
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
                        accounts={rememberedAccounts}
                        onBack={() => setActivePage("dashboard")}
                        onSelectAccount={handleSelectAccount}
                        onAddAccount={() => setActivePage("login")}
                        onRemoveAccount={handleRemoveAccount}
                    />
                );

            case "login":
                return (
                    <Login
                        onLogin={handleLogin}
                        showBackButton={Boolean(user)}
                        onBack={() => setActivePage("switch-account")}
                        onSignUp={() => setActivePage("register")}
                        onForgotPassword={() => setActivePage("forgot-password")}
                    />
                );

            case "forgot-password":
                return (
                    <ForgotPassword
                        resetToken={initialResetToken}
                        onBackToLogin={() => setActivePage("login")}
                    />
                );

            case "register":
                return (
                    <Register
                        onBackToLogin={() => setActivePage("login")}
                    />
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
            <ToastContainer position="top-right" />

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
