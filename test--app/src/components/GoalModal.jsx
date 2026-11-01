import { useEffect, useState } from "react";

function GoalModal({ isOpen, onClose, onSave, initialData }) {
    const [formData, setFormData] = useState({
        name: "",
        targetAmount: "",
        currentSaved: "",
        targetDate: ""
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    targetAmount: initialData.targetAmount,
                    currentSaved: initialData.currentSaved,
                    targetDate: initialData.targetDate
                        ? initialData.targetDate.slice(0, 10)
                        : ""
                });
            } else {
                setFormData({
                    name: "",
                    targetAmount: "",
                    currentSaved: "0",
                    targetDate: ""
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onSave({
            name: formData.name.trim(),
            targetAmount: Number(formData.targetAmount),
            currentSaved: Number(formData.currentSaved),
            targetDate: formData.targetDate
                ? `${formData.targetDate}T23:59:59`
                : ""
        });
    };

    return (
    <div className="modal-backdrop open" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
                <div>
                    <h2>{initialData ? "Edit savings goal" : "New savings goal"}</h2>
                    <p className="subtitle">Set a target and track your progress.</p>
                </div>

                <button className="icon-btn" type="button" onClick={onClose}>
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="field full">
                        <label>Goal name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Emergency Fund"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Target amount (RM)</label>
                        <input
                            type="number"
                            name="targetAmount"
                            value={formData.targetAmount}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Amount saved (RM)</label>
                        <input
                            type="number"
                            name="currentSaved"
                            value={formData.currentSaved}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="field full">
                        <label>Target date</label>
                        <input
                            type="date"
                            name="targetDate"
                            value={formData.targetDate}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn" onClick={onClose}>
                        Cancel
                    </button>

                    <button type="submit" className="btn primary">
                        {initialData ? "Save changes" : "Create goal"}
                    </button>
                </div>
            </form>
        </div>
    </div>
    );
}

export default GoalModal;