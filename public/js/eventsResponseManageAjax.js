document.addEventListener('DOMContentLoaded', () => {
  
  const addToResults = (e) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      if (this.status == 200) {
      }
    };
    xhttp.onerror = function () {
      console.log('Error occured');
    };
    const data = {
      event: document.querySelector('#events').value,
      name: e.target.getAttribute('data-name'),
      college: e.target.getAttribute('data-college'),
    };
    console.log(data);
    xhttp.open('POST', '/events/results', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
  };

  const processResult = ({ responses, results }, event) => {
    responses = responses.sort((a, b) => b.score - a.score);
    console.table(responses);
    console.table(results);
    if (!responses.length) {
      document.querySelector('.results').innerHTML = '<h2>No Responses are Available</h2>';
      return;
    }
    console.log(event);
    document.querySelector('.results').innerHTML = '';
    let div1 = '<table><thead><tr><th>Name</th><th>College</th><th>Email</th><th>Number</th><th>Score</th><th>View</th><th>Add</th></tr></thead><tbody>';
    responses.forEach((ele) => {
      const name = `${ele.user.name} ${ele.user.friendName ? `<br> ${ele.user.friendName}` : `` }`;
      const college = `${ele.user.college} ${ele.user.friendName ? `<br> ${ele.user.friendCollege}` : `` }`;
      const email = `${ele.user.email} ${ele.user.friendName ? `<br> ${ele.user.friendEmail}` : `` }`;
      const number = `${ele.user.number} ${ele.user.friendName ? `<br> ${ele.user.friendNumber}` : `` }`;
      console.log(name);
      div1 += `
        <tr>
        <td>${name} </td>
        <td>${college}</td>
        <td>${email} </td>
        <td>${number} </td>
        <td>${ele.score}</td>
        <td><a class="waves-effect waves-teal btn-flat blue-text" href="/events/responses/view?event=${event}&email=${ele.user.email}">view</a></td>
        <td><div class="switch"><label>remove<input type="checkbox"
        `;
      const tempResult = results.find(r => r.name === name);
      if (tempResult) {
        div1 += `checked `;
      }
      div1 += `data-name="${name}" data-college="${college}"><span class="lever"></span>Add</label></div></td></tr>`;
    });
    document.querySelector('.results').innerHTML += div1;
    const participants = document.querySelectorAll('input[type=checkbox]');
    participants.forEach((ele) => {
      ele.addEventListener('change', addToResults);
    });
  };


  const ajax = (e) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      if (this.status == 200) {
        processResult(JSON.parse(this.responseText), e.target.value);
      }
    };
    xhttp.onerror = function () {
      console.log('Error occured');
    };
    const data = {
      event: e.target.value,
    };
    xhttp.open('POST', '/events/responses', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
  };

  const elems = document.querySelectorAll('select');
  const instances = M.FormSelect.init(elems);

  const eventName = document.querySelector('#events');
  eventName.addEventListener('change', ajax);
});

