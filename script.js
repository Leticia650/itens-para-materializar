const STORAGE_KEY = "itens-para-materializar";

const form = document.querySelector("#itemForm");
const nameInput = document.querySelector("#itemName");
const priceInput = document.querySelector("#itemPrice");
const pendingList = document.querySelector("#pendingList");
const acquiredList = document.querySelector("#acquiredList");
const pendingSection = document.querySelector("#pendingSection");
const acquiredSection = document.querySelector("#acquiredSection");
const emptyState = document.querySelector("#emptyState");
const pendingCount = document.querySelector("#pendingCount");
const acquiredCount = document.querySelector("#acquiredCount");
const pendingBadge = document.querySelector("#pendingBadge");
const acquiredBadge = document.querySelector("#acquiredBadge");
const totalValue = document.querySelector("#totalValue");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const clearBtn = document.querySelector("#clearBtn");

let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const money = value => Number(value).toLocaleString("pt-BR", {
  style: "currency", currency: "BRL"
});

const dateLabel = date => new Date(date).toLocaleDateString("pt-BR", {
  day: "2-digit", month: "2-digit", year: "numeric"
});

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function render() {
  pendingList.innerHTML = "";
  acquiredList.innerHTML = "";

  const pending = items.filter(item => !item.acquired);
  const acquired = items.filter(item => item.acquired);
  const total = items.reduce((sum, item) => sum + Number(item.price), 0);
  const percent = items.length ? Math.round((acquired.length / items.length) * 100) : 0;

  pending.forEach(item => pendingList.appendChild(createItem(item)));
  acquired.forEach(item => acquiredList.appendChild(createItem(item)));

  pendingCount.textContent = pending.length;
  acquiredCount.textContent = acquired.length;
  pendingBadge.textContent = pending.length;
  acquiredBadge.textContent = acquired.length;
  totalValue.textContent = money(total);
  progressText.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;

  pendingSection.hidden = pending.length === 0;
  acquiredSection.hidden = acquired.length === 0;
  emptyState.hidden = items.length !== 0;
}

function createItem(item) {
  const article = document.createElement("article");
  article.className = `item ${item.justAcquired ? "flash" : ""}`;

  article.innerHTML = `
    <div class="item-main">
      <div class="item-icon"><i class="${item.acquired ? "icon-circle-check" : "icon-package"}"></i></div>
      <div>
        <div class="item-name"></div>
        <div class="item-date">${item.acquired ? `adquirido em ${dateLabel(item.acquiredAt)}` : `adicionado em ${dateLabel(item.createdAt)}`}</div>
      </div>
    </div>
    <div class="price">${money(item.price)}</div>
    <div class="actions">
      <button class="status-btn" title="${item.acquired ? "Voltar para itens a comprar" : "Marcar como adquirido"}">
        <i class="${item.acquired ? "icon-rotate-ccw" : "icon-check"}"></i>
        ${item.acquired ? "Para comprar" : "Adquirido"}
      </button>
      <button class="delete-btn" title="Excluir item"><i class="icon-trash-2"></i></button>
    </div>
  `;

  article.querySelector(".item-name").textContent = item.name;

  article.querySelector(".status-btn").addEventListener("click", () => {
    item.acquired = !item.acquired;
    if (item.acquired) item.acquiredAt = new Date().toISOString();
    item.justAcquired = item.acquired;
    save();
    render();
    if (item.justAcquired) {
      setTimeout(() => {
        item.justAcquired = false;
        save();
        render();
      }, 2800);
    }
  });

  article.querySelector(".delete-btn").addEventListener("click", () => {
    items = items.filter(current => current.id !== item.id);
    save();
    render();
  });

  return article;
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const item = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    name: nameInput.value.trim(),
    price: Number(priceInput.value),
    createdAt: new Date().toISOString(),
    acquired: false,
    acquiredAt: null,
    justAcquired: false
  };

  if (!item.name || Number.isNaN(item.price)) return;

  items.unshift(item);
  save();
  render();
  form.reset();
  nameInput.focus();
});

clearBtn.addEventListener("click", () => {
  if (!items.length) return;
  if (confirm("Tem certeza que deseja apagar todos os itens?")) {
    items = [];
    save();
    render();
  }
});

render();