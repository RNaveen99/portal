document.addEventListener('DOMContentLoaded', () => {
  const changeSymbol = (e) => {
    let symbol = e.target.innerText;
    if (symbol === 'add') {
      symbol = 'remove';
    } else {
      symbol = 'add';
    }
    e.target.innerText = symbol;
  };
  
  const ajax = (e) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onerror = function (err) {
      console.log('Error occured' ,err);
    };
    xhttp.onload = function () {
      if (this.status == 200) {
        console.log(JSON.parse(this.responseText));
      }
    };
    const data = {
      event: e.target.parentNode.getAttribute('data'),
    };
    xhttp.open('POST', '/events', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
  };

  const eventName = document.querySelectorAll('.events');
  eventName.forEach((ele) => {
    ele.addEventListener('click', ajax);
    ele.addEventListener('click', changeSymbol);
  });
});
