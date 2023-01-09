
let orderUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d');
let routeUrl = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d");
let mainOrders;
let mainRoutes;
let trTemplate = document.getElementById('order-template');

async function loadRoute() {
    let response = await fetch(routeUrl);
    let routeList = await response.json();
    mainRoutes = routeList;
}

async function loadOrder() {
    let responseFromServer = await fetch(orderUrl);
    let orderList = await responseFromServer.json();
    mainOrders = orderList;
}

function createNewTr(oneOrder, n) {
    let trOrder = trTemplate.content.firstElementChild.cloneNode(true);
    trOrder.id = oneOrder.id;
    let number = trOrder.querySelector('.number');
    number.innerHTML = n + 1;
    let oneRoute = mainRoutes.filter(route => route.id == oneOrder.route_id);
    let name = trOrder.querySelector(".name");
    name.innerHTML = oneRoute[0].name;
    let date = trOrder.querySelector(".date");
    let splitDate = oneOrder.date.split('-'); // from YYYY-MM-DD to DD.MM.YYYY
    date.innerHTML = splitDate[2] + '.' + splitDate[1] + '.' + splitDate[0];
    let price = trOrder.querySelector(".price");
    price.innerHTML = oneOrder.price;
    //trOrder.querySelector("button").addEventListener("click", choiceRouteHandler);

    return trOrder;
}

function updateOrderTable(page = 1) {
    let bodyTable = document.querySelector('.order-tbody');
    bodyTable.innerHTML = '';

    let start = (page - 1) * 5;
    let end = Math.min(mainOrders.length, start + 5);
    for (let i = start; i < end; i++) {
        let trOrder = createNewTr(mainOrders[i], i);
        bodyTable.append(trOrder);
    }
}

function makePagination(openPage = '1', makeSelectBool = true) {

    let activeBtn = document.querySelector(".active");
    let startBtn = document.querySelector(".to-start").children[0];
    let endBtn = document.querySelector(".to-end").children[0];
    let paginationBtns = document.querySelectorAll(".page-link");

    let lastPage = ((mainOrders.length + (5 - mainOrders.length % 5)) / 5).toString();
    let start = Math.max(Number(openPage) - 2, 1);
    let end = Math.min(start + 4, Number(lastPage)); //Number(openPage) + 2
    let newActive = openPage;

    if (end == lastPage && lastPage > 4)
        start = Number(lastPage) - 4;

    if (openPage == 'В начало') {
        start = 1;
        newActive = '1';
        end = lastPage > 4 ? 5 : lastPage;
    }
    if (openPage == 'В конец') {
        end = Number(lastPage);
        newActive = lastPage;
        start = lastPage > 4 ? Number(lastPage) - 4 : 1;
    }

    startBtn.classList.remove("disabled");
    endBtn.classList.remove("disabled");
    if (newActive == '1') {
        startBtn.classList.add("disabled");
    }
    else if (newActive == lastPage) {
        endBtn.classList.add("disabled");
    }


    for (let i = start, j = 1; i <= end; i++, j++) {
        if (i == newActive) {
            activeBtn.classList.remove("active");
            paginationBtns[j].classList.add("active");
        }
        paginationBtns[j].innerText = i.toString();
        paginationBtns[j].classList.remove("disabled");
    }
    if (end < 5)
        for (let i = end + 1; i <= 5; i++)
            paginationBtns[i].classList.add("disabled");
    else
        for (let i = 1; i <= 5; i++)
            paginationBtns[i].classList.remove("disabled");

    currentPage = newActive;

    updateOrderTable(Number(currentPage));
}

function paginationHandler(event) {
    if (event.target.tagName == 'UL') return;
    else if (event.target.tagName == 'LI') {
        if (event.target.children[0].classList.contains("disabled"))
            return;
    }
    else if (event.target.classList.contains("disabled")) return;

    makePagination(event.target.innerText);
}

window.onload = async function () {
    await loadRoute();
    await loadOrder();
    makePagination(1);
    document.querySelector(".pagination").addEventListener("click", paginationHandler);
}