document.addEventListener('DOMContentLoaded', () => {

  const options = document.querySelector('.options');
  const reload = document.querySelector('.reload');
  const resultContent = document.querySelector('.result-content');
  const tbody = document.querySelector('tbody');
  const preloader = document.querySelector('.preloader');
  const reverse = document.querySelector('.reverse');

  const eventName = document.querySelector('#events');
  const totalRequests = document.querySelector('#total-requests');
  const requestsAllowed = document.querySelector('#requests-allowed');
  const hasStarted = document.querySelector('#has-started');
  const hasCompleted = document.querySelector('#has-completed');
  const sort = document.querySelector('#sort');

  let requests;


  const requestAjax = (xhttp, ajaxRequestData) => {
    xhttp.open('POST', '/events/requests', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(ajaxRequestData));
  }

  const allowQuiz = (e) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onerror = () => {
      console.log('Error occured at allowQuiz');
    };
    const participantData = {
      email: e.target.value,
      eventCode: eventName.value,
    };
    requestAjax(xhttp, participantData);
  }


  function sortRequests() {
    if (sort.value === 'name' || sort.value === 'college') {
      requests.sort((a, b) => {
        const nameA = a[`${sort.value}`].toUpperCase();
        const nameB = b[`${sort.value}`].toUpperCase();
        if (nameA > nameB) {
          return 1;
        }
        if (nameA < nameB) {
          return -1;
        }
        return 0;
      });
    } else if (sort.value === 'isAllowed' || sort.value === 'hasStarted' || sort.value === 'hasCompleted') {
      requests.sort((a, b) => {
        const nameA = a[`${sort.value}`];
        const nameB = b[`${sort.value}`];
        if (nameA === nameB) { return 0; }
        if (nameA) { return -1; }
        return 1;
      });
    }
  }

  function print() {
    totalRequests.innerText = `Total requests = ${requests.length}`;
    let allowed = 0;
    let started = 0;
    let completed = 0;

    requests.forEach((ele) => {
      const tableRow = document.createElement('tr');
      tableRow.innerHTML = `
      <td>${ele.name}</td><td>${ele.email}</td><td>${ele.college}</td>
      <td>
      <div class="switch">
        <label>
            Disallow
            <input type="checkbox" value="${ele.email}" ${ele.isAllowed ? ` checked ` : ` unchecked `} >
            <span class="lever"></span>
            Allow
        </label>
      </div>
      </td>
      <td>${ele.hasStarted ? ` <a class="material-icons">check</a> ` : `<a class="material-icons">clear</a> `}</td>
      <td>${ele.hasCompleted ? `<a class="material-icons">check</a>` : ` <a class="material-icons">clear</a>`}</td>
      `;
      if (ele.isAllowed) {
        allowed += 1;
      }
      if (ele.hasStarted) {
        started += 1;
      }
      if (ele.hasCompleted) {
        completed += 1;
      }
      tbody.appendChild(tableRow);
    });
    requestsAllowed.innerText = `Requests allowed = ${allowed}`;
    hasStarted.innerText = `Has started = ${started}`;
    hasCompleted.innerText = `Has Completed = ${completed}`;
  }

  const resetResult = () => {
    totalRequests.innerText = '';
    requestsAllowed.innerText = '';
    hasStarted.innerText = '';
    hasCompleted.innerText = '';
    tbody.innerText = '';
  }

  function printV2() {
    sortRequests();
    resetResult();
    print();
  }

  function printV3() {
    requests.reverse();
    resetResult();
    print();
  }

  function processResult() {
    print();
    const participants = document.querySelectorAll('input[type=checkbox]');
    participants.forEach((ele) => {
      ele.addEventListener('change', allowQuiz);
    });
  }

  function resetSort() {
    sort.selectedIndex = 0;
  }

  function resultContentVisibility(state) {
    resultContent.style.display = state;
  }

  function preloaderVisibility(state) {
    preloader.style.display = state;
  }

  function ajaxParticipantsRequests() {
    const xhttp = new XMLHttpRequest();
    preloaderVisibility('block');
    resetResult();
    resultContentVisibility('none');
    xhttp.onload = () => {
      if (xhttp.status == 200) {
        preloaderVisibility('none');
        requests = JSON.parse(xhttp.responseText);
        resetSort();
        processResult();
        resultContentVisibility('block');
      }
    };
    xhttp.onerror = () => {
      console.log('Error occured during ajaxParticipantsRequest');
    };
    const eventData = {
      email: null,
      eventCode: eventName.value,
    };
    requestAjax(xhttp, eventData);
  }

  function reloadAnimation() {
    reload.classList.toggle('flip');
  }

  function init() {
    options.style.display = 'none';
    resultContentVisibility('none');
    preloaderVisibility('none');

    eventName.addEventListener('change', ajaxParticipantsRequests);
    sort.addEventListener('change', printV2);
    reverse.addEventListener('click', printV3);
    reload.addEventListener('click', ajaxParticipantsRequests);
    reload.addEventListener('click', reloadAnimation);

    eventName.addEventListener('change', () => {
      options.style.display = 'block';
    }, { once: true });

    M.FormSelect.init(document.querySelectorAll('select'));
    document.querySelectorAll('a[href="/events/requests"]').forEach((ele) => {
      ele.parentNode.classList.toggle('active');
    });
  }
  init();
});
