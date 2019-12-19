document.addEventListener('DOMContentLoaded', () => {
  const eventName = document.querySelector('#events');
  const totalResponses = document.querySelector('#total-responses');
  const sort = document.querySelector('#sort');

  const reverse = document.querySelector('.reverse');
  const options = document.querySelector('.options');
  const reload = document.querySelector('.reload');
  const resultContent = document.querySelector('.result-content');
  const tbody = document.querySelector('tbody');
  const preloader = document.querySelector('.preloader');

  let responses;
  let results;

  const requestAjax = (xhttp, ajaxRequestData, path) => {
    xhttp.open('POST', `/events/${path}`, true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(ajaxRequestData));
  }

  const addToResults = (e) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () => {
      if (xhttp.status === 200) {
        console.log(xhttp.responseText);
      }
    };
    xhttp.onerror = () => {
      console.log('Error occured at addToResults');
    };
    const participantResponseData = {
      eventCode: eventName.value,
      eventName: eventName.querySelectorAll('option')[eventName.selectedIndex].innerText,
      name: e.target.getAttribute('data-name'),
      college: e.target.getAttribute('data-college'),
    };
    requestAjax(xhttp, participantResponseData, 'results');
  };

  function preloaderVisibility(state) {
    preloader.style.display = state;
  }

  function sortResponses() {
    if (sort.value === 'name' || sort.value === 'college') {
      responses.sort((a, b) => {
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
    } else if (sort.value === 'score') {
      responses.sort((a, b) => b.score - a.score);
    }
  }

  function print() {
    totalResponses.innerText = `Total Responses = ${responses.length}`;
    responses.forEach((ele) => {
      const name = `${ele.user.name} ${ele.user.friendName ? `<br> ${ele.user.friendName}` : ``}`;
      const college = `${ele.user.college} ${ele.user.friendName ? `<br> ${ele.user.friendCollege}` : ``}`;
      const email = `${ele.user.email} ${ele.user.friendName ? `<br> ${ele.user.friendEmail}` : ``}`;
      const number = `${ele.user.number} ${ele.user.friendName ? `<br> ${ele.user.friendNumber}` : ``}`;
      const tableRow = document.createElement('tr');
      let div1;
      div1 = `
        <td>${name} </td>
        <td>${college}</td>
        <td>${email} </td>
        <td>${number} </td>
        <td>${ele.score}</td>
        <td><a class="waves-effect waves-teal btn-flat blue-text" href="/events/responses/view?eventCode=${eventName.value}&email=${ele.user.email}">view</a></td>
        <td><div class="switch"><label>remove<input type="checkbox"
        `;
      const tempResult = results.find((r) => r.name === name);
      if (tempResult) {
        div1 += `checked `;
      }
      div1 += `data-name="${name}" data-college="${college}"><span class="lever"></span>Add</label></div></td>`;
      tableRow.innerHTML = div1;
      tbody.appendChild(tableRow);
    });
  }
  const resetResult = () => {
    totalResponses.innerText = '';
    tbody.innerText = '';
  }
  function printV2() {
    sortResponses();
    resetResult();
    print();
  }

  function printV3() {
    responses.reverse();
    resetResult();
    print();
  }
  const processResult = () => {
    print();
    const participants = document.querySelectorAll('input[type=checkbox]');
    participants.forEach((ele) => {
      ele.addEventListener('change', addToResults);
    });
  };

  function resultContentVisibility(state) {
    resultContent.style.display = state;
  }
  function resetSort() {
    sort.selectedIndex = 0;
  }
  function ajaxParticipantsResponse() {
    const xhttp = new XMLHttpRequest();
    preloaderVisibility('block');
    resetResult();
    resultContentVisibility('none');
    xhttp.onload = () => {
      if (xhttp.status == 200) {
        preloaderVisibility('none');
        const received = JSON.parse(xhttp.responseText);
        responses = received.responses;
        results = received.results;
        resetSort();
        processResult();
        resultContentVisibility('block');
      }
    };
    xhttp.onerror = () => {
      console.log('Error occured at ajaxParticipantsResponse');
    };
    const eventData = {
      eventCode: eventName.value,
    };
    requestAjax(xhttp, eventData, 'responses');
  }

  function reloadAnimation() {
    reload.classList.toggle('flip');
  }

  function init() {
    options.style.display = 'none';
    preloaderVisibility('none');
    resultContentVisibility('none');

    eventName.addEventListener('change', ajaxParticipantsResponse);
    reload.addEventListener('click', ajaxParticipantsResponse);
    sort.addEventListener('change', printV2);
    reverse.addEventListener('click', printV3);
    reload.addEventListener('click', reloadAnimation);

    eventName.addEventListener('change', () => {
      options.style.display = 'block';
    }, { once: true });

    document.querySelector('a[href="/events/responses"]').parentNode.classList.toggle('active');
    M.FormSelect.init(document.querySelectorAll('select'));
  }
  init();
});