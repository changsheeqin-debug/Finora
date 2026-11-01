import { useState, useEffect } from "react";

function Settings({ settings, onUpdateSettings, onSaveSettings }) {
    const [formData, setFormData] = useState(settings);
    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        const updatedSettings = {
            ...formData,
            [name]: type === "checkbox" ? checked : value
        };

        setFormData(updatedSettings);
        onUpdateSettings(updatedSettings);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSaveSettings();
    };

    return (
        <div className="page">
            <div className="topbar">
                <div>
                    <div className="crumb">Preferences</div>
                    <h1>Settings</h1>
                    <p className="subtitle">
                        Manage your Finora preferences.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="settings-section card">
                    <div className="settings-section-heading">
                        <div className="settings-icon">⚙</div>
                        <div>
                            <h2>General</h2>
                            <p>Customize how Finora works for you.</p>
                        </div>
                    </div>

                    <div className="settings-field">
                        <div>
                            <strong>Default currency</strong>
                            <p>Choose the currency used throughout Finora.</p>
                        </div>

                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                        >
                            <option value="MYR">MYR (RM)</option>
                            <option value="USD">USD ($)</option>
                            <option value="SGD">SGD (S$)</option>
                        </select>
                    </div>
                </div>

                <div className="settings-section card">
                    <div className="settings-section-heading">
                        <div className="settings-icon">🎨</div>
                        <div>
                            <h2>Appearance</h2>
                            <p>Customise how Finora looks on your device.</p>
                        </div>
                    </div>

                    <div className="settings-field">
                        <div>
                            <strong>Theme</strong>
                            <p>Choose your preferred appearance.</p>
                        </div>

                        <div className="theme-toggle">
                            <button
                                type="button"
                                className={formData.theme === "light" ? "active" : ""}
                                onClick={() => {
                                    const updatedSettings = {
                                        ...formData,
                                        theme: "light"
                                    };

                                    setFormData(updatedSettings);
                                    onUpdateSettings(updatedSettings);
                                }}
                            >
                                ☀️ Light
                            </button>

                            <button
                                type="button"
                                className={formData.theme === "dark" ? "active" : ""}
                                onClick={() => {
                                    const updatedSettings = {
                                        ...formData,
                                        theme: "dark"
                                    };

                                    setFormData(updatedSettings);
                                    onUpdateSettings(updatedSettings);
                                }}
                            >
                                🌙 Dark
                            </button>
                        </div>
                    </div>
                </div>

                <div className="settings-section card">
                    <div className="settings-section-heading">
                        <div className="settings-icon">🔔</div>
                        <div>
                            <h2>Notifications</h2>
                            <p>Choose which updates you want to receive.</p>
                        </div>
                    </div>

                    <div className="settings-field">
                        <div>
                            <strong>Transaction notifications</strong>
                            <p>Receive updates when transactions are added.</p>
                        </div>
                        <input
                            type="checkbox"
                            name="transactionNotifications"
                            checked={formData.transactionNotifications}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="settings-field">
                        <div>
                            <strong>Savings goal reminders</strong>
                            <p>Get reminders about your savings goals and progress.</p>
                        </div>
                        <input
                            type="checkbox"
                            name="goalReminders"
                            checked={formData.goalReminders}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="settings-field">
                        <div>
                            <strong>Monthly summary</strong>
                            <p>Get a monthly overview of your income, expenses and savings.</p>
                        </div>
                        <input
                            type="checkbox"
                            name="monthlySummary"
                            checked={formData.monthlySummary}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="settings-actions">
                    <button type="submit" className="btn primary">
                        Save changes
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Settings;