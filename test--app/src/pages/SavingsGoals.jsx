function SavingsGoals(){
 return(
    <section className="page" id="goals">
     <div className="topbar"><div><div className="crumb">Workspace / Planning</div><h1>Savings goals</h1><div className="subtitle">Small steps today, bigger milestones tomorrow.</div></div><div className="actions"><button className="btn primary" id="addGoal">＋ New goal<span></span></button></div></div>
     <div className="grid stats">
      <div className="card"><div className="stat-head">Total saved</div><div className="stat-value" id="goalTotal">RM 2,400.00</div><div className="stat-foot">Across all active goals</div></div>
      <div className="card"><div className="stat-head">Active goals</div><div className="stat-value" id="goalActive">2</div><div className="stat-foot">You're building good habits</div></div>
      <div className="card"><div className="stat-head">Remaining to target</div><div className="stat-value" id="goalRemaining">RM 5,600.00</div><div className="stat-foot">Across active goals</div></div>
     </div>
    <div className="grid goal-grid" id="goalCards"></div>
    </section>
 );
}

export default SavingsGoals;