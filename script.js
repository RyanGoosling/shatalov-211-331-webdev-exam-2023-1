// 1. Использовать скидку для школьников и студентов. При выборе чекбокса стоимость
// уменьшается на 15%.
// 5. Тематические сувениры для посетителей. Стоимость увеличивается на 500 рублей для
// каждого посетителя

let urlRoute = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d");
let route;
let currentPage = document.querySelector(".active").innerText;
let trTemplate = document.getElementById("tr-template");

function createNewTr(oneRoute) {
    let trRoute = trTemplate.content.firstElementChild.cloneNode(true);
    trRoute.id = oneRoute.id;
    let name = trRoute.querySelector(".name");
    name.innerHTML = oneRoute.name;
    let desc = trRoute.querySelector(".desc");
    desc.innerHTML = oneRoute.description;
    let mainObject = trRoute.querySelector(".main-object");
    mainObject.innerHTML = oneRoute.mainObject;

    return trRoute;
}


//download main route
async function loadRoute() {
    let response = await fetch(urlRoute);
    let routeList = await response.json();
    route = routeList;
}

function updateTable(page) {
    let bodyTable = document.querySelector('.route-tbody');
    bodyTable.innerHTML = '';
    let start = (page-1)*10;
    for (let i = start; i < start + 10; i++) {
        let trRoute = createNewTr(route[i]);
        bodyTable.append(trRoute);
    }
}

function paginationHandler(event) {
    if (event.target.tagName == 'UL') return;

    let activeBtn = document.querySelector(".active");
    let startBtn = document.querySelector(".to-start");
    let endBtn = document.querySelector(".to-end");
    let paginationBtns = document.querySelectorAll(".page-link");

    let lastPage = ((route.length + (10 - route.length % 10)) / 10).toString();
    let start = Math.max(Number(event.target.innerText) - 2, 1);
    let end = Math.min(Number(event.target.innerText) + 2, Number(lastPage));
    let newActive = event.target.innerText;

    if (end == lastPage)
        start = Number(lastPage) - 4;

    if (event.target.innerText == 'В начало') {
        start = 1;
        end = 5;
        newActive = '1';
    }
    if (event.target.innerText == 'В конец') {
        start = Number(lastPage - 4);
        end = Number(lastPage);
        newActive = lastPage;
    }

    startBtn.classList.remove("v-hidden");
    endBtn.classList.remove("v-hidden");
    if (newActive == '1') {
        startBtn.classList.add("v-hidden");
    }
    else if (newActive == lastPage) {
        endBtn.classList.add("v-hidden");
    }


    for (let i = start, j = 1; i <= end; i++, j++) {
        if (i == newActive) {
            activeBtn.classList.remove("active");
            paginationBtns[j].classList.add("active");
        }
        paginationBtns[j].innerText = i.toString();
    }

    currentPage = newActive;

    updateTable(Number(currentPage));
}


window.onload = async function () {
    await loadRoute();
    updateTable(1);
    document.querySelector(".pagination").addEventListener("click", paginationHandler);
}