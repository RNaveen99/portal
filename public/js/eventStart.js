/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */
/* eslint-disable no-loop-func */
document.addEventListener('DOMContentLoaded', () => {
  // ---------------------navigation validation-------------------
  let current = 1;
  let previous = 1;
  let next = current + 1;
  const array = [];
  const numOfQuestions = Number(document.querySelector('#numOfQuestions').value);

  const updateCurrent = (newCurrent) => {
    if (array[current].length) {
      document.querySelector(`#grid${current}`).style.backgroundColor = 'green';
    } else {
      document.querySelector(`#grid${current}`).style.backgroundColor = 'blue';
    }
    current = newCurrent;
    previous = current - 1;
    next = current + 1;
    if (previous <= 0) {
      previous = 1;
    }
    if (next > numOfQuestions) {
      next = numOfQuestions;
    }
    console.log(`previous = ${previous}, current = ${current}, next = ${next}`);
  };

  // const updateColor = () => {
  //   for (let i = 1; i <= numOfQuestions; i++) {
  //     if (array[i].length) {
  //       document.querySelector(`#grid${i}`).style.backgroundColor = 'green';
  //       console.log(`color for ${i} changed to green`);
  //     } else {
  //       document.querySelector(`#grid${i}`).style.backgroundColor = 'grey';
  //     }
  //   } 
  // }
  const display = (newCurrent) => {
    document.querySelector(`#question${current}`).style.display = 'none';

    document.querySelector(`#question${newCurrent}`).style.display = 'block';

    updateCurrent(newCurrent);
    //updateColor();
    document.querySelector(`#grid${current}`).style.backgroundColor = 'red';
  };

  const displayEvent = (e) => {
    const newCurrent = Number(e.target.textContent);

    display(newCurrent);
  };

  const grids = document.querySelectorAll('.grid');
  grids.forEach((ele) => {
    ele.addEventListener('click', displayEvent);
  });

  document.querySelector(`#question${current}`).style.display = 'block';
  document.querySelector(`#grid${current}`).style.backgroundColor = 'red';

  const previousButton = document.querySelector('#previousButton');
  const nextButton = document.querySelector('#nextButton');
  previousButton.addEventListener('click', () => {
    display(previous);
  });
  nextButton.addEventListener('click', () => {
    display(next);
  });

  // ----------------------------------------------------------------------------------
  // ----------------------------CheckBoxes Limitation---------------------------------
  // ----------------------------------------------------------------------------------
  for (let i = 0; i <= numOfQuestions; i++) {
    array.push([]);
  }

  for (let i = 1; i <= numOfQuestions; i++) {
    const options = `.option${i}`;
    const count = document.querySelectorAll(options);
    console.log(count.length);
    count.forEach((ele) => {
      ele.addEventListener('click', (e) => {
        const parent = e.target.parentNode;
        const forAttribue = parent.getAttribute('for');
        const i = Number(forAttribue[forAttribue.length - 2]);
        const j = Number(forAttribue[forAttribue.length - 1]);
        if (e.target.checked) {
          array[i].push(j);
          if (array[i].length > 1) {
            const k = array[i].shift();
            const d = document.querySelector(`#option${i}${k}`);
            d.checked = false;
          }
        } else {
          const index = array[i].indexOf(j);
          if (index !== -1) array[i].splice(index, 1);
        }
        console.log(array);
      });
    });
  }
  // ----------------------------------------------------------------------------
  // -----------------------------Quiz Timer-------------------------------------
  // ----------------------------------------------------------------------------
  let totalSeconds = 60 * Number(document.querySelector('#quizTime').value);
  let countDownMinutes =  Math.floor(totalSeconds / 60);
  let countDownSeconds = totalSeconds % 60;
  const checkTime = () => {
    // let minutes = `${countDownMinutes}`;
    // minutes = minutes.padStart(2, '0');
    // let seconds = `${countDownSeconds}`;
    // seconds = seconds.padStart(2, '0');
    // let time = `${minutes}:${seconds}`;
    let time = `${countDownMinutes}`.padStart(2, '0') + ':' + `${countDownSeconds}`.padStart(2, '0');
    document.querySelector('#quizTimeLeft').innerHTML = `&nbsp&nbspTime: ${time}`;
    if (totalSeconds <= 0) {
      setTimeout(document.forms['quiz'].submit(), 1);  
    } else {
      totalSeconds--;
      countDownMinutes =  Math.floor(totalSeconds / 60);
      countDownSeconds = totalSeconds % 60;
      setTimeout(checkTime, 1000);
    }
  }
  setTimeout(checkTime, 1000);
});
