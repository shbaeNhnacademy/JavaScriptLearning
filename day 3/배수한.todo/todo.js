"use strict";
window.addEventListener("DOMContentLoaded", init);

let now = new Date();
let nowYear = now.getFullYear();
let nowMonth = now.getMonth() + 1;

/** init
 *  js 파일을 활성화 하기 위한 함수
 *  form과 관련된 버튼에 event를 생성함
 */
function init() {
  let form = document.querySelector(".todoForm");
  let textbox = document.querySelector(".todoText");
  drawTodoList();
  form.addEventListener("submit", btnClickEvent);
  textbox.onkeydown = function (e) {
    if (e.keyCode == 13) {
      console.log("Enter in");
      btnClickEvent;
    }
  };

  let preMon = document.getElementById("preMon");
  preMon.addEventListener("click", function (event) {
    event.preventDefault();
    nowMonth--;
    if (nowMonth < 1) {
      nowMonth = 12;
      nowYear--;
    }
    drawTodoList();
  });
  let nextMon = document.getElementById("nextMon");
  nextMon.addEventListener("click", function (event) {
    event.preventDefault();
    nowMonth++;
    if (nowMonth > 12) {
      nowMonth = 1;
      nowYear++;
    }
    drawTodoList();
  });

  let wCheck = document.getElementById("workCheck");
  wCheck.addEventListener("change", function (e) {
    e.preventDefault();
    drawTodoList();
  });

  let oCheck = document.getElementById("ownCheck");
  oCheck.addEventListener("change", function (e) {
    e.preventDefault();
    drawTodoList();
  });

  let todoRemove = document.getElementById("todoRemove");
  todoRemove.addEventListener("click", function (e) {
    e.preventDefault();
    deleteTodoAll();
  });

  printLocalStorage();
}

/** drawTodoList
 *  로컬 스토리지에 저장되어있는 To Do List 요소들을 그려내주는 함수
 */

function drawTodoList() {
  //일자 박스 초기화
  let main = document.querySelector("main");
  removeAllchild(main);
  //년, 월 초기화
  let nowMon = document.getElementById("nowMon"); //#넣지마
  nowMon.innerText = `${nowYear}년 ${nowMonth}월`; //달 만 0~11
  //todo list를 날짜순으로 정렬하기 위한 함수
  let sorted = SortLocalStorage();
  if (sorted == null) {
    sorted = 0;
  }
  const myls = window.localStorage;
  //로컬 스토리지에 저장된 날짜 갯수만큼 for 루프
  for (let i = 0; i < sorted.length; i++) {
    const key = sorted[i];
    let tempMon = new Date(key).getMonth() + 1;
    let tempYear = new Date(key).getFullYear();
    //연도와 달이 동일하면 true
    if (nowMonth === tempMon && nowYear === tempYear) {
      const val = JSON.parse(myls.getItem(key));

      //main에 날짜를 아이디로 가지는 박스1 만들기
      let divE = document.createElement("div");
      let main = document.querySelector("main");
      divE.setAttribute("id", `${key}`);
      divE.className = "listOuterBox";
      main.appendChild(divE);

      let newDate = new Date(key);
      //박스1 자녀로 왼쪽에 날짜박스 할당
      let dateDiv = document.createElement("div");
      let dateSection = document.getElementById(`${key}`);
      dateDiv.className = "listDateBox";
      dateDiv.innerHTML = `<p class="dateWord">${newDate.getDate()}</p>  ${getDayOfWeek(newDate)}`;
      dateSection.appendChild(dateDiv);
      let wCheck = document.getElementById("workCheck").checked;
      let oCheck = document.getElementById("ownCheck").checked;
      let workUl;
      let workKernelDiv;
      let idx = 1;
      let idx_w = 1;
      let idx_o = 1;
      if (wCheck) {
        //박스1 자녀로 오른쪽 윗칸에 워크 박스 할당
        let workDiv = document.createElement("div");
        workDiv.className = "listContentsBox";
        dateSection.appendChild(workDiv);

        //워크 박스에 타이틀 박스(회사) 만들기
        let workTitleDiv = document.createElement("div");
        workTitleDiv.className = "listTitleBox";
        workTitleDiv.innerHTML = "회사";
        idx_w = idx;
        dateSection.childNodes[idx++].appendChild(workTitleDiv);

        //워크박스에 붙일 커널 박스와 list 생성
        workKernelDiv = document.createElement("div");
        workKernelDiv.className = "listKernelBox";
        workUl = document.createElement("ul");
        workUl.className = "ulStyle";
      }

      let ownUl;
      let ownKernelDiv;
      if (oCheck) {
        //박스1 자녀로 오른쪽 아랫칸에 개인박스 할당
        let ownDiv = document.createElement("div");
        ownDiv.className = "listContentsBox";
        dateSection.appendChild(ownDiv);

        //워크 박스에 타이틀 박스(개인) 만들기
        let ownTitleDiv = document.createElement("div");
        ownTitleDiv.className = "listTitleBox";
        ownTitleDiv.innerHTML = "개인";
        idx_o = idx;
        dateSection.childNodes[idx].appendChild(ownTitleDiv);

        //개인박스에 붙일 커널 박스와 list 생성
        ownKernelDiv = document.createElement("div");
        ownKernelDiv.className = "listKernelBox";
        ownUl = document.createElement("ul");
        ownUl.className = "ulStyle";
      }

      //li를 요소 개수에 맞게 만들고 ui의 자녀로 add한다
      for (let info in val) {
        let temp = val[info];
        if (temp.cat == "회사" && wCheck) {
          workUl.appendChild(accumulateLi(temp));
          workKernelDiv.appendChild(workUl);
          dateSection.childNodes[idx_w].appendChild(workKernelDiv);
        } else if (temp.cat == "개인" && oCheck) {
          ownUl.appendChild(accumulateLi(temp));
          ownKernelDiv.appendChild(ownUl);
          dateSection.childNodes[idx_o].appendChild(ownKernelDiv);
        }
      }
    }
  }
}

/** accumulateLi
 *  워크박스 혹은 개인박스에 li로 요소들을 차례대로 축적하기 위한 함수
 */
function accumulateLi(value) {
  let li = document.createElement("li");
  li.className = "liStyle";
  let input = document.createElement("input");
  let fontSize = 12;
  input.type = "text";
  input.readOnly = true;
  input.style.fontSize = `${fontSize}pt`;
  input.value = `${value.todo}`;
  input.style.width = `${input.value.length * fontSize + 1}pt`;
  li.style.width = `${input.value.length * fontSize + 2}pt`;
  input.className = "listInputStyle";
  input.addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm(`${value.date} 날짜의 "${value.todo}" 일정을 삭제하시겠습니까?`)) {
      let isOkay = deleteTodo(value);
      if (isOkay) {
        drawTodoList();
      } else {
        alert("해당하는 요소는 존재하지 않습니다");
      }
    }
  });
  li.appendChild(input);
  return li;
}

/** deleteTodo
 *  todo 요소들을 삭제하기 위한 함수
 */
function deleteTodo(info) {
  let arrVal = JSON.parse(window.localStorage.getItem(info.date));
  const itemTofind = arrVal.find(function (item) {
    return item.todo === info.todo;
  });
  const idx = arrVal.indexOf(itemTofind);
  console.log("deleteTodo - idx = " + idx);
  if (idx > -1) {
    arrVal.splice(idx, 1);
    if (arrVal.length == 0) {
      window.localStorage.removeItem(`${info.date}`);
      //   printLocalStorage();
    } else {
      window.localStorage.setItem(info.date, JSON.stringify(arrVal));
    }
  } else {
    return false;
  }

  return true;
}

/** deleteTodoAll
 *  해당 월에 관련한 요소들을 모두 삭제하는 함수
 *  deleteTodo()를 사용하여 요소들을 삭제한다
 */
function deleteTodoAll() {
  let delIdx = 0;
  while (true) {
    const key = window.localStorage.key(delIdx);
    let keyDate = new Date(key);
    if (keyDate.getMonth() + 1 == nowMonth && keyDate.getFullYear() == nowYear) {
      const val = JSON.parse(window.localStorage.getItem(key));
      for (let info in val) {
        let temp = val[info];
        let isOkay = deleteTodo(temp);
        if (!isOkay) {
          delIdx++;
        }
      }
    } else {
      delIdx++;
    }
    if (!key) {
      break;
    }
  }

  alert(`${nowYear}년 ${nowMonth}월 의 일정이 모두 삭제 되었습니다.`);
  drawTodoList();
}

/** removeAllchild
 *  To Do List를 다시그려내기 위해 div에 연결된 자녀들을 모두 삭제하는 함수
 */
function removeAllchild(parent) {
  while (parent.hasChildNodes()) {
    parent.removeChild(parent.firstChild);
  }
}

/** SortLocalStorage
 *  localStorage에 요소들이 저장 될 때, 무작위로 저장되므로 연-월-일로 sorting된 데이터를 얻기 위해 사용하는 함수
 */
function SortLocalStorage() {
  if (localStorage.length > 0) {
    var localStorageArray = new Array();
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);

      localStorageArray[i] = key;
    }
    var sortedArray = localStorageArray.sort();
  }

  return sortedArray;
}

/** getDayOfWeek
 *  요일을 한글로 return 함수
 */
function getDayOfWeek(날짜문자열) {
  const week = ["일", "월", "화", "수", "목", "금", "토"];

  const dayOfWeek = week[new Date(날짜문자열).getDay()];

  let ret = `<p class="dateWord"">${dayOfWeek}</p>`;
  if (dayOfWeek === "토") {
    ret = `<p class="dateWord" style="color:blue">${dayOfWeek}</p>`;
  } else if (dayOfWeek === "일") {
    ret = `<p class="dateWord" style="color:red">${dayOfWeek}</p>`;
  }

  return ret;
}

/** btnClickEvent
 *  저장 버튼 혹은 textbox에서 엔터를 치면 실행되는 함수
 *  localStorage에 입력하고자 하는 값들을 넣고 화면을 draw하는 함수
 */
function btnClickEvent(event) {
  event.preventDefault();
  let todoText = document.querySelector(".todoText");
  let todoDate = document.querySelector(".todoDate");
  let todoCombo = document.querySelector(".todoCombo");
  let info = {
    date: todoDate.value,
    cat: todoCombo.value,
    todo: todoText.value,
  };
  handleSameKey(info);
  console.log(info.date + " " + info.cat + "  " + info.todo);

  drawTodoList();
  alert("일정이 등록 되었습니다. \n\n" + info.date + " [" + info.cat + "]  " + info.todo);

  printLocalStorage();
  clearInput();
}

/** clearInput
 *  input태그들을 초기화해주는 함수
 */
function clearInput() {
  let todoText = document.querySelector(".todoText");
  let todoDate = document.querySelector(".todoDate");
  let todoCombo = document.querySelector(".todoCombo");
  todoText.value = null;
  todoDate.value = null;
}

/** handleSameKey
 *  동일한 키 값 여부에 따라 value를 삽입
 */
function handleSameKey(info) {
  if (window.localStorage.getItem(info.date) != null) {
    //로컬스토리지에 해당 키값이 있을때
    let arrVal = JSON.parse(window.localStorage.getItem(info.date));
    arrVal.push(info);
    window.localStorage.setItem(info.date, JSON.stringify(arrVal));
  } else {
    const arrObj = [info];
    window.localStorage.setItem(info.date, JSON.stringify(arrObj));
  }
}

/** printLocalStorage
 *  로컬스토리지의 내부요소를 print하는 함수
 */
function printLocalStorage() {
  console.log("=============");
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    const val = window.localStorage.getItem(key);
    console.log(key + " : " + val);
  }
}
