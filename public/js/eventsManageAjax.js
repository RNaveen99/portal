document.addEventListener('DOMContentLoaded', () => {
  const ajax = (e) => {
    const xhttp = new XMLHttpRequest();
    const data = {
      eventCode: e.target.value,
      type: e.target.getAttribute('data'),
    };
    xhttp.open('POST', '/events/manage', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
  };

  document.querySelectorAll('a[href="/events/manage"]').forEach((ele) => {
    ele.parentNode.classList.toggle('active');
  });
  const eventName = document.querySelectorAll('input[type=checkbox]');
  eventName.forEach((ele) => {
    ele.addEventListener('change', ajax);
  })
});
