import { toast } from "react-toastify";

export const showSuccessToast = (message) => {
    toast.success(message, {
        className: "finora-success-toast",
        icon: "✓",
        autoClose: 3000
    });
};

export const showErrorToast = (message) => {
    toast.error(message || "Something went wrong. Please try again.", {
        autoClose: 3000
    });
};