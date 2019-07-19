document.addEventListener('DOMContentLoaded', () => {
  const result = function (data) {
    const button = document.querySelector('#submit');
    if (data.success === false) {
			button.setAttribute('disabled', true);
			document.querySelector('#error').innerHTML = 'Already exists';
    } else {
			button.removeAttribute('disabled');
      document.querySelector('#error').innerHTML = 'Does not exist';
    }
  };

  const ajax = (eventName) => {

    const xhttp = new XMLHttpRequest();

    xhttp.onprogress = function () {
			document.querySelector('.loader').style.display = 'block';
    };
    xhttp.onload = function () {
      if (this.status == 200) {
				result(JSON.parse(this.responseText));
				document.querySelector('.loader').style.display = 'none';
      }
    };
    xhttp.onerror = function () {
			console.log('Request eror');
			document.querySelector('.loader').style.display = 'none';
    };
    const data = {
      eventName: eventName.target.value,
    };
    xhttp.open('POST', '/events/generateEventsAjax', true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
  };

	document.querySelector('.loader').style.display = 'none';
  const eventName = document.querySelector('#eventName');
  eventName.addEventListener('change', ajax);
});
