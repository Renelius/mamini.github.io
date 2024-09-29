let tg = window.Telegram.WebApp;

tg.expand();

tg.MainButton.textColor = "#FFFFFF";
tg.MainButton.color = "#2cab37";

let order = {};

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

    order[dishId] = {
      id: dishId,
      name: dishName,
      count: 1,
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
    const dishesCount = Math.max(0, +count.innerText - 1);

    count.innerText = dishesCount;
    if (dishesCount === 0) {
      block.style.display = "none";
      orderButtons[i].style.display = "block";
    }

    order[dishId].count = dishesCount;

    countForCart(cartCount);
    saveOrderToLS();

    if (Object.values(order).every((dish) => dish.count === 0)) {
      tg.MainButton.hide();
    }
  });

  plusButton.addEventListener("click", () => {
    const dishesCount = +count.innerText + 1;

    count.innerText = dishesCount;

    order[dishId].count = dishesCount;

    countForCart(cartCount);
    saveOrderToLS();
  });
});

cartButton.addEventListener("click", () => {
  Telegram.WebApp.openLink("cart.html");
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

Telegram.WebApp.onEvent("mainButtonClicked", function () {
  tg.sendData(item);
  tg.close();
});

let usercard = document.getElementById("usercard");

let p = document.createElement("p");

p.innerText = `${tg.initDataUnsafe.user.first_name}
${tg.initDataUnsafe.user.last_name}`;

usercard.appendChild(p);
