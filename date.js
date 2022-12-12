
exports.getDate = getDate;
exports.getDay = getDay;

function getDate(){
  let day = new Date();
  let options = {
    weekday:"long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  today = day.toLocaleDateString(("en-US"), options);

  return day;
}

function getDay(){
  let day = new Date();
  let options = {
    weekday:"long"
  };
  today = day.toLocaleDateString(("en-US"), options);

  return day;
}
