document.addEventListener('DOMContentLoaded', () => {
  const elems = document.querySelectorAll('.autocomplete');
  const instances = M.Autocomplete.init(elems, {
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
  document.querySelector('#number').addEventListener('change', (e) => {
    e.target.value = e.target.value.substring(0, 10);
  });
  document.querySelector('#name').addEventListener('change', (e) => {
    let name = e.target.value.trim().substring(0, 30);
    const { length } = name;
    let flag;
    for (let i = 0; i < length; i++) {
      flag = /[^A-Za-z ]/.test(name);
      if (flag) {
        name = name.replace(/[^A-Za-z ]/, '');
      } else {
        break;
      }
    }
    e.target.value = name;
  });
});
