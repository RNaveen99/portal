document.addEventListener('DOMContentLoaded', () => {
  const ajax = (eventName) => {
    const xhttp = new XMLHttpRequest();

    xhttp.onerror = function () {
			console.log('Error occured');
    };
    const data = {
      eventName: eventName.target.value,
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
