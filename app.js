let tg = window.Telegram.WebApp;

tg.expand();

tg.MainButton.textColor = "#FFFFFF";
tg.MainButton.color = "#2cab37";

let order = {};

// console.log(tg);

const items = document.querySelectorAll(".item");
const orderButtons = document.querySelectorAll(".order-btn");
const manageCountBlocks = document.querySelectorAll(".item-manage-count");

const cartCount = document.querySelector(".cart-count");
const cartButton = document.querySelector(".cart-button");

orderButtons.forEach((button, i) => {
  button.addEventListener("click", () => {
    const parent = items[i];

    const dishId = parent.dataset.id;
    const dishName = parent.dataset.name;
    const dishPrice = parent.dataset.price;
    const dishImg = parent.dataset.img;

    order[dishId] = {
      id: dishId,
      name: dishName,
      count: 1,
      price: dishPrice,
      img: dishImg,
    };

    button.style.display = "none";
    manageCountBlocks[i].style.display = "flex";
    manageCountBlocks[i].querySelector(".item-count").innerText = 1;

    countForCart(cartCount);
    saveOrderToLS();

    tg.MainButton.setText("Перейти в корзину");
    tg.MainButton.show();
  });
});

manageCountBlocks.forEach((block, i) => {
  const minusButton = block.querySelector(".button-dec");
  const plusButton = block.querySelector(".button-inc");
  const count = block.querySelector(".item-count");

  const parent = items[i];

  const dishId = parent.dataset.id;

  minusButton.addEventListener("click", () => {
    const dishesCount = Math.max(0, (+count.innerText || 0) - 1);

    count.innerText = dishesCount;
    order[dishId].count = dishesCount;
    if (dishesCount === 0) {
      block.style.display = "none";
      orderButtons[i].style.display = "block";

      delete order[dishId];
    }

    countForCart(cartCount);
    saveOrderToLS();

    if (Object.values(order).every((dish) => dish.count === 0)) {
      tg.MainButton.hide();
    }
  });

  plusButton.addEventListener("click", () => {
    const dishesCount = (+count.innerText || 0) + 1;

    count.innerText = dishesCount;

    order[dishId].count = dishesCount;

    countForCart(cartCount);
    saveOrderToLS();
  });
});

cartButton.addEventListener("click", () => {
  console.log(JSON.stringify(order));
  executeCart();
});

function countForCart(container) {
  container.innerText = Object.values(order).reduce(
    (acc, cur) => acc + cur.count,
    0
  );
}

function saveOrderToLS() {
  localStorage.setItem("restoraunt_order", JSON.stringify(order));
}

function loadCartFromLS() {
  return localStorage.getItem("restoraunt_order");
}

function updateTgButtonText() {
  const totalPrice = Object.values(order || {}).reduce(
    (acc, cur) => acc + cur.price * cur.count,
    0
  );
  tg.MainButton.setText(`Заказать на сумму ${totalPrice} ₽`);
}

function openCartCallback() {
  console.log(JSON.stringify(order));
  executeCart();
  // tg.sendData(JSON.stringify(order));
  // Telegram.WebApp.openTelegramLink("cart.html");
}

function makeOrderCallback(order) {
  console.log(JSON.stringify(order));
  tg.sendData(JSON.stringify(order));
  tg.close();
}

Telegram.WebApp.onEvent("mainButtonClicked", openCartCallback);

function executeCart() {
  let tg = window.Telegram.WebApp;

  Telegram.WebApp.offEvent("mainButtonClicked", openCartCallback);

  tg.expand();

  tg.MainButton.textColor = "#FFFFFF";
  tg.MainButton.color = "#2cab37";

  tg.MainButton.show();

  // let order = JSON.parse(loadCartFromLS() || "{}");

  updateTgButtonText();

  function closeCart() {
    container.classList.remove("cart-container_open");
    Telegram.WebApp.offEvent("mainButtonClicked", makeOrderCallback);
  }

  const container = document.querySelector(".cart-container");
  container.innerHTML = "";
  Object.values(order || {}).forEach((dish) => {
    if (dish.count === 0) {
      return;
    }

    const item = document.createElement("div");
    item.classList.add("cart-item");

    const itemImg = document.createElement("img");
    itemImg.classList.add("cart-item-img");
    itemImg.src = dish.img;
    itemImg.alt = dish.name;

    const itemMainBlock = document.createElement("div");
    itemMainBlock.classList.add("cart-item-main");

    const itemInfoBlock = document.createElement("div");
    itemInfoBlock.classList.add("cart-item-info");
    const itemName = document.createElement("span");
    itemName.classList.add("cart-item-name");
    itemName.innerText = dish.name;
    const itemPrice = document.createElement("span");
    itemPrice.innerText = dish.price * dish.count + " ₽";
    itemPrice.classList.add("cart-item-price");
    itemInfoBlock.append(itemName, itemPrice);

    const itemActionsBlock = document.createElement("div");
    itemActionsBlock.classList.add("cart-item-actions");
    const dishCount = document.createElement("span");
    dishCount.innerText = dish.count;
    dishCount.classList.add("cart-item-count");
    const buttonDec = document.createElement("button");
    buttonDec.innerText = "-";
    buttonDec.classList.add("button-dec");
    buttonDec.addEventListener("click", () => {
      const dishesCount = Math.max(0, (+dishCount.innerText || 0) - 1);

      dishCount.innerText = dishesCount;
      itemPrice.innerText = `${dishesCount * dish.price} ₽`;
      order[dish.id].count = dishesCount;
      if (dishesCount === 0) {
        item.remove();

        delete order[dish.id];
      }

      saveOrderToLS();
      updateTgButtonText();

      if (Object.values(order).every((dish) => dish.count === 0)) {
        closeCart();
      }
    });

    const buttonInc = document.createElement("button");
    buttonInc.innerText = "+";
    buttonInc.classList.add("button-inc");
    buttonInc.addEventListener("click", () => {
      const dishesCount = (+dishCount.innerText || 0) + 1;

      dishCount.innerText = dishesCount;
      itemPrice.innerText = `${dishesCount * dish.price} ₽`;

      order[dish.id].count = dishesCount;

      saveOrderToLS();
      updateTgButtonText();
    });
    itemActionsBlock.append(buttonDec, dishCount, buttonInc);

    itemMainBlock.append(itemInfoBlock, itemActionsBlock);

    item.append(itemImg, itemMainBlock);

    container.appendChild(item);
    container.classList.add("cart-container_open");
  });

  Telegram.WebApp.onEvent("mainButtonClicked", () => makeOrderCallback(order));
}

// let usercard = document.getElementById("usercard");

// let p = document.createElement("p");

// p.innerText = `${tg.initDataUnsafe.user.first_name}
// ${tg.initDataUnsafe.user.last_name}`;

// usercard.appendChild(p);
