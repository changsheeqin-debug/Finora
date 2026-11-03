const API_BASE_URL = "http://localhost:5000/api";
// const API_BASE_URL = "http://192.168.1.105:5000/api";

// Reusable API request function
const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && {
                Authorization: `Bearer ${token}`
            }),
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
};


// Authentication APIs

export const loginUser = (email, password) => {
    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
};

export const registerUser = (name, email, password) => {
    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
    });
};

// Get currently authenticated user
export const getCurrentUser = () => {
    return apiRequest("/auth/me");
};

// Get complete user profile
export const getUserProfile = () => {
    return apiRequest("/users/profile");
};

// Get all transactions
export const getTransactions = () => {
    return apiRequest("/transactions");
};

// Create a transaction
export const createTransaction = (transaction) => {
    return apiRequest("/transactions", {
        method: "POST",
        body: JSON.stringify(transaction)
    });
};

// Update a transaction
export const updateTransaction = (id, transaction) => {
    return apiRequest(`/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(transaction)
    });
};

// Delete a transaction
export const deleteTransaction = (id) => {
    return apiRequest(`/transactions/${id}`, {
        method: "DELETE"
    });
};

// Get all savings goals
export const getSavingsGoals = () => {
    return apiRequest("/savings-goals");
};

// Create a savings goal
export const createSavingsGoal = (goal) => {
    return apiRequest("/savings-goals", {
        method: "POST",
        body: JSON.stringify(goal)
    });
};

// Update a savings goal
export const updateSavingsGoal = (id, goal) => {
    return apiRequest(`/savings-goals/${id}`, {
        method: "PUT",
        body: JSON.stringify(goal)
    });
};

// Delete a savings goal
export const deleteSavingsGoal = (id) => {
    return apiRequest(`/savings-goals/${id}`, {
        method: "DELETE"
    });
};

// Update user profile
export const updateUserProfile = (profile) => {
    return apiRequest("/users/profile", {
        method: "PUT",
        body: JSON.stringify(profile)
    });
};

export const getUserSettings = () => {
    return apiRequest("/users/settings");
};

export const updateUserSettings = (settings) => {
    return apiRequest("/users/settings", {
        method: "PUT",
        body: JSON.stringify(settings)
    });
};

// Notifications
export const getNotifications = () => {
    return apiRequest("/notifications");
};

export const createNotification = (notification) => {
    return apiRequest("/notifications", {
        method: "POST",
        body: JSON.stringify(notification)
    });
};

export const markNotificationAsRead = (id) => {
    return apiRequest(`/notifications/${id}/read`, {
        method: "PUT"
    });
};

export const markAllNotificationsAsRead = () => {
    return apiRequest("/notifications/read-all", {
        method: "PUT"
    });
};