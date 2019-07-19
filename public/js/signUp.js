document.addEventListener('DOMContentLoaded', () => {
  const elems = document.querySelectorAll('.autocomplete');
  const instances = M.Autocomplete.init(elems, {
    data: {
      'Deen Dayal Upadhyaya College': null,
      'Hansraj College': null,
      'Gargi College': null,
      DUCS: null,
      'Ramjas College': null,
      'Keshav Mahavidyalaya': null,
      'Acharya Narendra Dev College': null,
      'Atma Ram Sanatan Dharma College': null,
      'Aditi Mahavidyalaya': null,
      'Bhagini Nivedita College': null,
      'Bharati College': null,
      'Bhaskaracharya College of Applied Sciences': null,
      'Bhim Rao Ambedkar College': null,
      'Daulat Ram College': null,
      'Deshbandhu College': null,
      'Dyal Singh College': null,
      'Indraprastha College for Women': null,
      'Netaji Subhas Institute of Technology': null,
      'Shyama Prasad Mukherjee College': null,
    },
  });
});
