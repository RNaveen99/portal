document.addEventListener('DOMContentLoaded', () => {
  const changeSymbol = (e) => {
    let symbol = e.target.innerText;
    if (symbol === 'add') {
      symbol = 'remove';
      e.target.parentNode.setAttribute('data-tooltip', 'Not Interested');
    } else {
      symbol = 'add';
      e.target.parentNode.setAttribute('data-tooltip', `Click to participate in ${e.target.parentNode.getAttribute('event')}`);
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
  const elems = document.querySelectorAll('.tooltipped');
  const instances = M.Tooltip.init(elems);

  
});
