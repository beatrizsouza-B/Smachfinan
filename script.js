// ======================================
// FINANSMART AI
// Sistema de controle financeiro
// ======================================

// Selecionando elementos HTML

const form = document.getElementById("transaction-form");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionList = document.getElementById("transaction-list");

const chart = document.getElementById("finance-chart");
const ctx = chart.getContext("2d");


// ======================================
// ARMAZENAMENTO DOS DADOS
// ======================================

let transactions = JSON.parse(
    localStorage.getItem("finansmart-transactions") || "[]"
);


// ======================================
// FORMATAR VALORES EM REAIS
// ======================================

function formatMoney(value) {

    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


// ======================================
// SALVAR NO NAVEGADOR
// ======================================

function saveTransactions() {

    localStorage.setItem(
        "finansmart-transactions",
        JSON.stringify(transactions)
    );

}


// ======================================
// ADICIONAR MOVIMENTAÇÃO
// ======================================

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const description = descriptionInput.value.trim();

    const amount = Number(amountInput.value);

    const type = typeInput.value;

    const category = categoryInput.value;


    // Verificar dados

    if (!description || !Number.isFinite(amount) || amount <= 0) {

        alert("Preencha os campos corretamente!");

        return;

    }


    // Criar movimentação

    const transaction = {

        id: Date.now() + Math.random(),

        description: description,

        amount: amount,

        type: type,

        category: category,

        date: new Date().toLocaleDateString("pt-BR")

    };


    // Adicionar ao array

    transactions.push(transaction);


    // Salvar e atualizar

    saveTransactions();

    updateDashboard();


    // Limpar formulário

    form.reset();

    descriptionInput.focus();

});


// ======================================
// CALCULAR SALDO E TOTAIS
// ======================================

function calculateTotals() {

    let income = 0;

    let expense = 0;


    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            income += transaction.amount;

        } else {

            expense += transaction.amount;

        }

    });


    const balance = income - expense;


    return {
        income,
        expense,
        balance
    };

}


// ======================================
// ATUALIZAR DASHBOARD
// ======================================

function updateDashboard() {

    const totals = calculateTotals();


    balanceElement.textContent = formatMoney(totals.balance);

    incomeElement.textContent = formatMoney(totals.income);

    expenseElement.textContent = formatMoney(totals.expense);


    // Cor do saldo

    balanceElement.style.color =
        totals.balance >= 0 ? "#53dc9b" : "#ff758d";


    renderTransactions();

    drawChart();

}


// ======================================
// MOSTRAR MOVIMENTAÇÕES
// ======================================

function renderTransactions() {

    transactionList.innerHTML = "";


    if (transactions.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 5;

        cell.textContent = "Nenhuma movimentação cadastrada.";

        row.appendChild(cell);

        transactionList.appendChild(row);

        return;

    }


    // Mostrar primeiro os lançamentos mais recentes

    const recentTransactions = [...transactions].reverse();


    recentTransactions.forEach(function(transaction) {

        const row = document.createElement("tr");


        // Descrição

        const descriptionCell = document.createElement("td");

        descriptionCell.textContent = transaction.description;


        // Categoria

        const categoryCell = document.createElement("td");

        categoryCell.textContent = transaction.category;


        // Tipo

        const typeCell = document.createElement("td");

        typeCell.textContent =
            transaction.type === "income" ? "Receita" : "Despesa";

        typeCell.className = transaction.type;


        // Valor

        const amountCell = document.createElement("td");

        const signal = transaction.type === "income" ? "+" : "-";

        amountCell.textContent =
            signal + " " + formatMoney(transaction.amount);

        amountCell.className = transaction.type;


        // Botão excluir

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Excluir";

        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {

            deleteTransaction(transaction.id);

        });


        actionCell.appendChild(deleteButton);


        // Adicionar células à linha

        row.appendChild(descriptionCell);

        row.appendChild(categoryCell);

        row.appendChild(typeCell);

        row.appendChild(amountCell);

        row.appendChild(actionCell);


        // Adicionar linha à tabela

        transactionList.appendChild(row);

    });

}


// ======================================
// EXCLUIR MOVIMENTAÇÃO
// ======================================

function deleteTransaction(id) {

    const confirmation = confirm(
        "Deseja realmente excluir esta movimentação?"
    );


    if (!confirmation) {

        return;

    }


    transactions = transactions.filter(function(transaction) {

        return transaction.id !== id;

    });


    saveTransactions();

    updateDashboard();

}


// ======================================
// GRÁFICO FINANCEIRO
// ======================================

function drawChart() {

    const totals = calculateTotals();

    const income = totals.income;

    const expense = totals.expense;


    // Ajustar resolução do canvas

    const width = chart.clientWidth;

    const height = 220;

    const ratio = window.devicePixelRatio || 1;

    chart.width = width * ratio;

    chart.height = height * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);


    // Limpar gráfico anterior

    ctx.clearRect(0, 0, width, height);


    // Desenhar linhas de fundo

    ctx.strokeStyle = "#ffffff18";

    ctx.lineWidth = 1;


    for (let i = 1; i <= 3; i++) {

        const y = i * 45;

        ctx.beginPath();

        ctx.moveTo(10, y);

        ctx.lineTo(width - 10, y);

        ctx.stroke();

    }


    const maxValue = Math.max(income, expense, 1);

    const maxBarHeight = 120;


    const incomeHeight = (income / maxValue) * maxBarHeight;

    const expenseHeight = (expense / maxValue) * maxBarHeight;


    const barWidth = Math.min(65, width / 5);


    const incomeX = width * 0.30;

    const expenseX = width * 0.65;

    const baseY = 175;


    // Barra de receitas

    ctx.fillStyle = "#9565f5";

    ctx.fillRect(
        incomeX,
        baseY - incomeHeight,
        barWidth,
        incomeHeight
    );


    // Barra de despesas

    ctx.fillStyle = "#ff758d";

    ctx.fillRect(
        expenseX,
        baseY - expenseHeight,
        barWidth,
        expenseHeight
    );


    // Textos do gráfico

    ctx.fillStyle = "#ffffff";

    ctx.font = "12px Arial";

    ctx.textAlign = "center";


    ctx.fillText("Receitas", incomeX + barWidth / 2, 200);

    ctx.fillText("Despesas", expenseX + barWidth / 2, 200);

}


// ======================================
// ATUALIZAR AO REDIMENSIONAR
// ======================================

window.addEventListener("resize", drawChart);


// ======================================
// INICIAR SISTEMA
// ======================================

updateDashboard();