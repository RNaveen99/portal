document.addEventListener('DOMContentLoaded', () => {
  M.Autocomplete.init(document.querySelectorAll('.autocomplete'), {
    data: {
      'Acharya Narendra Dev College': null,
      'Atma Ram Sanatan Dharma College': null,
      'Aryabhatta College': null,
      'Aditi Mahavidyalaya': null,
      'Bhagini Nivedita College': null,
      'Bharati College': null,
      'Bhaskaracharya College of Applied Sciences': null,
      'Bhim Rao Ambedkar College': null,
      'Deen Dayal Upadhyaya College': null,
      'Daulat Ram College': null,
      'Deshbandhu College': null,
      'Dyal Singh College': null,
      DUCS: null,
      'Delhi Technological University': null,
      'Gargi College': null,
      'Hansraj College': null,
      'Hindu College': null,
      'Indraprastha College for Women': null,
      'Indian Institute of Technology Delhi': null,
      'Keshav Mahavidyalaya': null,
      'Netaji Subhas Institute of Technology': null,
      'Ramjas College': null,
      'Shyama Prasad Mukherji College': null,
      'Sri Guru Tegh Bahadur Khalsa College': null,
    },
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const name = document.querySelector('#name');
  const nameHelper = document.querySelector('.name-helper');
  const college = document.querySelector('#college');
  const collegeHelper = document.querySelector('.college-helper');
  const number = document.querySelector('#number');
  const numberHelper = document.querySelector('.number-helper');
  const email = document.querySelector('#email');
  const emailHelper = document.querySelector('.email-helper');
  const password = document.querySelector('#password');
  const passwordHelper = document.querySelector('.password-helper');
  const submitButton = document.querySelector('button[type="submit"]');

  function setVaidationIcon(field, icon) {
    document.querySelector(`.${field}-icon`).textContent = icon;
  }

  function validateName() {
    const nameValue = name.value;
    let msg = '';
    const flag1 = /^([A-Za-z])([A-Za-z ]){0,28}([A-Za-z])$/.test(nameValue);
    if (!flag1) {
      msg += 'Only Alphabets and Spaces in-between.(Min 2 alphabets.)';
    }
    let flag2 = true;
    if (nameValue.length > 30) {
      flag2 = false;
      msg += 'Max 30 characters.';
    }
    nameHelper.textContent = msg;
    const flag = flag1 && flag2;
    if (flag) {
      setVaidationIcon('name', 'check');
    } else {
      setVaidationIcon('name', 'clear');
    }
    return flag;
  }

  function validateCollege() {
    const collegeValue = college.value;
    let msg = '';
    const flag1 = /^([A-Za-z])([A-Za-z ]){0,68}([A-Za-z])$/.test(collegeValue);
    if (!flag1) {
      msg += 'Only Alphabets and Spaces in-between.(Min 2 alphabets.)';
    }
    let flag2 = true;
    if (collegeValue.length > 70) {
      flag2 = false;
      msg += 'Max 70 characters.';
    }
    collegeHelper.textContent = msg;
    const flag = flag1 && flag2;
    if (flag) {
      setVaidationIcon('college', 'check');
    } else {
      setVaidationIcon('college', 'clear');
    }
    return flag;
  }
  function validateNumber() {
    const numberValue = number.value;
    let msg = '';
    const flag1 = /[^0-9]/.test(numberValue);
    if (flag1) {
      msg += 'Numbers only. ';
    }
    let flag2 = true;
    if (numberValue.length > 10) {
      flag2 = false;
      msg += 'Max 10 characters.'
    } else if (numberValue.length < 10) {
      flag2 = false;
      msg += 'Min 10 characters.';
    }
    numberHelper.textContent = msg;
    const flag = !flag1 && flag2;
    if (flag) {
      setVaidationIcon('number', 'check');
    } else {
      setVaidationIcon('number', 'clear');
    }
    return flag;
  }

  function validateEmail() {
    const emailValue = email.value;
    let msg = '';
    const flag = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(emailValue);
    if (!flag) {
      msg += 'Enter a proper email address.';
    }
    emailHelper.textContent = msg;
    if (flag) {
      setVaidationIcon('email', 'check');
    } else {
      setVaidationIcon('email', 'clear');
    }
    return flag;
  }
  function validatePassword() {
    const passwordValue = password.value;
    let msg = '';
    const flag1 = / /.test(passwordValue);
    if (flag1) {
      msg += 'Spaces are not allowed.';
    }
    let flag2 = true;
    if (passwordValue.length < 5) {
      flag2 = false;
      msg += ' Minimum length should be 5';
    }
    passwordHelper.textContent = msg;
    const flag = !flag1 && flag2;
    if (flag) {
      setVaidationIcon('password', 'check');
    } else {
      setVaidationIcon('password', 'clear');
    }
    return flag;
  }

  function validateFields(e) {
    const flag1 = validateName();
    const flag2 = validateCollege();
    const flag3 = validateNumber();
    const flag4 = validateEmail();
    const flag5 = validatePassword();
    if (!(flag1 && flag2 && flag3 && flag4 && flag5)) {
      e.preventDefault();
    }
  }
  name.addEventListener('keyup', validateName);
  college.addEventListener('keyup', validateCollege);
  number.addEventListener('keyup', validateNumber);
  email.addEventListener('keyup', validateEmail);
  password.addEventListener('keyup', validatePassword);
  submitButton.addEventListener('click', validateFields);
});
