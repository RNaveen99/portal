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

  const processResult = (result) => {
    if (!result.length) {
      document.querySelector('.results').innerHTML = `<h3>No requests for Event -- ${document.querySelector('#events').value}`;
      return;
    }
    let div1 = `Total requests = ${result.length}`;
    div1 += '<table><thead><tr><th>Name</th><th>Email</th><th>College</th><th>Status</th></tr></thead><tbody>';
    result.forEach((ele) => {
      div1 += `
      <tr><td>${ele.name}</td><td>${ele.email}</td><td>${ele.college}</td>
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
      </tr>
      `;
    });
    div1 += `</tbody></table>`;
    document.querySelector('.results').innerHTML = div1;
    const participants = document.querySelectorAll('input[type=checkbox]');
    participants.forEach((ele) => {
      ele.addEventListener('change', allowQuiz);
    }); 
  };
  
  
  const ajax = (e) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      if (this.status == 200) {
        processResult(JSON.parse(this.responseText));
      }
    };
    xhttp.onerror = function () {
      console.log('Error occured');
    };
    const data = {
      email: null,
      event: e.target.value,
    };
    xhttp.open('POST', '/events/requests', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
  };

  const elems = document.querySelectorAll('select');
  const instances = M.FormSelect.init(elems);
  
  const eventName = document.querySelector('#events');
  eventName.addEventListener('change', ajax);

});
