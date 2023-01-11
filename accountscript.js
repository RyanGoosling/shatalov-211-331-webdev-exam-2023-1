
let orderUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d');
let routeUrl = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d");
let gidUrl = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/guides/?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d");
let mainOrders, mainRoutes;
let choiceGid, choiceOrder, choiceRoute;
let choiceGidId = 0, choiceRouteId = 0, choiceOrderId = 0;
let currentPage = document.querySelector(".active").innerText;
let trTemplate = document.getElementById('order-template');

async function loadRoute() {
    let responseFromServer = await fetch(routeUrl);
    mainRoutes = await responseFromServer.json();
}

async function loadOrder() {
    let responseFromServer = await fetch(orderUrl);
    mainOrders = await responseFromServer.json();
}

async function loadChoiseGid() {
    gidUrl.pathname = '/api/guides/' + choiceGidId;
    let responseFromServer = await fetch(gidUrl);
    choiceGid = await responseFromServer.json();
}

function urlModified(addIdBool = false) {
    if (addIdBool)
        orderUrl.pathname += '/' + choiceOrderId;
    else orderUrl.pathname = '/api/orders';
}

async function choiceOrderHandler(event) {
    if (event.target.tagName != 'I')
        return;
    choiceOrderId = event.target.closest("tr").id;
    if (event.target.dataset.action == 'delete')
        return;

    choiceOrder = mainOrders.find(order => order.id == choiceOrderId);
    choiceGidId = choiceOrder.guide_id;
    choiceRouteId = choiceOrder.route_id;
    choiceRoute = mainRoutes.find(route => route.id == choiceRouteId);
    await loadChoiseGid();

    showOrderHandler(event.target.dataset.action);
}

function createNewTr(oneOrder, n) {
    let trOrder = trTemplate.content.firstElementChild.cloneNode(true);
    trOrder.id = oneOrder.id;
    let number = trOrder.querySelector('.number');
    number.innerHTML = oneOrder.id; //n + 1;
    let oneRoute = mainRoutes.filter(route => route.id == oneOrder.route_id);
    let name = trOrder.querySelector(".name");
    name.innerHTML = oneRoute[0].name;
    let date = trOrder.querySelector(".date");
    let splitDate = oneOrder.date.split('-'); // from YYYY-MM-DD to DD.MM.YYYY
    splitDate = splitDate.reverse();
    date.innerHTML = splitDate.join('.');
    let price = trOrder.querySelector(".price");
    price.innerHTML = oneOrder.price;
    trOrder.querySelector(".buttons-i").addEventListener("click", choiceOrderHandler);

    return trOrder;
}

function updateOrderTable(page = 1) {
    page = currentPage;
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

    let lastPage = (Math.ceil(mainOrders.length / 5)).toString();
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
    if (newActive == lastPage) {
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

    updateOrderTable();
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

async function isThisDayOff(day) {
    let urlDay = new URL('https://isdayoff.ru/');
    urlDay.pathname += day;
    let response = await fetch(urlDay);
    let isdayoff = await response.json();
    return isdayoff; // 1 - day off
}

async function updatePrice() {
    let spanPrice = document.querySelector('.total-price');

    let date = document.getElementById('date-excursion').value;
    let time = document.getElementById('time-excursion').value;
    let duration = document.getElementById('duration-excursion').value[0]; //n час
    let persons = document.getElementById('persons-excursion').value;
    let optionFirst = document.getElementById('option-1').checked ? 0.85 : 1;
    let optionSecond = document.getElementById('option-2').checked ? 500 : 0;

    date = await isThisDayOff(date) == 1 ? 1.5 : 1;
    time = time <= '12:00' ? 400 :
        time >= '20:00' ? 1000 : 0;
    duration = Number(duration);
    optionSecond *= persons;
    persons = persons < 5 ? 0 :
        persons < 10 ? 1000 : 1500;

    // console.log(duration, date, time, optionSecond, persons, optionFirst);

    let price = (choiceGid.pricePerHour * duration * date + time + optionSecond + persons) * optionFirst;
    spanPrice.innerText = Math.round(price);
}

function manageSubmitBtn() {
    let formOrder = document.querySelector(".new-order-form");
    let submitBtn = document.querySelector("button.create-new-order");
    if (formOrder.checkValidity())
        submitBtn.classList.remove("disabled");
    else
        submitBtn.classList.add("disabled");
}

function showOrderHandler(action) {
    let modalWindow = document.querySelector("#new-order");
    modalWindow.querySelector(".guide-name").innerText = choiceGid.name;
    modalWindow.querySelector(".route-name").innerText = choiceRoute.name;
    modalWindow.querySelector("#guide-id").value = choiceGid.id;
    modalWindow.querySelector("#route-id").value = choiceRoute.id;
    manageSubmitBtn();

    let dateInput = document.getElementById('date-excursion');
    let timeInput = document.getElementById('time-excursion');
    let durationInput = document.getElementById('duration-excursion');
    let personsInput = document.getElementById('persons-excursion');
    let optionFirstInput = document.getElementById('option-1');
    let optionSecondInput = document.getElementById('option-2');
    let priceInput = document.querySelector('.total-price');

    let duration;
    if (choiceOrder.duration == 1)
        duration = choiceOrder.duration + ' час';
    else duration = choiceOrder.duration + ' часа';

    dateInput.value = choiceOrder.date;
    timeInput.value = choiceOrder.time;
    durationInput.value = duration;
    personsInput.value = choiceOrder.persons;
    optionFirstInput.checked = choiceOrder.optionFirst;
    optionSecondInput.checked = choiceOrder.optionSecond;
    priceInput.innerText = choiceOrder.price;
    console.log(action);
    if (action == 'show') {
        dateInput.classList.remove('form-control'); 
        timeInput.classList.remove('form-control'); 
        durationInput.classList.remove('form-control');
        personsInput.classList.remove('form-control');
        dateInput.classList.add('form-control-plaintext'); 
        timeInput.classList.add('form-control-plaintext'); 
        durationInput.classList.add('form-control-plaintext');
        personsInput.classList.add('form-control-plaintext');
    } else if(action == 'edit') {
        dateInput.classList.remove('form-control-plaintext'); 
        timeInput.classList.remove('form-control-plaintext'); 
        durationInput.classList.remove('form-control-plaintext');
        personsInput.classList.remove('form-control-plaintext');
        dateInput.classList.add('form-control'); 
        timeInput.classList.add('form-control'); 
        durationInput.classList.add('form-control');
        personsInput.classList.add('form-control');
    }

    updatePrice();
}

function inputsOrderHandler(event) {
    let formOrder = event.target.closest(".new-order-form");
    if (event.target.tagName == 'INPUT' || event.target.tagName == 'SELECT') {
        if (formOrder.checkValidity())
            updatePrice();
        manageSubmitBtn();
    }
}

function alertOrder(response, action) {
    let sectionAlert = document.querySelector(".alerts");
    let alertTemplate = document.getElementById('alert-template');
    let divAlert = alertTemplate.content.firstElementChild.cloneNode(true);
    let textAlert = divAlert.querySelector(".alert-text");
    let text;
    if (action == 'edit')
        text = "Заявка успешно изменена";
    else if (action == 'delete')
        text = "Заявка успешно удалена";

    if (response.error == null) {
        divAlert.classList.add("alert-success");
        textAlert.innerText += text;
    } else {
        divAlert.classList.add("alert-danger");
        textAlert.innerText += response.error;
    }

    sectionAlert.append(divAlert);
}

async function delHandler(event) {
    urlModified(true);
    let responseFromServer = await fetch(orderUrl, { method: 'DELETE' });
    let delId = await responseFromServer.json();
    console.log(delId);
    urlModified();

    await loadOrder();
    updateOrderTable();
    alertOrder(delId, 'delete');
}

window.onload = async function () {
    await loadRoute();
    await loadOrder();
    makePagination(1);
    document.querySelector(".pagination").addEventListener("click", paginationHandler);

    document.querySelector(".new-order-form").addEventListener("change", inputsOrderHandler);

    // let modalDel = document.getElementById("del-order");
    // modalDel.addEventListener("show.bs.modal", delTaskHandler);
    let delBtn = document.getElementsByClassName("del-order-btn")[0];
    delBtn.addEventListener("click", delHandler);
}