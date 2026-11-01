
import { useEffect, useState } from "react";

function UserProfile({
    user,
    profileDraft,
    onUpdateProfileDraft,
    onUpdateUser,
    onUnsavedChange,
    onRequestDiscard
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [savedMessage, setSavedMessage] = useState("");

    const hasUnsavedChanges =
        JSON.stringify(profileDraft) !== JSON.stringify(user);

    useEffect(() => {
        onUnsavedChange(hasUnsavedChanges);
    }, [hasUnsavedChanges, onUnsavedChange]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        onUpdateProfileDraft((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();

        onUpdateUser({ ...profileDraft });
        onUpdateProfileDraft({ ...profileDraft });
        onUnsavedChange(false);
        setIsEditing(false);
        setSavedMessage("Profile updated successfully.");

        setTimeout(() => {
            setSavedMessage("");
        }, 3000);
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            onRequestDiscard();
        } else {
            setIsEditing(false);
        }
    };

    const getInitials = (name) => {
        return name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    return (
        <div className="page">
            <div className="topbar">
                <div>
                    <div className="crumb">Account</div>
                    <h1>My Profile</h1>
                    <p className="subtitle">
                        Manage your personal information.
                    </p>
                </div>

                {!isEditing && (
                    <button
                        className="btn primary"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {savedMessage && (
                <div className="profile-success">
                    {savedMessage}
                </div>
            )}

            <div className="profile-card card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {getInitials(user.name || "User")}
                    </div>

                    <div className="profile-header-info">
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                        <span className="profile-label">
                            Personal Account
                        </span>
                    </div>
                </div>

                <div className="profile-divider"></div>

                <form onSubmit={handleSave}>
                    <div className="profile-section-heading">
                        <h3>Personal Information</h3>
                        <p>
                            Your personal details and contact information.
                        </p>
                    </div>

                    <div className="profile-form-grid">
                        <div className="profile-field">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={profileDraft.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={profileDraft.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={profileDraft.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="occupation">Occupation</label>
                            <input
                                id="occupation"
                                type="text"
                                name="occupation"
                                value={profileDraft.occupation}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Enter your occupation"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="profile-actions">
                            <button
                                type="button"
                                className="btn secondary"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn primary"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default UserProfile;
