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
    const data = {
      event: e.target.parentNode.getAttribute('event'),
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
