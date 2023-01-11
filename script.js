// 1. Использовать скидку для школьников и студентов. При выборе чекбокса стоимость
// уменьшается на 15%.
// 5. Тематические сувениры для посетителей. Стоимость увеличивается на 500 рублей для
// каждого посетителя

let urlRoute = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d");
let urlGid = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/{id-маршрута}/guides?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d");
let urlOrder = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d");
let mainRoutes, routes;
let currentPage = document.querySelector(".active").innerText;
let divRouteTemplate = document.getElementById("div-template");
let divGidTemplate = document.getElementById("div-gid-template");
let choiceRouteId = 0, choiceGidId = 0;
let mainGids, gids;
let choiceRoute, choiceGid;

function createNewDiv(oneRoute) {
    let divRoute = divRouteTemplate.content.firstElementChild.cloneNode(true);
    divRoute.id = oneRoute.id;
    let name = divRoute.querySelector(".name");
    name.innerHTML = oneRoute.name;
    let desc = divRoute.querySelector(".desc");
    desc.innerHTML = oneRoute.description;
    let mainObject = divRoute.querySelector(".main-object");
    mainObject.innerHTML = oneRoute.mainObject;
    divRoute.querySelector("button").addEventListener("click", choiceRouteHandler);

    return divRoute;
}

//download main routes
async function loadRoute() {
    let response = await fetch(urlRoute);
    let routeList = await response.json();
    mainRoutes = routeList;
}

function updateRouteTable(page, makeSelectBool = true) {
    let bodyTable = document.querySelector('.route-table');
    bodyTable.innerHTML = '';

    let start = (page - 1) * 10;
    let end = Math.min(routes.length, start + 10);
    for (let i = start; i < end; i++) {
        let divRoute = createNewDiv(routes[i]);
        bodyTable.append(divRoute);
    }

    if (makeSelectBool) {
        let selectObject = document.querySelector(".search-object");
        selectObject.innerHTML = "<option>Не выбрано</option>";

        for (let i = 0; i < routes.length; i++) {
            let optionObject = document.createElement('option');
            optionObject.innerText = routes[i].mainObject;
            selectObject.append(optionObject);
        }
    }

    if (document.getElementById(choiceRouteId) != null)
        document.getElementById(choiceRouteId).classList.add("table-success");

}

function makePagination(openPage = '1', makeSelectBool = true) {

    let activeBtn = document.querySelector(".active");
    let startBtn = document.querySelector(".to-start").children[0];
    let endBtn = document.querySelector(".to-end").children[0];
    let paginationBtns = document.querySelectorAll(".page-link");

    let lastPage = ((routes.length + (10 - routes.length % 10)) / 10).toString();
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

    updateRouteTable(Number(currentPage), makeSelectBool);
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

function searchNameHandler(event) {
    let searchRoute = [];
    if (event.target.value == '') {
        routes = mainRoutes;
    }
    else {
        for (let i = 0; i < mainRoutes.length; i++) {
            if (mainRoutes[i].name.toLowerCase().includes(event.target.value.toLowerCase()))
                searchRoute.push(mainRoutes[i]);
        }
        routes = searchRoute;
    }
    makePagination('1');
}

function selectRouteHandler(event) {
    let searchRoute = [];
    if (event.target.value == 'Не выбрано') {
        routes = mainRoutes;
    }
    else {
        for (let i = 0; i < mainRoutes.length; i++) {
            if (mainRoutes[i].mainObject.includes(event.target.value))
                searchRoute.push(mainRoutes[i]);
        }
        routes = searchRoute;
    }
    makePagination('1', false);
}

function choiceRouteHandler(event) {
    let divRoute = event.target.closest("div");
    if (choiceRouteId == divRoute.id) {
        divRoute.classList.remove("table-success");
        choiceRouteId = 0;
    }
    else if (choiceRouteId != 0) {
        if (document.getElementById(choiceRouteId) != null)
            document.getElementById(choiceRouteId).classList.remove("table-success");
        divRoute.classList.add("table-success");
        choiceRouteId = divRoute.id;
    }
    else {
        choiceRouteId = divRoute.id;
        divRoute.classList.add("table-success");
    }

    loadGid();
}

async function loadGid() {
    if (choiceRouteId == 0) {
        mainGids = [];
        gids = [];
    }
    else {
        urlGid.pathname = `/api/routes/${choiceRouteId}`;
        let response = await fetch(urlGid);
        choiceRoute = await response.json();

        urlGid.pathname += "/guides";
        response = await fetch(urlGid);
        let gidList = await response.json();

        mainGids = gidList;
        gids = mainGids;
    }

    updateGidTable();
}

function createNewGid(gid) {
    let divGid = divGidTemplate.content.firstElementChild.cloneNode(true);
    divGid.id = gid.id;
    let name = divGid.querySelector(".name");
    name.innerHTML = gid.name;
    let lang = divGid.querySelector(".lang");
    lang.innerHTML = gid.language;
    let exp = divGid.querySelector(".exp");
    exp.innerHTML = gid.workExperience;
    let price = divGid.querySelector(".price");
    price.innerHTML = gid.pricePerHour;
    divGid.querySelector("button").addEventListener("click", choiceGidHandler);

    return divGid;
}

function updateGidTable(makeSelectBool = true) {
    document.querySelector("#gid-list > span").innerText = choiceRoute.name;

    let selectLang = document.querySelector(".search-lang");

    if (makeSelectBool) {
        selectLang.innerHTML = '';
        let optionLang = document.createElement('option');
        optionLang.innerHTML = 'Не выбрано';
        selectLang.append(optionLang);
    }

    let bodyTable = document.querySelector('.gid-table');
    bodyTable.innerHTML = '';
    for (let i = 0; i < gids.length; i++) {
        let divGid = createNewGid(gids[i]);
        bodyTable.append(divGid);

        if (makeSelectBool) {
            let optionLang = document.createElement('option'); //update select language
            optionLang.innerHTML = gids[i].language;
            if (!selectLang.innerText.includes(gids[i].language))
                selectLang.append(optionLang);
        }
    }
}

function manageOrderBtn(status = true) {
    let createOrderBtn = document.querySelector(".create-order-btn");
    if (status) {
        createOrderBtn.classList.remove("disabled");
        createOrderBtn.classList.remove("btn-secondary");
        createOrderBtn.classList.add("btn-primary");
    } else {
        createOrderBtn.classList.add("disabled");
        createOrderBtn.classList.add("btn-secondary");
        createOrderBtn.classList.remove("btn-primary");
    }
}

async function choiceGidHandler(event) {
    let divGid = event.target.closest("div");
    if (choiceGidId == divGid.id) {
        divGid.classList.remove("table-success");
        choiceGidId = 0;
        manageOrderBtn(false);
        return;
    }
    else if (choiceGidId != 0) {
        if (document.getElementById(choiceGidId) != null)
            document.getElementById(choiceGidId).classList.remove("table-success");
        divGid.classList.add("table-success");
        choiceGidId = divGid.id;
    }
    else {
        choiceGidId = divGid.id;
        divGid.classList.add("table-success");
    }
    manageOrderBtn(true);

    let tempUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/guides/?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d'); //url for choice guide
    tempUrl.pathname += choiceGidId;
    let response = await fetch(tempUrl);
    choiceGid = await response.json();
}

function searchGidHandler(event) {
    let langGid = document.querySelector(".search-lang");
    let expFromGid = document.querySelector(".search-from");
    let expToGid = document.querySelector(".search-to");
    gids = mainGids;

    if (langGid.value != 'Не выбрано')
        gids = gids.filter(gid => gid.language.includes(langGid.value));

    if (expFromGid.value != '')
        gids = gids.filter(gid => gid.workExperience >= expFromGid.value);

    if (expToGid.value != '')
        gids = gids.filter(gid => gid.workExperience <= expToGid.value);

    updateGidTable(false);
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

    console.log(duration, date, time, optionSecond, persons, optionFirst);

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

function showNewOrderHandler(event) {
    event.target.querySelector(".guide-name").innerText = choiceGid.name;
    event.target.querySelector(".route-name").innerText = choiceRoute.name;
    event.target.querySelector("#guide-id").value = choiceGid.id;
    event.target.querySelector("#route-id").value = choiceRoute.id;
    manageSubmitBtn();
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

// ● isThisDayOff – множитель, отвечающий за повышение стоимости в праздничные и
// выходные дни. Для будней3 равен 1, для праздничных и выходных дней (сб, вс) – 1,5;
// ● isItMorning – надбавка за раннее время экскурсии. Для экскурсий, которые начинаются
// с 9 до 12 часов, равна 400 рублей, для остальных – 0;
// ● isItEvening – надбавка за вечернее время экскурсии. Для экскурсий, которые
// начинаются с 20 до 23 часов, равна 1000 рублей, для остальных – 0;
// ● numberOfVisitors - надбавка за количество посетителей экскурсии:
// ○ от 1 до 5 человек – 0 рублей,
// ○ от 5 до 10 – 1000 рублей,
// ○ от 10 до 20 – 1500 рублей.

function alertOrder(response) {
    let sectionAlert = document.querySelector(".alerts");
    let alertTemplate = document.getElementById('alert-template');
    let divAlert = alertTemplate.content.firstElementChild.cloneNode(true);
    let textAlert = divAlert.querySelector(".alert-text");
    if (response.error == null) {
        divAlert.classList.add("alert-success");
        textAlert.innerText += "Заявка успешно создана!";
    } else {
        divAlert.classList.add("alert-danger");
        textAlert.innerText += response.error;
    }
    sectionAlert.append(divAlert);
}

let parsResponse;

async function newOrderHandler(event) {
    let modalWindow = event.target.closest(".modal");
    let formInputs = modalWindow.querySelector("form").elements;
    let route_id = formInputs["route_id"].value;
    let guide_id = formInputs["guide_id"].value;
    let date = formInputs["date"].value;
    let time = formInputs["time"].value;
    let duration = formInputs["duration"].value[0];
    let persons = formInputs["persons"].value;
    let optionFirst = formInputs["optionFirst"].checked ? 1 : 0;
    let optionSecond = formInputs["optionSecond"].checked ? 1 : 0;
    let price = document.querySelector('.total-price').innerText;

    let orderData = new FormData();
    orderData.append('route_id', route_id);
    orderData.append('guide_id', guide_id);
    orderData.append('date', date);
    orderData.append('time', time);
    orderData.append('duration', Number(duration));
    orderData.append('persons', persons);
    orderData.append('optionFirst', optionFirst);
    orderData.append('optionSecond', optionSecond); 
    orderData.append('price', price);

    let response = await fetch(urlOrder, {method: 'POST', body: orderData});
    parsResponse = await response.json();

    modalWindow.querySelector('form').reset();
    alertOrder(parsResponse);
}


window.onload = async function () {
    await loadRoute();
    updateRouteTable(1);
    document.querySelector(".pagination").addEventListener("click", paginationHandler);

    document.querySelector(".search-name").addEventListener("input", searchNameHandler);
    document.querySelector(".search-object").addEventListener("change", selectRouteHandler);

    document.querySelector(".search-lang").addEventListener("change", searchGidHandler);
    document.querySelector(".search-from").addEventListener("input", searchGidHandler);
    document.querySelector(".search-to").addEventListener("input", searchGidHandler);

    document.getElementById("new-order").addEventListener("show.bs.modal", showNewOrderHandler);
    document.querySelector(".new-order-form").addEventListener("change", inputsOrderHandler);

    document.querySelector("button.create-new-order").addEventListener("click", newOrderHandler);
}