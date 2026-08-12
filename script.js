const STORAGE_KEY = "itens-para-materializar";


/* ELEMENTOS DO HTML */

const form =
  document.querySelector("#itemForm");

const nameInput =
  document.querySelector("#itemName");

const priceInput =
  document.querySelector("#itemPrice");

const savedInput =
  document.querySelector("#itemSaved");


const pendingList =
  document.querySelector("#pendingList");

const acquiredList =
  document.querySelector("#acquiredList");


const pendingSection =
  document.querySelector("#pendingSection");

const acquiredSection =
  document.querySelector("#acquiredSection");

const emptyState =
  document.querySelector("#emptyState");


const pendingCount =
  document.querySelector("#pendingCount");

const acquiredCount =
  document.querySelector("#acquiredCount");


const pendingBadge =
  document.querySelector("#pendingBadge");

const acquiredBadge =
  document.querySelector("#acquiredBadge");


const savedTotal =
  document.querySelector("#savedTotal");

const missingTotal =
  document.querySelector("#missingTotal");


const progressText =
  document.querySelector("#progressText");

const progressBar =
  document.querySelector("#progressBar");


const clearBtn =
  document.querySelector("#clearBtn");


/* RECUPERA OS ITENS DO LOCAL STORAGE */

let items =
  JSON.parse(
    localStorage.getItem(STORAGE_KEY)
  ) || [];


/* FORMATA VALORES COMO REAIS */

const money = value => {

  return Number(value).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

};


/* FORMATA DATA */

const dateLabel = date => {

  return new Date(date).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

};


/* SALVA OS DADOS */

function save() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items)
  );

}


/* CALCULA QUANTO FALTA */

function missing(item) {

  return Math.max(
    Number(item.price) -
    Number(item.saved),

    0
  );

}


/* CALCULA PORCENTAGEM DO ITEM */

function itemProgress(item) {

  if (Number(item.price) <= 0) {

    return 0;

  }

  return Math.min(

    (
      Number(item.saved) /
      Number(item.price)
    ) * 100,

    100

  );

}


/* RENDERIZA A INTERFACE */

function render() {

  pendingList.innerHTML = "";

  acquiredList.innerHTML = "";


  /* SEPARA OS ITENS */

  const pending =
    items.filter(
      item => !item.acquired
    );


  const acquired =
    items.filter(
      item => item.acquired
    );


  /* TOTAL DO VALOR DOS ITENS */

  const totalPrice =
    items.reduce(
      (sum, item) =>
        sum + Number(item.price),

      0
    );


  /* TOTAL JÁ GUARDADO */

  const totalSaved =
    items.reduce(
      (sum, item) =>
        sum + Number(item.saved),

      0
    );


  /* TOTAL QUE AINDA FALTA */

  const totalMissing =
    items.reduce(
      (sum, item) =>
        sum + missing(item),

      0
    );


  /* PROGRESSO GERAL */

  const overall =
    totalPrice
      ? Math.min(
          (totalSaved / totalPrice) * 100,
          100
        )
      : 0;


  /* CRIA OS CARDS */

  pending.forEach(item => {

    pendingList.appendChild(
      createItem(item)
    );

  });


  acquired.forEach(item => {

    acquiredList.appendChild(
      createItem(item)
    );

  });


  /* ATUALIZA CONTADORES */

  pendingCount.textContent =
    pending.length;

  acquiredCount.textContent =
    acquired.length;


  pendingBadge.textContent =
    pending.length;

  acquiredBadge.textContent =
    acquired.length;


  /* ATUALIZA FINANCEIRO */

  savedTotal.textContent =
    money(totalSaved);

  missingTotal.textContent =
    money(totalMissing);


  /* ATUALIZA PROGRESSO */

  progressText.textContent =
    `${Math.round(overall)}%`;

  progressBar.style.width =
    `${overall}%`;


  /* ESCONDE SEÇÕES VAZIAS */

  pendingSection.hidden =
    pending.length === 0;

  acquiredSection.hidden =
    acquired.length === 0;


  emptyState.hidden =
    items.length !== 0;

}


/* CRIA O CARD DE CADA ITEM */

function createItem(item) {

  const article =
    document.createElement("article");


  const progress =
    itemProgress(item);


  const missingValue =
    missing(item);


  const enough =
    missingValue <= 0;


  article.className =
    `item ${
      item.justAcquired
        ? "flash"
        : ""
    }`;


  article.innerHTML = `

    <div class="item-top">


      <div class="item-main">

        <div class="item-icon">

          <i class="${
            item.acquired
              ? "icon-circle-check"
              : "icon-package"
          }"></i>

        </div>


        <div>

          <div class="item-name"></div>

          <div class="item-date">

            ${
              item.acquired

                ? `adquirido em
                   ${dateLabel(item.acquiredAt)}`

                : `adicionado em
                   ${dateLabel(item.createdAt)}`
            }

          </div>

        </div>

      </div>


      <div class="price">

        ${money(item.price)}

      </div>


      <div class="actions">


        <button class="status-btn">

          <i class="${
            item.acquired
              ? "icon-rotate-ccw"
              : "icon-check"
          }"></i>

          ${
            item.acquired
              ? "Para comprar"
              : "Adquirido"
          }

        </button>


        <button
          class="delete-btn"
          title="Excluir item"
        >

          <i class="icon-trash-2"></i>

        </button>


      </div>

    </div>


    <!-- PARTE FINANCEIRA -->

    <div class="item-finance">


      <div class="finance-values">

        <span>

          Guardado:

          <strong>
            ${money(item.saved)}
          </strong>

        </span>


        <span class="missing">

          ${
            enough

              ? "Valor alcançado!"

              : `Falta:
                 ${money(missingValue)}`
          }

        </span>

      </div>


      <!-- BARRA DE PROGRESSO -->

      <div
        class="
          money-progress
          ${enough ? "complete" : ""}
        "
      >

        <div
          style="width: ${progress}%"
        ></div>

      </div>


      <!-- MENSAGEM QUANDO JÁ TEM O VALOR -->

      ${
        enough && !item.acquired

          ? `

            <div class="enough">

              <i class="icon-circle-check"></i>

              Você já tem o suficiente
              para comprar este item.

            </div>

          `

          : ""
      }


      <!-- ADICIONAR MAIS DINHEIRO -->

      ${
        !item.acquired

          ? `

            <div class="save-money">

              <input
                class="money-input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Quanto quer guardar?"
              >


              <button
                class="save-btn"
                type="button"
              >

                <i class="icon-plus"></i>

                Guardar

              </button>

            </div>

          `

          : ""
      }


    </div>

  `;


  /* COLOCA O NOME COM TEXTCONTENT */

  article.querySelector(
    ".item-name"
  ).textContent =
    item.name;


  /* BOTÃO ADQUIRIDO */

  article
    .querySelector(".status-btn")
    .addEventListener(
      "click",
      () => {

        item.acquired =
          !item.acquired;


        if (item.acquired) {

          item.acquiredAt =
            new Date().toISOString();

        } else {

          item.acquiredAt =
            null;

        }


        item.justAcquired =
          item.acquired;


        save();

        render();


        /* REMOVE A ANIMAÇÃO DEPOIS */

        if (item.justAcquired) {

          setTimeout(
            () => {

              item.justAcquired =
                false;

              save();

              render();

            },

            2800
          );

        }

      }
    );


  /* BOTÃO EXCLUIR */

  article
    .querySelector(".delete-btn")
    .addEventListener(
      "click",
      () => {

        items =
          items.filter(
            current =>
              current.id !== item.id
          );


        save();

        render();

      }
    );


  /* BOTÃO GUARDAR */

  const saveBtn =
    article.querySelector(
      ".save-btn"
    );


  if (saveBtn) {

    const input =
      article.querySelector(
        ".money-input"
      );


    function addMoney() {

      const amount =
        Number(input.value);


      /* NÃO ACEITA ZERO OU NEGATIVO */

      if (
        !amount ||
        amount <= 0
      ) {

        return;

      }


      /*
        SOMA O NOVO VALOR
        AO QUE JÁ ESTAVA GUARDADO
      */

      item.saved =
        Number(item.saved) +
        amount;


      /*
        NÃO DEIXA PASSAR
        DO VALOR DO ITEM
      */

      if (
        item.saved >
        item.price
      ) {

        item.saved =
          item.price;

      }


      save();

      render();

    }


    saveBtn.addEventListener(
      "click",
      addMoney
    );


    /* ENTER TAMBÉM ADICIONA */

    input.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter"
        ) {

          addMoney();

        }

      }
    );

  }


  return article;

}


/* ADICIONAR NOVO ITEM */

form.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const name =
      nameInput.value.trim();


    const price =
      Number(
        priceInput.value
      );


    const saved =
      Number(
        savedInput.value
      ) || 0;


    if (
      !name ||
      !price ||
      price <= 0
    ) {

      return;

    }


    const newItem = {

      id:
        crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,

      name,

      price,

      /*
        CASO A PESSOA DIGITE
        MAIS DO QUE O VALOR DO ITEM,
        GUARDAMOS SOMENTE O VALOR DO ITEM.
      */

      saved:
        Math.min(
          saved,
          price
        ),

      createdAt:
        new Date().toISOString(),

      acquired:
        false,

      acquiredAt:
        null,

      justAcquired:
        false

    };


    items.unshift(
      newItem
    );


    save();

    render();


    /* LIMPA FORMULÁRIO */

    form.reset();

    savedInput.value = 0;

    nameInput.focus();

  }
);


/* LIMPAR TUDO */

clearBtn.addEventListener(
  "click",
  () => {

    if (
      items.length &&
      confirm(
        "Tem certeza que deseja apagar todos os itens?"
      )
    ) {

      items = [];

      save();

      render();

    }

  }
);


/* PRIMEIRA RENDERIZAÇÃO */

render();