// 1. Использовать скидку для школьников и студентов. При выборе чекбокса стоимость
// уменьшается на 15%.
// 5. Тематические сувениры для посетителей. Стоимость увеличивается на 500 рублей для
// каждого посетителя

let urlRoute = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d");
let urlGid = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/{id-маршрута}/guides?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d");
let mainRoutes, routes;
let currentPage = document.querySelector(".active").innerText;
let trRouteTemplate = document.getElementById("tr-template");
let trGidTemplate = document.getElementById("tr-gid-template");
let choiceRouteId = 0, choiceGidId = 0;
let mainGids, gids;
let choiceRoute, choiceGid;

function createNewTr(oneRoute) {
    let trRoute = trRouteTemplate.content.firstElementChild.cloneNode(true);
    trRoute.id = oneRoute.id;
    let name = trRoute.querySelector(".name");
    name.innerHTML = oneRoute.name;
    let desc = trRoute.querySelector(".desc");
    desc.innerHTML = oneRoute.description;
    let mainObject = trRoute.querySelector(".main-object");
    mainObject.innerHTML = oneRoute.mainObject;

    return trRoute;
}


//download main routes
async function loadRoute() {
    let response = await fetch(urlRoute);
    let routeList = await response.json();
    mainRoutes = routeList;
    routes = mainRoutes;
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

function updateRouteTable(page, makeSelectBool = true) {
    let bodyTable = document.querySelector('.route-tbody');
    bodyTable.innerHTML = '';

    let start = (page - 1) * 10;
    let end = Math.min(routes.length, start + 10);
    for (let i = start; i < end; i++) {
        let trRoute = createNewTr(routes[i]);
        trRoute.children[3].firstChild.addEventListener("click", choiceRouteHandler);
        bodyTable.append(trRoute);
    }

    if (makeSelectBool) {
        let selectObject = document.querySelector(".search-object");
        selectObject.innerHTML = "<option>Не выбрано</option>";

        for (let i = 0; i < routes.length; i++) {
            let optionObject = document.createElement('option');
            optionObject.innerText = routes[i].mainObject;
            //optionObject.id = routes[i].id;
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
            if (mainRoutes[i].name.includes(event.target.value))
                searchRoute.push(mainRoutes[i]);
        }
        routes = searchRoute;
    }
    makePagination('1');
}

function choiceRouteHandler(event) {
    let trRoute = event.target.closest("tr");
    if (choiceRouteId == trRoute.id) {
        trRoute.classList.remove("table-success");
        choiceRouteId = 0;
    }
    else if (choiceRouteId != 0) {
        if (document.getElementById(choiceRouteId) != null)
            document.getElementById(choiceRouteId).classList.remove("table-success");
        trRoute.classList.add("table-success");
        choiceRouteId = trRoute.id;
    }
    else {
        choiceRouteId = trRoute.id;
        trRoute.classList.add("table-success");
    }

    loadGid();
}

function choiceGidHandler(event) {
    let trGid = event.target.closest("tr");
    if (choiceGidId == trGid.id) {
        trGid.classList.remove("table-success");
        choiceGidId = 0;
    }
    else if (choiceGidId != 0) {
        if (document.getElementById(choiceGidId) != null)
            document.getElementById(choiceGidId).classList.remove("table-success");
        trGid.classList.add("table-success");
        choiceGidId = trGid.id;
    }
    else {
        choiceGidId = trGid.id;
        trGid.classList.add("table-success");
    }
}

function createNewGid(gid) {
    let trGid = trGidTemplate.content.firstElementChild.cloneNode(true);
    trGid.id = gid.id;
    let name = trGid.querySelector(".name");
    name.innerHTML = gid.name;
    let lang = trGid.querySelector(".lang");
    lang.innerHTML = gid.language;
    let exp = trGid.querySelector(".exp");
    exp.innerHTML = gid.workExperience;
    let price = trGid.querySelector(".price");
    price.innerHTML = gid.pricePerHour;

    return trGid;
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

    let bodyTable = document.querySelector('.gid-tbody');
    bodyTable.innerHTML = '';
    for (let i = 0; i < gids.length; i++) {
        let trGid = createNewGid(gids[i]);
        trGid.children[4].firstChild.addEventListener("click", choiceGidHandler);
        bodyTable.append(trGid);

        if (makeSelectBool) {
            let optionLang = document.createElement('option');//update select language
            optionLang.innerHTML = gids[i].language;
            if (!selectLang.innerText.includes(gids[i].language))
                selectLang.append(optionLang);
        }
    }
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

function searchGid() {
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

function searchGidHandler(event) {
    searchGid();
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
}