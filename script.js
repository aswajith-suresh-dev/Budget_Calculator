function signUpUser() {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const message = document.getElementById("signupMessage");

  const result = signUp(name, email, password);

  message.textContent = result;
  message.classList.remove("hidden", "text-green-600", "text-red-600");

  if (result === "Registration successful") {
    message.classList.add("text-green-600");

    setTimeout(function () {
      window.location.href = "index.html";
    }, 1000);
  } else {
    message.classList.add("text-red-600");
  }
}

let categories = {
  income: [
    "Salary",
    "Freelance",
    "Business",
    "Investments",
    "Gifts",
    "Other Income",
  ],

  expense: [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Rent",
    "Subscriptions",
    "Other Expense",
  ],
};

let transactions = [];
function addTransaction(type, category, amount, date) {
  const user = getCurrentUser();

  if (!user) {
    console.log("Please sign in first");
    return false;
  }

  if (type !== "income" && type !== "expense") {
    console.log("Invalid transaction type");
    return false;
  }

  if (!categories[type].includes(category)) {
    console.log("Invalid category");
    return false;
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    console.log("Enter a valid amount greater than 0");
    return false;
  }

  if (!date) {
    console.log("Please select a date");
    return false;
  }

  const transaction = {
    id: Date.now(),
    userId: user.id,
    type: type,
    category: category,
    amount: amount,
    date: date,
  };

  transactions.push(transaction);
  saveTransactions();
  updateSummary();

  return true;
}

function getTotalIncome() {
  return transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);
}

function getTotalExpenses() {
  return transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);
}

function getBalance() {
  return getTotalIncome() - getTotalExpenses();
}
function updateSummary() {
  const incomeElement = document.getElementById("totalIncome");
  const expensesElement = document.getElementById("totalExpenses");
  const balanceElement = document.getElementById("netBalance");

  // Run only when the summary cards exist
  if (!incomeElement || !expensesElement || !balanceElement) {
    return;
  }

  incomeElement.textContent = getTotalIncome().toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

  expensesElement.textContent = getTotalExpenses().toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });

  balanceElement.textContent = getBalance().toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}
function renderTransactionHistory() {
  const historyBody = document.getElementById("transactionHistory");
  const emptyHistory = document.getElementById("emptyHistory");

  if (!historyBody || !emptyHistory) return;

  historyBody.innerHTML = "";

  const history = getTransactions()
    .slice()
    .sort((a, b) => {
      return new Date(b.date) - new Date(a.date) || b.id - a.id;
    });

  if (history.length === 0) {
    emptyHistory.classList.remove("hidden");
    return;
  }

  emptyHistory.classList.add("hidden");

  history.forEach((transaction) => {
    const row = document.createElement("tr");

    row.className = "border-b border-slate-100 text-sm text-slate-700";

    const formattedDate = new Date(
      transaction.date + "T00:00:00",
    ).toLocaleDateString("en-IN");

    const formattedAmount = transaction.amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });

    row.innerHTML = `
        <td class="px-4 py-4">${formattedDate}</td>
        <td class="px-4 py-4">${transaction.category}</td>
        <td class="px-4 py-4">
            <span class="${
              transaction.type === "income"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            } rounded-full px-3 py-1 text-xs font-medium">
                ${transaction.type === "income" ? "Income" : "Expense"}
            </span>
        </td>
        <td class="px-4 py-4 text-right font-medium ${
          transaction.type === "income" ? "text-green-600" : "text-red-600"
        }">
            ${transaction.type === "expense" ? "-" : "+"}${formattedAmount}
        </td>
        <td class="px-4 py-4 text-center whitespace-nowrap">
            <button
                type="button"
                data-action="edit"
                data-id="${transaction.id}"
                class="mr-2 font-medium text-blue-600 hover:text-blue-800">
                Edit
            </button>

            <button
                type="button"
                data-action="delete"
                data-id="${transaction.id}"
                class="font-medium text-red-600 hover:text-red-800">
                Delete
            </button>
        </td>
    `;

    historyBody.appendChild(row);
  });
}
const historyBody = document.getElementById("transactionHistory");

if (historyBody) {
  historyBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "delete") {
      const confirmed = confirm(
        "Are you sure you want to delete this transaction?",
      );

      if (!confirmed) return;

      deleteTransaction(id);
      renderTransactionHistory();
    }

    if (action === "edit") {
      const transaction = getTransactions().find((item) => item.id === id);

      if (!transaction) return;

      const newAmountText = prompt(
        "Enter the new amount:",
        String(transaction.amount),
      );

      if (newAmountText === null) return;

      const amountText = newAmountText.trim();

      if (!/^\d+(\.\d{1,2})?$/.test(amountText) || Number(amountText) <= 0) {
        alert(
          "Please enter a valid amount greater than zero, with up to two decimal places.",
        );
        return;
      }

      const newAmount = Number(amountText);

      editTransaction(id, { amount: newAmount });

      renderTransactionHistory();
    }
  });
}

function getTransactions() {
  return transactions;
}

console.log(getTransactions());

function deleteTransaction(id) {
  const user = getCurrentUser();

  if (!user) return;

  transactions = transactions.filter(
    (item) => !(item.id === id && item.userId === user.id),
  );
  updateSummary();
  saveTransactions();
}

function editTransaction(id, updatedData) {
  const user = getCurrentUser();

  if (!user) return;

  transactions = transactions.map((item) =>
    item.id === id && item.userId === user.id
      ? { ...item, ...updatedData }
      : item,
  );
  updateSummary();
  saveTransactions();
}
function saveTransactions() {
  const user = getCurrentUser();

  if (!user) return;

  const allTransactions =
    JSON.parse(localStorage.getItem("walletTransactions")) || [];

  const otherUsersTransactions = allTransactions.filter(
    (item) => item.userId !== user.id,
  );

  localStorage.setItem(
    "walletTransactions",
    JSON.stringify([...otherUsersTransactions, ...transactions]),
  );
}
// sign up
function signUp(name, email, password) {
  name = name.trim();
  email = email.trim().toLowerCase();

  if (!name || !email || !password ) {
    return "All fields are required";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  

  let users = JSON.parse(localStorage.getItem("walletUsers")) || [];

  if (users.some((user) => user.email === email)) {
    return "Email is already registered";
  }

  const user = {
    id: crypto.randomUUID(),
    name: name,
    email: email,
    password: password,
  };

  users.push(user);
  localStorage.setItem("walletUsers", JSON.stringify(users));

  return "Registration successful";
}

// sign in
function signIn(email, password) {
  email = email.trim().toLowerCase();

  if (!email || !password) {
    return "Email and password are required";
  }

  let users = JSON.parse(localStorage.getItem("walletUsers")) || [];

  let user = users.find(
    (user) => user.email === email && user.password === password,
  );

  if (!user) {
    return "Invalid email or password";
  }
  localStorage.setItem("currentUser", user.id);
  loadUserTransactions();

  return "Login successful";
}
function logout() {
  localStorage.removeItem("currentUser");
  console.log("Logged out successfully");
}

function getCurrentUser() {
  const userId = localStorage.getItem("currentUser");

  if (!userId) {
    return null;
  }

  const users = JSON.parse(localStorage.getItem("walletUsers")) || [];

  return users.find((user) => user.id === userId) || null;
}

function loadUserTransactions() {
  const user = getCurrentUser();

  if (!user) {
    transactions = [];
    return;
  }

  const allTransactions =
    JSON.parse(localStorage.getItem("walletTransactions")) || [];

  transactions = allTransactions.filter((item) => item.userId === user.id);
}

const transactionTypeInput = document.getElementById("transactionType");
const transactionCategoryInput = document.getElementById("transactionCategory");
const transactionAmountInput = document.getElementById("transactionAmount");
const transactionDateInput = document.getElementById("transactionDate");
const addTransactionBtn = document.getElementById("addTransactionBtn");
const transactionMessage = document.getElementById("transactionMessage");

// Run only on the dashboard page
if (
  transactionTypeInput &&
  transactionCategoryInput &&
  transactionAmountInput &&
  transactionDateInput &&
  addTransactionBtn &&
  transactionMessage
) {
function getTodayDate() {
    const today = new Date();

    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    if (month < 10) {
        month = "0" + month;
    }

    if (day < 10) {
        day = "0" + day;
    }

    return year + "-" + month + "-" + day;
}


  transactionDateInput.value = getTodayDate();

  function updateCategoryOptions() {
    const type = transactionTypeInput.value;

    transactionCategoryInput.innerHTML = "";

    categories[type].forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;

      transactionCategoryInput.appendChild(option);
    });
  }

  updateCategoryOptions();

  transactionTypeInput.addEventListener("change", updateCategoryOptions);

  // Add transaction
  addTransactionBtn.addEventListener("click", () => {
    const type = transactionTypeInput.value;
    const category = transactionCategoryInput.value;
    const amountText = transactionAmountInput.value.trim();

    const isValidAmount = /^\d+(\.\d{1,2})?$/.test(amountText);

    const amount = isValidAmount ? Number(amountText) : NaN;
    const date = transactionDateInput.value;

    const success = addTransaction(type, category, amount, date);

    transactionMessage.classList.remove(
      "hidden",
      "text-green-600",
      "text-red-600",
    );

    if (success) {
      transactionMessage.textContent = "Transaction added successfully!";
      transactionMessage.classList.add("text-green-600");

      transactionAmountInput.value = "";

      renderTransactionHistory();
    } else {
      transactionMessage.textContent =
        "Unable to add transaction. Check your inputs and make sure you're signed in.";

      transactionMessage.classList.add("text-red-600");
    }
  });
}
function handleSignIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  const result = signIn(email, password);

  message.textContent = result;
  message.classList.remove("hidden", "text-green-600", "text-red-600");

  if (result === "Login successful") {
    message.classList.add("text-green-600");

    setTimeout(function () {
      window.location.href = "dashboard.html";
    }, 500);
  } else {
    message.classList.add("text-red-600");
  }
}

if (document.getElementById("totalIncome")) {
  loadUserTransactions();
  updateSummary();
  renderTransactionHistory();
}

function handleLogout() {
  const confirmed = confirm("Are you sure you want to log out?");

  if (!confirmed) {
    return;
  }

  logout();

  window.location.href = "index.html";
}
