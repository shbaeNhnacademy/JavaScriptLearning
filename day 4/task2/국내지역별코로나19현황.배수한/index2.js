"use strict";
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

function init() {
  drawTable_localNames();

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
    drawTable_localNames();
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
    drawTable_localNames();
  });
  if (stdYear == max_year && stdMonth == max_month) {
    nextMon.style.display = "none";
  }
}

async function drawTable_localNames() {
  let promise = getCovid19LocalState();
  await promise;
  let table = document.getElementById("table");
  removeAllchild(table);

  let capt = document.createElement("caption");
  let standardDate = new Date(storageMap.get("광주")[0].createDt);
  capt.innerHTML = `${standardDate.toLocaleDateString()} 기준 데이터`;
  capt.style.textAlign = "left";
  table.appendChild(capt);

  let tableHeaderTr = document.createElement("tr");
  tableHeaderTr.className = "tableHeader";
  let cdtTh = document.createElement("th");
  cdtTh.innerHTML = "지역";
  tableHeaderTr.appendChild(cdtTh);

  let dcdTh = document.createElement("th");
  dcdTh.innerHTML = "누적 확진자 수";
  tableHeaderTr.appendChild(dcdTh);

  let dthTh = document.createElement("th");
  dthTh.innerHTML = "누적 사망자 수";
  tableHeaderTr.appendChild(dthTh);

  let idDecTh = document.createElement("th");
  idDecTh.innerHTML = "전일대비 증감 수";
  tableHeaderTr.appendChild(idDecTh);
  table.appendChild(tableHeaderTr);

  for (let key of storageMap.keys()) {
    let tableTr = document.createElement("tr");
    tableTr.className = "tableTr";

    let nameTd = document.createElement("td");
    if (key == "합계") {
      nameTd.innerHTML = key;
    } else {
      nameTd.innerHTML = `<a target="_blank" name=${key} href="./StatusBoard.html" onclick="AnchorClick(this);">${key}</a>`;
    }
    tableTr.appendChild(nameTd);

    let dcdTd = document.createElement("td");
    dcdTd.innerHTML = storageMap.get(key)[0].decideCnt;
    tableTr.appendChild(dcdTd);

    let dthTd = document.createElement("td");
    dthTd.innerHTML = storageMap.get(key)[0].deathCnt;
    tableTr.appendChild(dthTd);

    let inDecTd = document.createElement("td");
    if (storageMap.get(key).incDec != null) {
      inDecTd.innerHTML = storageMap.get(key)[0].incDec;
    } else {
      inDecTd.innerHTML = "-";
    }
    tableTr.appendChild(inDecTd);
    if (key == "합계") {
      tableTr.className = "tfoot";
    }
    table.appendChild(tableTr);
  }
}

function AnchorClick(aTag) {
  let localName = aTag.textContent;

  InsertLocalStorage(localName, storageMap.get(localName));
}

function InsertLocalStorage(localName, values) {
  window.localStorage.clear();
  window.localStorage.setItem(localName, JSON.stringify(values));
}

function removeAllchild(parent) {
  while (parent.hasChildNodes()) {
    parent.removeChild(parent.firstChild);
  }
}

async function getCovid19LocalState() {
  let lastDay = new Date(stdYear, stdMonth, 0).getDate();
  let dateArr = [`${stdYear}`, `${stdMonth}`];
  let useYM = `${dateArr[0]}${dateArr[1].length == 1 ? "0" + dateArr[1] : dateArr[1]}`;
  const pageNo = 1;
  const numOfRows = 10;
  let startCreateDt = 20200416; //20200331 형식으로 만들어주기
  startCreateDt = `${useYM}01`;
  let endCreateDt = 20200416;
  endCreateDt = `${useYM}${lastDay}`;

  var url =
    "http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19SidoInfStateJson"; /*URL*/
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

  await fetch(url + queryParams)
    .then((response) => response.text()) //fetch를 사용하는 경우 필수로 text화 시켜줘야함
    .then((data) => new window.DOMParser().parseFromString(data, "text/xml"))
    .then((xml) => {
      storageMap.clear();
      let totalCnt = xml.getElementsByTagName("totalCount")[0].textContent;
      for (let i = 0; i < totalCnt; i++) {
        let value = xml.getElementsByTagName("item")[i];
        let objByDay = {};
        let keyLocalName = "";
        for (let tag of value.childNodes) {
          if (tag.nodeName === "gubun") {
            keyLocalName = tag.textContent;
          } else if (tag.nodeName === "createDt") {
            objByDay.createDt = tag.textContent;
          } else if (tag.nodeName === "defCnt") {
            objByDay.decideCnt = tag.textContent;
          } else if (tag.nodeName === "deathCnt") {
            objByDay.deathCnt = tag.textContent;
          } else if (tag.nodeName === "incDec") {
            objByDay.incDec = tag.textContent;
          } else if (tag.nodeName === "updateDt") {
            objByDay.updateDt = tag.textContent;
          }
        }

        if (storageMap.has(keyLocalName)) {
          let arrVal = storageMap.get(keyLocalName);
          arrVal.push(objByDay);
          storageMap.set(keyLocalName, arrVal);
        } else {
          storageMap.set(keyLocalName, [objByDay]);
        }
      }
    });
}
