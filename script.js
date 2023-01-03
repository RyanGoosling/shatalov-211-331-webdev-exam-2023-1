// 1. Использовать скидку для школьников и студентов. При выборе чекбокса стоимость
// уменьшается на 15%.
// 5. Тематические сувениры для посетителей. Стоимость увеличивается на 500 рублей для
// каждого посетителя

let urlRoute = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=3c8ee4d3-00fb-49b5-9040-546e5c98ba1d");
let mainRoute, route;
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
    mainRoute = routeList;
    route = mainRoute;
}

function updateTable(page) {
    //console.log(route);
    let bodyTable = document.querySelector('.route-tbody');
    bodyTable.innerHTML = '';
    let start = (page-1)*10;
    let end = Math.min(route.length, start + 10);
    for (let i = start; i < end; i++) {
        let trRoute = createNewTr(route[i]);
        bodyTable.append(trRoute);
    }
}

function makePagination(openPage = '1') {

    let activeBtn = document.querySelector(".active");
    let startBtn = document.querySelector(".to-start").children[0];
    let endBtn = document.querySelector(".to-end").children[0];
    let paginationBtns = document.querySelectorAll(".page-link");

    let lastPage = ((route.length + (10 - route.length % 10)) / 10).toString();
    let start = Math.max(Number(openPage) - 2, 1);
    let end = Math.min(start + 4, Number(lastPage)); //Number(openPage) + 2
    let newActive = openPage;
    //console.log(lastPage, start, end, newActive);
    
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

    //console.log(lastPage, start, end, newActive);

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
        //console.log(i);
    }
    if (end < 5)
        for (let i = end + 1; i <= 5; i++)
            paginationBtns[i].classList.add("disabled");
    else 
        for (let i = 1; i <= 5; i++)
            paginationBtns[i].classList.remove("disabled");

    currentPage = newActive;

    updateTable(Number(currentPage));
}

function paginationHandler(event) {
    //console.log(event.target.innerText);
    if (event.target.tagName == 'UL') return;
    else if (event.target.tagName == 'LI') {
        if(event.target.children[0].classList.contains("disabled"))
            return; 
    }
    else if (event.target.classList.contains("disabled")) return;

    makePagination(event.target.innerText);
}

function searchNameHandler(event) {
    //console.log(event.target.value);
    let searchRoute = [];
    if (event.target.value == '') {
        updateTable(1);
        makePagination('1');
        route = mainRoute;
    }
    else {
        for(let i = 0; i < mainRoute.length; i++) {
            if (mainRoute[i].name.includes(event.target.value))
                searchRoute.push(mainRoute[i]);
        }
        route = searchRoute;
        updateTable(1);
        makePagination('1');
    }
}

window.onload = async function () {
    await loadRoute();
    updateTable(1);
    document.querySelector(".pagination").addEventListener("click", paginationHandler);
    document.querySelector(".search-name").addEventListener("input", searchNameHandler);
}