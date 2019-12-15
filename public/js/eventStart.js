document.addEventListener('DOMContentLoaded', () => {
  let current;
  let previous;
  let next;
  const responded = [];
  const numOfQuestions = Number(document.querySelector('#numOfQuestions').value);
  const previousButton = document.querySelector('#previousButton');
  const nextButton = document.querySelector('#nextButton');
  const grids = document.querySelectorAll('.grid');
  const COLOR_VISITED = 'blue';
  const COLOR_RESPONDED = 'green';
  const COLOR_VISITING = 'red';
  const STATE_VISIBLE = 'block';
  const STATE_HIDE = 'none';

  function gridAndQuestionsHelpers() {
    function displayPreviousButton(state) {
      previousButton.style.display = state;
    }
    function displayNextButton(state) {
      nextButton.style.display = state;
    }
    function updateCurrentGridColor(color) {
      document.querySelector(`#grid${current}`).style.backgroundColor = color;
    }
    function updateQuestionDisplay(qid, state) {
      document.querySelector(`#question${qid}`).style.display = state;
    }

    function updateGridQuestionAndCPN(newCurrent) {
      updateQuestionDisplay(current, STATE_HIDE);
      updateQuestionDisplay(newCurrent, STATE_VISIBLE);

      if (responded[current].length) {
        updateCurrentGridColor(COLOR_RESPONDED);
      } else {
        updateCurrentGridColor(COLOR_VISITED);
      }
      current = newCurrent;
      previous = current - 1;
      next = current + 1;
      if (previous <= 0) {
        // previous = 1;
        displayPreviousButton(STATE_HIDE);
      } else {
        displayPreviousButton(STATE_VISIBLE);
      }
      if (next > numOfQuestions) {
        // next = numOfQuestions;
        displayNextButton(STATE_HIDE);
      } else {
        displayNextButton(STATE_VISIBLE);
      }
      updateCurrentGridColor(COLOR_VISITING);
      console.log(`previous = ${previous}, current = ${current}, next = ${next}`);
    }

    // function updateQuestionAndGrid(newCurrent) {
    //   updateQuestionDisplay(current, STATE_HIDE);
    //   updateQuestionDisplay(newCurrent, STATE_VISIBLE);
    //   updateGridAndCPN(newCurrent);
    //   updateCurrentGridColor(COLOR_VISITING);
    // }

    // function updateDisplay(e) {
    //   const newCurrent = Number(e.target.textContent);
    //   updateGridQuestionAndCPN(newCurrent);
    // }

    return {
      updateGridQuestionAndCPN,
    }
  }

  function initGridAndQuestions() {
    const { updateGridQuestionAndCPN } = gridAndQuestionsHelpers();
    current = 1;
    previous = 0;
    next = current + 1;

    // updateQuestionDisplay(current, STATE_VISIBLE);
    // updateCurrentGridColor(COLOR_VISITING);
    updateGridQuestionAndCPN(current);

    grids.forEach((ele) => {
      ele.addEventListener('click', (e) => {
        updateGridQuestionAndCPN(Number(e.target.textContent));
      });
    });
    previousButton.addEventListener('click', () => {
      updateGridQuestionAndCPN(previous);
    });
    nextButton.addEventListener('click', () => {
      updateGridQuestionAndCPN(next);
    });
  }


  function initRespondedAndCheckboxes() {
    for (let i = 0; i <= numOfQuestions; i += 1) {
      responded.push([]);
    }

    for (let i = 1; i <= numOfQuestions; i++) {
      const options = `.option${i}`;
      const count = document.querySelectorAll(options);
      console.log(count.length);
      count.forEach((ele) => {
        ele.addEventListener('click', (e) => {
          const parent = e.target.parentNode;
          // const forAttribue = parent.getAttribute('for');
          const questionId = Number(parent.getAttribute('questionid'));
          const optionId = Number(parent.getAttribute('optionid'));
          // const i = Number(questionId);
          // const j = Number(optionId);
          if (e.target.checked) {
            responded[questionId].push(optionId);
            if (responded[questionId].length > 1) {
              const k = responded[questionId].shift();
              const d = document.querySelector(`#ques${questionId}option${k}`);
              d.checked = false;
            }
          } else {
            responded[questionId].shift();
            // const index = responded[questionId].indexOf(optionId);
            // if (index !== -1) responded[i].splice(index, 1);
          }
          console.log(responded);
        });
      });
    }
  }


  function initQuizTime() {
    let totalSeconds = 60 * Number(document.querySelector('#timeLimit').value);
    let countDownMinutes = Math.floor(totalSeconds / 60);
    let countDownSeconds = totalSeconds % 60;
    function quizTimeCountDown() {
      const time = `${countDownMinutes}`.padStart(2, '0') + ':' + `${countDownSeconds}`.padStart(2, '0');
      document.querySelector('#quizTimeLeft').innerHTML = `&nbsp&nbspTime: ${time}`;
      if (totalSeconds <= 0) {
        // setTimeout(document.forms.quiz.submit(), 1);
        clearInterval(timerInterval);
        document.forms.quiz.submit();
      } else {
        totalSeconds--;
        countDownMinutes = Math.floor(totalSeconds / 60);
        countDownSeconds = totalSeconds % 60;
        // setTimeout(checkTime, 1000);
      }
    }
    const timerInterval = setInterval(quizTimeCountDown, 1000);

    document.querySelector('button[name="action"]').addEventListener('click', () => {
      clearInterval(timerInterval);
    });
  }

  function init() {
    initRespondedAndCheckboxes();
    initGridAndQuestions();
    initQuizTime();
  }
  init();
});