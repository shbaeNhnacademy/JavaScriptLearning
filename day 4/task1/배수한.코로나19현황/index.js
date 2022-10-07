"use strict";
let storageMap = new Map();
let stdDate = new Date();
let stdYear = stdDate.getFullYear();
let stdMonth = stdDate.getMonth() + 1; //해당 월의 전달 부터 시작

const max_year = stdYear;
const max_month = stdMonth;
const min_year = 2019;
const min_month = 12;

const serviceKey =
  "lBC0qPUVGFfXZrKZo89+Kzsjh+laBxPyRt15hG0fl9FJb8c2QdybFSVgqC5NI9/SfaKucjXmB+ihGKmZxDALmQ==";
// const serviceKey =
//   "lBC0qPUVGFfXZrKZo89%2BKzsjh%2BlaBxPyRt15hG0fl9FJb8c2QdybFSVgqC5NI9%2FSfaKucjXmB%2BihGKmZxDALmQ%3D%3D";

window.addEventListener("DOMContentLoaded", init);

function init() {
  drawTable();
  let preMon = document.getElementById("preMon");
  let nextMon = document.getElementById("nextMon");
  preMon.addEventListener("click", function (event) {
    nextMon.style.display = "";
    event.preventDefault();
    stdMonth--;
    if (stdMonth < 1) {
      stdMonth = 12;
      stdYear--;
    }
    if (stdYear == 2020 && stdMonth == 1) {
      this.style.display = "none";
    }
    drawTable();
  });
  nextMon.addEventListener("click", function (event) {
    preMon.style.display = "";

    event.preventDefault();

    stdMonth++;
    if (stdMonth > 12) {
      stdMonth = 1;
      stdYear++;
    }
    if (stdYear == max_year && stdMonth == max_month) {
      this.style.display = "none";
    }
    drawTable();
  });
  if (stdYear == max_year && stdMonth == max_month) {
    nextMon.style.display = "none";
  }
}

async function drawTable() {
  console.log("draw Table");
  let promise = getCovid19InfState();
  await promise;
  console.log(storageMap);
  let table = document.getElementById("table");
  removeAllchild(table);
  chartDraw();

  let tableHeaderTr = document.createElement("tr");
  tableHeaderTr.className = "tableHeader";
  let cdtTh = document.createElement("th");
  cdtTh.innerHTML = "기준 일자";
  cdtTh.className = "time";
  tableHeaderTr.appendChild(cdtTh);

  let dcdTh = document.createElement("th");
  dcdTh.innerHTML = "누적 확진자 수";
  tableHeaderTr.appendChild(dcdTh);

  let dthTh = document.createElement("th");
  dthTh.innerHTML = "누적 사망자 수";
  tableHeaderTr.appendChild(dthTh);

  let updTh = document.createElement("th");
  updTh.innerHTML = "업데이트 일자";
  updTh.className = "time";
  tableHeaderTr.appendChild(updTh);
  table.appendChild(tableHeaderTr);

  for (let key of storageMap.keys()) {
    let tableTr = document.createElement("tr");
    tableTr.className = "tableTr";
    console.log(storageMap.get(key));
    let cdtTd = document.createElement("td");
    cdtTd.innerHTML = storageMap.get(key).createDt;
    tableTr.appendChild(cdtTd);

    let dcdTd = document.createElement("td");
    dcdTd.innerHTML = storageMap.get(key).decideCnt;
    tableTr.appendChild(dcdTd);

    let dthTd = document.createElement("td");
    dthTd.innerHTML = storageMap.get(key).deathCnt;
    tableTr.appendChild(dthTd);

    let updTd = document.createElement("td");
    if (storageMap.get(key).updateDt != null) {
      updTd.innerHTML = storageMap.get(key).updateDt;
    } else {
      updTd.innerHTML = "-";
    }
    tableTr.appendChild(updTd);

    table.appendChild(tableTr);
  }
}

function removeAllchild(parent) {
  while (parent.hasChildNodes()) {
    parent.removeChild(parent.firstChild);
  }
}

function getCovid19InfState() {
  storageMap.clear();
  let lastDay = new Date(stdYear, stdMonth, 0).getDate();
  let dateArr = [`${stdYear}`, `${stdMonth}`];
  let useYM = `${dateArr[0]}${dateArr[1].length == 1 ? "0" + dateArr[1] : dateArr[1]}`;
  const promise = new Promise(function (resolve, reject) {
    const pageNo = 1;
    const numOfRows = 10;
    // if (dateArr[1] == 4 || dateArr[1] == 6 || dateArr[1] == 9 || dateArr[1] == 11) {
    //   lastDay = 30;
    // } else if (dateArr[1] == 2) {
    //   lastDay = 28;
    // }
    console.log(lastDay);
    let startCreateDt = 20200416; //20200331 형식으로 만들어주기
    startCreateDt = `${useYM}01`;
    let endCreateDt = 20200418;
    endCreateDt = `${useYM}${lastDay}`;
    console.log("endCreateDt : " + endCreateDt);
    const xhr = new XMLHttpRequest();
    var url =
      "http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19InfStateJson"; /*URL*/
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

    console.log("URL :: " + url + queryParams);
    xhr.open("GET", url + queryParams);
    xhr.onreadystatechange = function () {
      if (this.readyState == 4) {
        console.log("Status : " + this.status);
        console.log("nHeaders: " + JSON.stringify(this.getAllResponseHeaders()));
        console.log("nBody: " + this.responseText);
        resolve(this.responseText);
      }
    };
    xhr.send("");
  }).then(function (xml) {
    let xmlParser = new DOMParser(); //DOM파서 객체를 생성
    let xmlDoc = xmlParser.parseFromString(xml, "text/xml"); // parseFromString() 메소드를 이용해 문자열을 파싱함.
    let totalCnt = xmlDoc.getElementsByTagName("totalCount")[0].textContent;
    console.log(totalCnt);
    for (let i = 0; i < totalCnt; i++) {
      //   console.log("======================================");
      let value = xmlDoc.getElementsByTagName("item")[i];
      let objByDay = {};
      let keyCreateDt = "";
      for (let tag of value.childNodes) {
        // console.log(tag.nodeName + " : " + tag.textContent); // HTML
        // nodeName으로 어떤 항목인지 알아내고
        // textContent로 값 받아오면 됨
        if (tag.nodeName === "stateDt") {
          keyCreateDt = tag.textContent;
        } else if (tag.nodeName === "createDt") {
          objByDay.createDt = tag.textContent;
        } else if (tag.nodeName === "decideCnt") {
          objByDay.decideCnt = tag.textContent;
        } else if (tag.nodeName === "deathCnt") {
          objByDay.deathCnt = tag.textContent;
        } else if (tag.nodeName === "updateDt") {
          objByDay.updateDt = tag.textContent;
        }
      }
      storageMap.set(keyCreateDt, objByDay);
    }
  });
  return promise;
}

function chartDraw() {
  const foot = document.getElementById("footer");
  removeAllchild(foot);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("id", "myChart");
  // const canvas = document.getElementById("myChart");
  canvas.width = "100%";
  canvas.height = "100%";

  const ctx = canvas.getContext("2d");

  const xAxisData = [];
  for (let key of storageMap.keys()) {
    console.log(key.substr(0, 4) + "  " + key.substr(4, 2) + "  " + key.substr(6, 2));
    let date = new Date(key.substr(0, 4), key.substr(4, 2) - 1, key.substr(6, 2));
    xAxisData.push(date.toLocaleDateString());
  }

  const yAxisDcd = [];
  for (let val of storageMap.values()) {
    yAxisDcd.push(val.decideCnt);
  }

  const yAxisDtd = [];
  for (let val of storageMap.values()) {
    yAxisDtd.push(val.deathCnt);
  }
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: xAxisData.reverse(),
      datasets: [
        {
          label: "확진자 (누적)",
          data: yAxisDcd.reverse(),
          borderWidth: 3,
          borderColor: "red",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
        },
        {
          label: "사망자 (누적)",
          data: yAxisDtd.reverse(),
          borderWidth: 3,
          borderColor: "blue",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
      ],
    },
    options: {
      scales: {
        y: {
          // suggestedMin: 50,
          // suggestedMax: 100,
        },
      },
    },
  });
  foot.appendChild(canvas);
}
