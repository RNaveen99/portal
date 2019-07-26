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

  const processResult = (result, event) => {
    result = result.sort((a, b) => b.score - a.score);
    console.table(result);
    console.log(result, typeof result) ;
    if (!result.length) return;
    console.log(event);
    let div1 = '<table><thead><tr><th>Name</th><th>College</th><th>Email</th><th>Number</th><th>Score</th><th>View</th></tr></thead><tbody>';
    result.forEach((ele) => {
      div1 += `
        <tr>
        <td>${ele.user.name} ${ele.user.friendName ? `<br> ${ele.user.friendName} ` : ` ` } </td>
        <td>${ele.user.college} ${ele.user.friendName ? `<br> ${ele.user.friendCollege} ` : ` ` } </td>
        <td>${ele.user.email} ${ele.user.friendName ? `<br> ${ele.user.friendEmail} ` : ` ` } </td>
        <td>${ele.user.number} ${ele.user.friendName ? `<br> ${ele.user.friendNumber} ` : ` ` } </td>
        <td>${ele.score}</td>
        <td><a class="waves-effect waves-teal btn-flat blue-text" href="/events/responses/view?event=${event}&email=${ele.user.email}">view</a></td>
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

