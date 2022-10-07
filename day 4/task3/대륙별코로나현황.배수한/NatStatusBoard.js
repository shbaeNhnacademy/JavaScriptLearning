"use strict";
let myls = window.localStorage;

let gLocalName = "";

window.addEventListener("DOMContentLoaded", init);

function init() {
  drawTable();

  let tolist = document.getElementById("tolist");
  tolist.addEventListener("click", function () {
    window.close();
  });
}

async function drawTable() {
  const covidStateArr = getCovid19InfState();
  let table = document.getElementById("table_status");
  removeAllchild(table);
  chartDraw(covidStateArr);

  let capt = document.createElement("caption");
  let standardDate = new Date(covidStateArr[0].createDt);
  capt.innerHTML = `${standardDate.toLocaleDateString()} 기준 ${gLocalName} 데이터`;
  capt.style.textAlign = "left";
  table.appendChild(capt);

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

  for (let state of covidStateArr) {
    let tableTr = document.createElement("tr");
    tableTr.className = "tableTr";
    let cdtTd = document.createElement("td");
    cdtTd.innerHTML = state.createDt;
    tableTr.appendChild(cdtTd);

    let dcdTd = document.createElement("td");
    dcdTd.innerHTML = state.natDefCnt;
    tableTr.appendChild(dcdTd);

    let dthTd = document.createElement("td");
    dthTd.innerHTML = state.natDeathCnt;
    tableTr.appendChild(dthTd);

    let updTd = document.createElement("td");
    updTd.innerHTML = "-";
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
  for (let i = 0; i < myls.length; i++) {
    gLocalName = myls.key(i);
  }
  let values = JSON.parse(myls.getItem(gLocalName));
  return values;
}

function chartDraw(covidStateArr) {
  const foot = document.getElementById("footer");
  removeAllchild(foot);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("id", "myChart");
  canvas.width = "100%";
  canvas.height = "100%";

  const ctx = canvas.getContext("2d");

  const xAxisData = [];
  for (let state of covidStateArr) {
    let date = new Date(state.createDt);
    xAxisData.push(date.toLocaleDateString());
  }

  const yAxisDtd = [];
  const yAxisDcd = [];
  for (let val of covidStateArr) {
    yAxisDcd.push(val.natDefCnt);
    yAxisDtd.push(val.natDeathCnt);
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
