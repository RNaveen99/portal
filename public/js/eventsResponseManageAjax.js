document.addEventListener('DOMContentLoaded', () => {
  // const allowQuiz = (participant) => {
  //   console.log(participant.target.value);
  //   const xhttp = new XMLHttpRequest();
  //   xhttp.onerror = function () {
  //     console.log('Error occured');
  //   };
  //   const data = {
  //     email: participant.target.value,
  //     event: eventName.value,
  //   };
  //   console.log(data);
  //   xhttp.open('POST', '/events/requests', true);
  //   xhttp.setRequestHeader('Content-type', 'application/json');
  //   xhttp.send(JSON.stringify(data));
  // };

  const processResult = (result) => {
    console.table(result);
    let div1 = '<table><thead><tr><th>Name</th><th>College</th><th>Email</th><th>Number</th><th>Score</th></tr></thead>';
    result.forEach((ele) => {
      div1 += `
        <tr>
        <td>
        </tr>
        `;
    });
    document.querySelector('.results').innerHTML = div1;
  //   const participants = document.querySelectorAll('input[type=checkbox]');
  //   participants.forEach((ele) => {
  //     ele.addEventListener('change', allowQuiz);
  //   });
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

