let now = new Date();
let dateTimeString = now.toISOString();
let formattedDateTimeString = now.toLocaleString();
let timeElement = document.getElementById("current-time");
timeElement.textContent = formattedDateTimeString;
timeElement.setAttribute("datetime", dateTimeString);