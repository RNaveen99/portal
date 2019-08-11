document.addEventListener('DOMContentLoaded', () => {
  const ajax = (e) => {
    const xhttp = new XMLHttpRequest();
    const data = {
      event: e.target.value,
      type: e.target.getAttribute('data'),
    };
    xhttp.open('POST', '/events/manage', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
  };

  const eventName = document.querySelectorAll('input[type=checkbox]');
  eventName.forEach((ele) => {
    ele.addEventListener('change', ajax);
  })
});
