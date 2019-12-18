document.addEventListener('DOMContentLoaded', () => {
  const changeSymbol = (e) => {
    let symbol = e.target.innerText;
    switch (symbol) {
      case 'add': {
        symbol = 'remove';
        e.target.parentNode.setAttribute('data-tooltip', 'Not Interested');
        e.target.parentNode.classList.toggle('red');
        e.target.parentNode.classList.toggle('green');
        break;
      }
      default: {
        symbol = 'add';
        e.target.parentNode.setAttribute('data-tooltip', `Click to participate in ${e.target.parentNode.getAttribute('eventName')}`);
        e.target.parentNode.classList.toggle('green');
        e.target.parentNode.classList.toggle('red');
      }
    }
    e.target.innerText = symbol;
  };

  const ajax = (e) => {
    const xhttp = new XMLHttpRequest();
    const data = {
      eventCode: e.target.parentNode.getAttribute('eventCode'),
      eventName: e.target.parentNode.getAttribute('eventName'),
    };
    xhttp.open('POST', '/events', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
  };

  const events = document.querySelectorAll('.events');
  events.forEach((ele) => {
    ele.addEventListener('click', ajax);
    ele.addEventListener('click', changeSymbol);
  });

  document.querySelectorAll('a[href="/events"]').forEach((ele) => {
    ele.parentNode.classList.toggle('active');
  });
  M.Tooltip.init(document.querySelectorAll('.tooltipped'));
  M.Modal.init(document.querySelectorAll('.modal'));
  const elem = document.querySelector('#modal1');
  if (elem) { M.Modal.getInstance(elem).open(); }
});
