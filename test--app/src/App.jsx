
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import TransactionModal from "./components/TransactionModal";
import { initialTransactions, mockGoals } from "./mockData";
import SavingsGoals from "./pages/SavingsGoals";

function App() {
    const [activePage, setActivePage] = useState("dashboard");
    const [transactions, setTransactions] = useState(initialTransactions);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

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
        } else {
            const newTransaction = {
                ...transactionData,
                id: `txn_${Date.now()}`
            };

            setTransactions((prev) => [...prev, newTransaction]);
        }

        setIsTransactionModalOpen(false);
        setEditingTransaction(null);
    };

    // Render the selected page
    const renderPage = () => {
        switch (activePage) {
            case "dashboard":
                return (
                    <Dashboard
                        transactions={transactions}
                        onAddTransaction={handleAddTransaction}
                        onNavigate={setActivePage}
                    />
                );

            case "transactions":
                return (
                    <Transactions
                        transactions={transactions}
                        onAddTransaction={handleAddTransaction}
                        onEditTransaction={handleEditTransaction}
                        onDeleteTransaction={handleDeleteTransaction}
                    />
                );

            case "goals":
                return <SavingsGoals />;

            default:
                return <Dashboard
                    transactions={transactions}
                    onAddTransaction={handleAddTransaction}
                    onNavigate={setActivePage}
                />;
        }
    };

    return (
        <div className="app">
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
            />

            <main className="main-content">
                {renderPage()}
            </main>

            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                onSave={handleSaveTransaction}
                initialData={editingTransaction}
            />
        </div>
    );
}

export default App;
