document.addEventListener('DOMContentLoaded', () => {
  let requests;
  const allowQuiz = (participant) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onerror = () => {
      console.log('Error occured');
    };
    const data = {
      email: participant.target.value,
      event: eventName.value,
    };
    xhttp.open('POST', '/events/requests', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
  }


  const filterSort = () => {
    if (filterId.value == 'name' || filterId.value == 'college') {
      if (sortId.value == 'asc') {
        requests.sort((a, b) => {
          let nameA = a[`${filterId.value}`].toUpperCase();
          let nameB = b[`${filterId.value}`].toUpperCase();
          if (nameA > nameB) {
            return 1;
          }
          if (nameA < nameB) {
            return -1;
          }
          return 0;
        });

      } else {
        requests.sort((a, b) => {
          let nameA = a[`${filterId.value}`].toUpperCase();
          let nameB = b[`${filterId.value}`].toUpperCase();
          if (nameA < nameB) {
            return 1;
          }
          if (nameA > nameB) {
            return -1;
          }
          return 0;
        });
      }
    } else {
      if (sortId.value == 'asc') {
        requests.sort((a, b) => {
          return a[`${filterId.value}`] === b[`${filterId.value}`] ? 0 : a[`${filterId.value}`] ? -1 : 1;
        });
      } else {
        requests.sort((a, b) => {
          return a[`${filterId.value}`] === b[`${filterId.value}`] ? 0 : b[`${filterId.value}`] ? -1 : 1;
        });
      }
    }
    reset();
    visible();
    print();
  }
  const print = () => {
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
      <td>${ele.hasStarted ? ` true ` : ` false `}</td>
      <td>${ele.hasCompleted ? ` true ` : ` false `}</td>
      `;
      if (ele.isAllowed) {
        allowed++;
      }
      if (ele.hasStarted) {
        started++;
      }
      if (ele.hasCompleted) {
        completed++;
      }
      tbody.appendChild(tableRow);
    });
    requestsAllowed.innerText = `Requests allowed = ${allowed}`;
    hasStarted.innerText = `Has started = ${started}`;
    hasCompleted.innerText = `Has Completed = ${completed}`;
  }

  const processResult = () => {
    print();
    const participants = document.querySelectorAll('input[type=checkbox]');
    participants.forEach((ele) => {
      ele.addEventListener('change', allowQuiz);
    });
  };

  const reset = () => {
    totalRequests.innerText = requestsAllowed.innerText = hasStarted.innerText = hasCompleted.innerText = '';
    tbody.innerText = '';
    resultContent.style.display = 'none';
  }

  const visible = () => {
    resultContent.style.display = 'block';
  }
  const ajax = () => {
    const xhttp = new XMLHttpRequest();
    preloader.style.display = 'block';
    reset();
    xhttp.onload = () => {
      if (xhttp.status == 200) {
        preloader.style.display = 'none';
        requests = JSON.parse(xhttp.responseText);
        visible();
        processResult();
      }
    };
    xhttp.onerror = () => {
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

  M.FormSelect.init(document.querySelectorAll('select'));

  const eventName = document.querySelector('#events');
  eventName.addEventListener('change', ajax);
  eventName.addEventListener('change', () => {
    options.style.display = 'block';
    resultHeader.style.display = 'block';
  }, { once: true });

  const reload = document.querySelector('.reload');
  reload.addEventListener('click', ajax);
  reload.addEventListener('click', () => {
    filterId.selectedIndex = 0;
    sort.style.display = 'none';
  });
  reload.addEventListener('click', () => {
    reload.classList.toggle('flip');
  });

  const preloader = document.querySelector('.preloader');
  preloader.style.display = 'none';

  const options = document.querySelector('#options');
  const resultHeader = document.querySelector('#result-header');
  const resultContent = document.querySelector('#result-content');
  const tbody = document.querySelector('tbody');
  const totalRequests = document.querySelector('#total-requests');
  const requestsAllowed = document.querySelector('#requests-allowed');
  const hasStarted = document.querySelector('#has-started');
  const hasCompleted = document.querySelector('#has-completed');
  const filterId = document.querySelector('#filter');
  const sortId = document.querySelector('#sort');
  const sort = document.querySelector('.sort');
  filterId.addEventListener('change', filterSort);
  filterId.addEventListener('change', () => { sort.style.display = 'block'; });
  sortId.addEventListener('change', filterSort);
  options.style.display = 'none';
  resultHeader.style.display = 'none';
  resultContent.style.display = 'none';
  sort.style.display = 'none';
});
