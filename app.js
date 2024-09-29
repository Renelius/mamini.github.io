let tg = window.Telegram.WebApp;

tg.expand();

tg.MainButton.textColor = "#FFFFFF";
tg.MainButton.color = "#2cab37";

const menu = [
  {
    id: 1,
    name: "dish 1",
    img: "images/burger.png",
    price: 100,
  },
  {
    id: 2,
    name: "dish 2",
    img: "images/burger.png",
    price: 100,
  },
  {
    id: 3,
    name: "dish 3",
    img: "images/terpug.png",
    price: 100,
  },
  {
    id: 4,
    name: "dish 4",
    img: "images/terpug.png",
    price: 100,
  },
  {
    id: 5,
    name: "dish 5",
    img: "images/caesar.png",
    price: 100,
  },
  {
    id: 6,
    name: "dish 6",
    img: "images/caesar.png",
    price: 100,
  },
];

let order = {};

drawMenu();

function drawMenu() {
  tg.MainButton.setText(`Перейти в корзину`);

  Telegram.WebApp.onEvent("mainButtonClicked", openCartCallback);

  const container = document.querySelector(".inner");
  container.innerHTML = "";

  const cartCount = document.querySelector(".cart-count");
  countForCart(cartCount);
  const cartButton = document.querySelector(".cart-button");

  cartButton.addEventListener("click", openCartCallback);

  menu.forEach((dish) => {
    const { id, name, img, price } = dish;
    const dishFromOrder = order[id];

    const item = document.createElement("div");
    item.classList.add("item");

    const itemImg = document.createElement("img");
    itemImg.src = img;
    itemImg.alt = name;
    itemImg.classList.add("img");

    const itemActions = document.createElement("div");
    itemActions.classList.add("item-actions");

    const itemPrice = document.createElement("span");
    itemPrice.innerText = `${price}$`;
    itemPrice.classList.add("item-price");

    const buttonAdd = document.createElement("button");
    buttonAdd.classList.add("btn", "order-btn");
    buttonAdd.innerText = "Add";

    const itemManageBlock = document.createElement("div");
    itemManageBlock.classList.add("item-manage-count");

    const itemCount = document.createElement("span");
    itemCount.classList.add("item-count");
    itemCount.innerText = dishFromOrder?.count || 0;
    const buttonDec = document.createElement("button");
    buttonDec.classList.add("button-dec");
    buttonDec.innerText = "-";
    const buttonInc = document.createElement("button");
    buttonInc.classList.add("button-inc");
    buttonInc.innerText = "+";

    if (dishFromOrder && dishFromOrder?.count !== 0) {
      buttonAdd.style.display = "none";
      itemManageBlock.style.display = "flex";
    } else {
      buttonAdd.style.display = "block";
      itemManageBlock.style.display = "none";
    }

    buttonAdd.addEventListener("click", () => {
      order[id] = {
        id,
        name,
        count: 1,
        price,
        img,
      };

      buttonAdd.style.display = "none";
      itemManageBlock.style.display = "flex";
      itemCount.innerText = 1;

      countForCart(cartCount);
      saveOrderToLS();

      tg.MainButton.setText("Перейти в корзину");
      tg.MainButton.show();
    });

    buttonDec.addEventListener("click", () => {
      const dishesCount = Math.max(0, (+itemCount.innerText || 0) - 1);

      itemCount.innerText = dishesCount;
      order[id].count = dishesCount;
      if (dishesCount === 0) {
        itemManageBlock.style.display = "none";
        buttonAdd.style.display = "block";

        delete order[id];
      }

      countForCart(cartCount);
      saveOrderToLS();

      if (Object.values(order).every((dish) => dish.count === 0)) {
        tg.MainButton.hide();
      }
    });

    buttonInc.addEventListener("click", () => {
      const dishesCount = (+itemCount.innerText || 0) + 1;

      itemCount.innerText = dishesCount;

      order[id].count = dishesCount;

      countForCart(cartCount);
      saveOrderToLS();
    });

    itemManageBlock.append(buttonDec, itemCount, buttonInc);

    itemActions.append(itemPrice, buttonAdd, itemManageBlock);

    item.append(itemImg, itemActions);

    container.append(item);
  });
}

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
  if (
    Object.values(order || {}).reduce(
      (acc, cur) => acc + (cur.count || 0),
      0
    ) === 0
  ) {
    WebApp.showAlert("Чтобы перейти в корзину, выберите блюда");
    return;
  }

  console.log(JSON.stringify(order));
  executeCart();
  // tg.sendData(JSON.stringify(order));
  // Telegram.WebApp.openTelegramLink("cart.html");
}

function makeOrderCallback() {
  console.log(JSON.stringify(order));
  tg.sendData(JSON.stringify(order));
  tg.close();
}

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

    drawMenu();
  }

  const container = document.querySelector(".cart-container");
  container.innerHTML = "";
  Object.values(order || {}).forEach(drawDishCartItem);

  function drawDishCartItem(dish) {
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
  }

  Telegram.WebApp.onEvent("mainButtonClicked", makeOrderCallback);
}

// let usercard = document.getElementById("usercard");

// let p = document.createElement("p");

// p.innerText = `${tg.initDataUnsafe.user.first_name}
// ${tg.initDataUnsafe.user.last_name}`;

// usercard.appendChild(p);
