"use strict";
const CONTI = {
  Asia: "아시아",
  Europe: "유럽",
  Americas: "아메리카",
  Oceania: "오세아니아",
  Africa: "아프리카",
};
let storageMap = new Map();
let stdDate = new Date("2022-09-30");
let stdYear = stdDate.getFullYear();
let stdMonth = stdDate.getMonth() + 1; //해당 월의 전달 부터 시작

const max_year = stdYear;
const max_month = stdMonth;
const min_year = 2019;
const min_month = 12;

const serviceKey =
  "lBC0qPUVGFfXZrKZo89+Kzsjh+laBxPyRt15hG0fl9FJb8c2QdybFSVgqC5NI9/SfaKucjXmB+ihGKmZxDALmQ==";

let clickLocalName = "";

window.addEventListener("DOMContentLoaded", init);

async function init() {
  run();
  let preMon = document.getElementById("preMon");
  let nextMon = document.getElementById("nextMon");
  preMon.addEventListener("click", function (event) {
    nextMon.style.display = "";
    stdMonth--;
    if (stdMonth < 1) {
      stdMonth = 12;
      stdYear--;
    }
    if (stdYear == 2020 && stdMonth == 1) {
      this.style.display = "none";
    }
    run();
  });
  nextMon.addEventListener("click", function (event) {
    preMon.style.display = "";

    stdMonth++;
    if (stdMonth > 12) {
      stdMonth = 1;
      stdYear++;
    }
    if (stdYear == max_year && stdMonth == max_month) {
      this.style.display = "none";
    }
    run();
  });
  if (stdYear == max_year && stdMonth == max_month) {
    nextMon.style.display = "none";
  }
}

async function run() {
  let regions_div = document.getElementById("regions_div");
  regions_div.style.width = "8%";
  regions_div.style.height = "5%";

  google.load("visualization", "1", { packages: ["geochart"] });
  await google.setOnLoadCallback(drawRegionsMap);
  titleChanege();
}

function titleChanege() {
  let title = document.getElementById("title");
  console.log(storageMap.get("아시아")[0].createDt);
  let standardDate = new Date(storageMap.get("아시아")[0].createDt);
  let str = `${standardDate.toLocaleDateString()} 기준 데이터`;
  title.innerHTML = `대륙별 코로나19 현황 <p style="font-size:12pt">${str}</p>`;
}

async function drawRegionsMap() {
  let promise = getCovid19NationState();
  await promise;
  console.log(storageMap);
  var data = google.visualization.arrayToDataTable([
    ["Region Code", "Continent", "누적 확진자", "누적 사망자"],
    [
      "142",
      "아시아",
      storageMap.get("아시아")[0].natDefCnt,
      storageMap.get("아시아")[0].natDeathCnt,
    ],
    ["150", "유럽", storageMap.get("유럽")[0].natDefCnt, storageMap.get("유럽")[0].natDeathCnt],
    [
      "019",
      "아메리카",
      storageMap.get("아메리카")[0].natDefCnt,
      storageMap.get("아메리카")[0].natDeathCnt,
    ],
    [
      "009",
      "오세아니아",
      storageMap.get("오세아니아")[0].natDefCnt,
      storageMap.get("오세아니아")[0].natDeathCnt,
    ],
    [
      "002",
      "아프리카",
      storageMap.get("아프리카")[0].natDefCnt,
      storageMap.get("아프리카")[0].natDeathCnt,
    ],
  ]);

  var options = {
    resolution: "continents",
    width: 800,
    height: 600,
  };
  var chart = new google.visualization.GeoChart(document.getElementById("regions_div"));
  google.visualization.events.addListener(chart, "regionClick", function (eventData) {
    // maybe you want to change the data table here...
    console.log(eventData.region);
    let localName = "";
    if (eventData.region == "142") {
      localName = CONTI.Asia;
    } else if (eventData.region == "002") {
      localName = CONTI.Africa;
    } else if (eventData.region == "009") {
      localName = CONTI.Oceania;
    } else if (eventData.region == "019") {
      localName = CONTI.Americas;
    } else if (eventData.region == "150") {
      localName = CONTI.Europe;
    }
    InsertLocalStorage(localName, storageMap.get(localName));

    window.open("./NatStatusBoard.html");
  });
  chart.draw(data, options);
}

function InsertLocalStorage(localName, values) {
  window.localStorage.clear();
  window.localStorage.setItem(localName, JSON.stringify(values));
}
async function getCovid19NationState() {
  let lastDay = new Date(stdYear, stdMonth, 0).getDate();
  let dateArr = [`${stdYear}`, `${stdMonth}`];
  let useYM = `${dateArr[0]}${dateArr[1].length == 1 ? "0" + dateArr[1] : dateArr[1]}`;
  const pageNo = 1;
  const numOfRows = 10;
  let startCreateDt = 20220930; //20200331 형식으로 만들어주기
  startCreateDt = `${useYM}01`;
  let endCreateDt = 20220930;
  endCreateDt = `${useYM}${lastDay}`;

  var url =
    "http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19NatInfStateJson"; /*URL*/
  var queryParams =
    "?" +
    encodeURIComponent("serviceKey") +
    "=" +
    encodeURIComponent(`${serviceKey}`); /*Service Key*/
  queryParams += "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent(`${pageNo}`); /**/
  queryParams +=
    "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent(`${numOfRows}`); /**/
  queryParams +=
    "&" + encodeURIComponent("startCreateDt") + "=" + encodeURIComponent(`${startCreateDt}`); /**/
  queryParams +=
    "&" + encodeURIComponent("endCreateDt") + "=" + encodeURIComponent(`${endCreateDt}`); /**/
  console.log(url + queryParams);
  await fetch(url + queryParams)
    .then((response) => response.text()) //fetch를 사용하는 경우 필수로 text화 시켜줘야함
    .then((data) => new window.DOMParser().parseFromString(data, "text/xml"))
    .then((xml) => {
      storageMap.clear();
      let innerMap = new Map();

      let totalCnt = xml.getElementsByTagName("totalCount")[0].textContent;
      let totalNatCnt = 216;
      console.log("totalCnt : " + totalCnt);
      for (let i = 0; i < totalCnt; i++) {
        let value = xml.getElementsByTagName("item")[i];
        let objByDay = {};

        let areaNm = value.childNodes[0].textContent;
        let createDt = value.childNodes[3].textContent;
        let natDeathCnt = value.childNodes[4].textContent;
        let natDefCnt = value.childNodes[6].textContent;

        objByDay.createDt = createDt;
        objByDay.natDeathCnt = parseInt(natDeathCnt);
        objByDay.natDefCnt = parseInt(natDefCnt);

        if (areaNm != "중동") {
          if (innerMap.has(areaNm)) {
            innerMap.get(areaNm).natDeathCnt += parseInt(natDeathCnt);
            innerMap.get(areaNm).natDefCnt += parseInt(natDefCnt);
          } else {
            innerMap.set(areaNm, objByDay);
          }
        } else {
          if (innerMap.has(CONTI.Asia)) {
            innerMap.get(CONTI.Asia).natDeathCnt += parseInt(natDeathCnt);
            innerMap.get(CONTI.Asia).natDefCnt += parseInt(natDefCnt);
          } else {
            innerMap.set(CONTI.Asia, objByDay);
          }
        }

        // if ((i % totalNatCnt == 0 && i != 0) || i == totalCnt - 1) {
        if (value.childNodes[7].textContent == "한국") {
          for (let key of innerMap.keys()) {
            if (storageMap.has(key)) {
              let arrVal = storageMap.get(key);
              arrVal.push(innerMap.get(key));
              storageMap.set(key, arrVal);
            } else {
              storageMap.set(key, [innerMap.get(key)]);
            }
          }
          innerMap.clear();
        }
      }
    });
}
