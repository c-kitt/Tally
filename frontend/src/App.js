import React, { useState } from 'react';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

function App() {
  const [isSetup, setIsSetup] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentBudget, setCurrentBudget] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [setupData, setSetupData] = useState({
    name: '',
    budget: ''
  });
  const [budgetAllocations, setBudgetAllocations] = useState({
    Food: 25,
    Transport: 15,
    Entertainment: 10,
    Shopping: 20,
    Bills: 25,
    Other: 5
  });

  const balance = currentBudget + transactions.reduce((sum, t) => sum + t.amount, 0);
  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount) return;

    const newTransaction = {
      id: Date.now(),
      amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      date: formData.date
    };

    setTransactions([newTransaction, ...transactions]);
    setFormData({
      amount: '',
      type: 'expense',
      category: 'Food',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };


  const handleSetup = (e) => {
    e.preventDefault();
    if (!setupData.name || !setupData.budget) return;

    setUserName(setupData.name);
    setCurrentBudget(parseFloat(setupData.budget));
    setIsSetup(true);
  };

  const handleAllocationChange = (category, value) => {
    const newValue = parseInt(value);
    const currentTotal = Object.values(budgetAllocations).reduce((sum, val) => sum + val, 0);
    const currentCategoryValue = budgetAllocations[category];
    const newTotal = currentTotal - currentCategoryValue + newValue;

    if (newTotal <= 100) {
      setBudgetAllocations({
        ...budgetAllocations,
        [category]: newValue
      });
    }
  };

  const categoryColors = {
    Food: '#ef4444',
    Transport: '#3b82f6',
    Entertainment: '#10b981',
    Shopping: '#f59e0b',
    Bills: '#8b5cf6',
    Other: '#6b7280'
  };

  const createPieChart = () => {
    const radius = 90;
    const centerX = 100;
    const centerY = 100;
    let currentAngle = -90;

    const slices = [];

    EXPENSE_CATEGORIES.forEach(category => {
      const percentage = budgetAllocations[category];
      if (percentage === 0) return;

      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      if (percentage === 100) {
        slices.push({
          category,
          pathData: `M ${centerX} ${centerY} m -${radius} 0 a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 -${radius * 2} 0`,
          color: categoryColors[category],
          percentage
        });
        return;
      }

      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      slices.push({
        category,
        pathData,
        color: categoryColors[category],
        percentage
      });

      currentAngle = endAngle;
    });

    return (
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="#374151"
          stroke="white"
          strokeWidth="2"
        />
        {slices.map(slice => (
          <path
            key={slice.category}
            d={slice.pathData}
            fill={slice.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
    );
  };

  const getBalanceClass = () => {
    if (balance > 0) return 'positive';
    if (balance < 0) return 'negative';
    return 'zero';
  };

  if (!isSetup) {
    return (
      <div className="auth-form">
        <h1 className="auth-title">Tally</h1>
        <form onSubmit={handleSetup}>
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={setupData.name}
              onChange={(e) => setSetupData({...setupData, name: e.target.value})}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group">
            <label>Current Budget</label>
            <input
              type="number"
              step="0.01"
              value={setupData.budget}
              onChange={(e) => setSetupData({...setupData, budget: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            Get Started
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <div className="main-header">
        <h1 className="title">Hello, {userName}!</h1>
        <div className="budget-info">
          <div className="budget-label">Monthly Budget: ${currentBudget.toFixed(2)}</div>
          <div className={`balance ${getBalanceClass()}`}>
            Amount Remaining: ${balance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="panels-container">
        <div className="left-panel">
          <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({
                    ...formData,
                    type: e.target.value,
                    category: e.target.value === 'expense' ? 'Food' : 'Salary'
                  })}
                />
                Expense
              </label>
              <label>
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({
                    ...formData,
                    type: e.target.value,
                    category: e.target.value === 'expense' ? 'Food' : 'Salary'
                  })}
                />
                Income
              </label>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {(formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <button type="submit" className="add-btn">Add Transaction</button>
        </form>
        </div>

        <div className="middle-panel">
          <h3>Transaction History</h3>
          <div className="transaction-list">
            {transactions.map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <div className={`transaction-dot ${transaction.type}`}></div>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'expense' ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  <div className="transaction-category">{transaction.category}</div>
                  <div className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</div>
                  <div className="transaction-description">"{transaction.description}"</div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteTransaction(transaction.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          <div className="budget-allocation">
            <div className="allocation-section">
              {EXPENSE_CATEGORIES.map(category => (
                <div key={category} className="allocation-item">
                  <label>{category}</label>
                  <input
                    type="range"
                    min="0"
                    max={100 - (Object.values(budgetAllocations).reduce((sum, val) => sum + val, 0) - budgetAllocations[category])}
                    value={budgetAllocations[category]}
                    onChange={(e) => handleAllocationChange(category, e.target.value)}
                    className="slider"
                  />
                  <input
                    type="number"
                    min="0"
                    max={100 - (Object.values(budgetAllocations).reduce((sum, val) => sum + val, 0) - budgetAllocations[category])}
                    value={budgetAllocations[category]}
                    onChange={(e) => handleAllocationChange(category, e.target.value)}
                    className="allocation-input"
                  />
                  <span className="percent-symbol">%</span>
                </div>
              ))}
            </div>
            <div className="pie-chart-container">
              <div className="pie-chart">
                {createPieChart()}
              </div>
              <div className="pie-legend">
                {EXPENSE_CATEGORIES.map(category => (
                  <div key={category} className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: categoryColors[category] }}
                    ></div>
                    <span>{category}: ${((budgetAllocations[category] / 100) * currentBudget).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;