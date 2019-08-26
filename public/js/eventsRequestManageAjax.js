document.addEventListener('DOMContentLoaded', () => {

  const allowQuiz = (participant) => {
    console.log(participant.target.value);
    const xhttp = new XMLHttpRequest();
    xhttp.onerror = function () {
      console.log('Error occured');
    };
    const data = {
      email: participant.target.value,
      event: eventName.value,
    };
    console.log(data);
    xhttp.open('POST', '/events/requests', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
  }

  const processResult = (requests) => {
    if (!requests.length) {
      document.querySelector('.results').innerHTML = `<h3>No requests for Event -- ${document.querySelector('#events').value}`;
      return;
    }
    let div1 = `&nbsp&nbsp&nbspTotal requests = ${requests.length}`;
    let requestsAllowed = 0;
    let hasStarted = 0;
    let hasCompleted = 0;
    let div2 = '<table><thead><tr><th>Name</th><th>Email</th><th>College</th><th>isAllowed</th><th>hasStarted</th><th>hasCompleted</th></tr></thead><tbody></tbody></table>';
    document.querySelector('.results').innerHTML = div2;
    requests.forEach((ele) => {
      const tableRow = document.createElement('tr');
      tableRow.innerHTML = `
      <td>${ele.name}</td><td>${ele.email}</td><td>${ele.college}</td>
      <td>
      <div class="switch">
        <label>
            Disallow
            <input type="checkbox" value="${ele.email}" ${ele.isAllowed ?` checked `:` unchecked ` } >
            <span class="lever"></span>
            Allow
        </label>
      </div>
      </td>
      <td>${ele.hasStarted ?` true `:` false `}</td>
      <td>${ele.hasCompleted ?` true `:` false `}</td>
      `;
      if (ele.isAllowed) {
        requestsAllowed++;
      }
      if (ele.hasStarted) {
        hasStarted++;
      }
      if (ele.hasCompleted) {
        hasCompleted++;
      }
      document.querySelector('tbody').appendChild(tableRow);
    });
    div1 += `&nbsp&nbsp&nbsp&nbsp&nbsp&nbspTotal allowed = ${requestsAllowed}`;
    div1 += `&nbsp&nbsp&nbsp&nbsp&nbsp&nbspTotal started = ${hasStarted}`;
    div1 += `&nbsp&nbsp&nbsp&nbsp&nbsp&nbspTotal completed = ${hasCompleted}`;
    document.querySelector('.resultsHeader').innerHTML = div1;
    
    const participants = document.querySelectorAll('input[type=checkbox]');
    participants.forEach((ele) => {
      ele.addEventListener('change', allowQuiz);
    }); 
  };
  
  
  const ajax = () => {
    const xhttp = new XMLHttpRequest();
    preloader.style.display = 'block';
    xhttp.onload = function () {
      if (this.status == 200) {
        preloader.style.display = 'none';
        processResult(JSON.parse(this.responseText));
      }
    };
    xhttp.onerror = function () {
      console.log('Error occured');
    };
    const data = {
      email: null,
      event: eventName.value,
    };
    xhttp.open('POST', '/events/requests', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
  };

  const elems = document.querySelectorAll('select');
  const instances = M.FormSelect.init(elems);
  
  const eventName = document.querySelector('#events');
  eventName.addEventListener('change', ajax);
  const preloader = document.querySelector('.preloader');
  preloader.style.display = 'none';

  const reload = document.querySelector('.reload');
  reload.addEventListener('click', ajax);
  reload.addEventListener('click', () => {
    reload.classList.toggle('flip');
  });
});
