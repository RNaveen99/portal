document.addEventListener('DOMContentLoaded', () => {
  const changeSymbol = (eventName) => {
    let symbol = eventName.target.innerText;
    if (symbol === 'add') {
      symbol = 'remove';
    } else {
      symbol = 'add';
    }
    eventName.target.innerText = symbol;
  }
  
  const ajax = (eventName) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onerror = function () {
      console.log('Error occured');
    };
    const data = {
      event: eventName.target.parentNode.getAttribute('data'),
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
