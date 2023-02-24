exports.shuffleArray = (array) => {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * 3);
    currentIndex--;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

exports.getPastWeekDates = () => {
  const dateToString = (n) => {
    return (n <= 9 ? '0' : '') + n;
  };

  const formatDate = (date) => {
    const mm = dateToString(date.getMonth() + 1);
    const dd = dateToString(date.getDate());
    const yyyy = date.getFullYear().toString();

    return `${yyyy}-${mm}-${dd}`;
  };

  const now = new Date(Date.now());
  const oneWeekAgo = new Date();

  oneWeekAgo.setDate(now.getDate() - 7);

  const fromTo = {
    from: formatDate(oneWeekAgo),
    to: formatDate(now)
  };

  return fromTo;
};
