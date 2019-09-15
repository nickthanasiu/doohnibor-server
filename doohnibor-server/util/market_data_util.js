/*eslint-disable*/
const moment = require('moment');

// Takes a the time value from our cache as argument
// Determines whether or not 5 minutes has passed
exports.cacheShouldRefresh = (timestamp) => {
  const now = new Date(Date.now());
  if (now.getDay() === 0 || now.getDay() === 6) {
    console.log('CACHESHOULDREFRESH RETURNING FALSE BECAUSE IT IS THE WEEKEND');
    return false;
  }

  const date = new Date(timestamp);
  let diff = (now.getTime() - date.getTime()) / 1000;
  diff /= 60;
  console.log('DIFFERENCE IS: ', Math.abs(Math.round(diff)));
  const returnBoolean = Math.abs(Math.round(diff)) > 5;
  console.log('CACHESHOULDREFRESH RETURNING: ', returnBoolean);
  return returnBoolean;
};

// Takes a date and returns a formatted key to get value of that date's opening price
// Example Return Value: 2018-09-18 09:30:00
// On weekends, returns the the last Friday's date...lest we try accessing data that doesn't exist
// (i.e., ...there will be no market data on weekends)
exports.formatOpenPriceKey = (timestamp) => {
  const now = new Date(Date.now());

  const getFriday = () => {
    if (now.getDay() === 6) {
      const friday = new Date();
      friday.setDate(now.getDate() - 1);

      return friday;
    }

    if (now.getDay() === 0) {
      const friday = new Date();
      friday.setDate(now.getDate() - 2);

      return friday;
    }
  };

  const isWeekend = () => {
    if (now.getDay() === 6 || now.getDay() === 0) {
      return true;
    } else {
      return false;
    }
  };

  const dateToString = (n) => {
    return (n <= 9 ? '0' : '') + n;
  };

  const formatDate = (date) => {
    const mm = dateToString(date.getMonth() + 1);
    const dd = dateToString(date.getDate());
    const yyyy = date.getFullYear().toString();

    return `${yyyy}-${mm}-${dd}`;
  };


  const friday = getFriday();
  const checkWeekend = isWeekend();

  const date = checkWeekend ? formatDate(friday) : formatDate(timestamp);

  return `${date} 09:30:00`;
};


exports.getYesterdayTimestamp = () => {
  const today = moment();
  let yesterday;
  const todayDate = new Date(today);
  const todayDay = todayDate.getDay();
  const isSunday = todayDay === 0;
  const isMonday = todayDay === 1;
  const isSundayOrMonday = (isSunday || isMonday) ? true : false;
  
  
  if (isSundayOrMonday) {
    yesterday = today.subtract(3, 'days');
  } else {
    yesterday = today.subtract(1, 'days');
  }
  
  const formattedYesterday = yesterday.format().substr(0, 10);

  return formattedYesterday;
};

exports.getMonthAgoTimestamp = () => {
  let monthAgo = moment().subtract(1, 'month');
  const monthAgoDate = new Date(monthAgo);
  const monthAgoDay = monthAgoDate.getDay();
  const isSaturday = monthAgoDay === 6;
  const isSunday = monthAgoDay === 0;
  const isWeekend = (isSaturday || isSunday) ? true : false; 

  if (isWeekend) {
    if (isSunday) {
      monthAgo = monthAgo.subtract(2, 'days');
    } else {
      monthAgo = monthAgo.subtract(1, 'days');
    }

  }

  const formattedMonthAgoDate = monthAgo.format().substr(0, 10);
  
  return formattedMonthAgoDate;
};
