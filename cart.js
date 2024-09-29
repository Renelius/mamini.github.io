let tg = window.Telegram.WebApp;

tg.expand();

tg.MainButton.textColor = "#FFFFFF";
tg.MainButton.color = "#2cab37";

tg.MainButton.show();

let order = JSON.parse(loadCartFromLS() || "{}");

const container = document.querySelector(".container");
container.innerHTML = "";
Object.values(order || {}).forEach((dish) => {
  const item = document.createElement("div");
  item.classList.add("cart-item");

  const itemImg = document.createElement("img");
  itemImg.classList.add("item-img");
  itemImg.src = dish.img;
  itemImg.alt = dish.name;

  const itemMainBlock = document.createElement("div");
  itemMainBlock.classList.add("item-main");

  const itemInfoBlock = document.createElement("div");
  itemInfoBlock.classList.add("item-info");
  const itemName = document.createElement("span");
  itemName.classList.add("item-name");
  itemName.innerText = dish.name;
  const itemPrice = document.createElement("span");
  itemPrice.innerText = dish.price * dish.count + " ₽";
  itemPrice.classList.add("item-price");
  itemInfoBlock.append(itemName, itemPrice);

  const itemActionsBlock = document.createElement("div");
  itemActionsBlock.classList.add("item-actions");
  const dishCount = document.createElement("span");
  dishCount.innerText = dish.count;
  dishCount.classList.add("item-count");
  const buttonDec = document.createElement("button");
  buttonDec.innerText = "-";
  buttonDec.classList.add("button-dec");
  buttonDec.addEventListener("click", () => {
    const dishesCount = Math.max(0, (+dishCount.innerText || 0) - 1);

    dishCount.innerText = dishesCount;
    itemPrice.innerText = `${dishesCount * dish.price} ₽`;
    if (dishesCount === 0) {
      item.remove();
    }

    order[dish.id].count = dishesCount;

    saveOrderToLS();
    updateTgButtonText();

    if (Object.values(order).every((dish) => dish.count === 0)) {
      tg.MainButton.hide();
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
});

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

Telegram.WebApp.onEvent("mainButtonClicked", function () {
  console.log(JSON.stringify(order));
  tg.sendData(JSON.stringify(order));
  tg.close();
});
