function timeSince(date) {
  let israel = moment().tz("Asia/Jerusalem").format()
  console.log(israel)
  const x = Date.parse(israel)
  console.log(x)
  let seconds = Math.floor((x - date) / 1000);


  let interval = seconds / 31536000;

  if (interval > 1) {
      return Math.floor(interval) + " שנים";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
      return Math.floor(interval) + " חודשים";
  }
  interval = seconds / 86400;
  if (interval > 1) {
      return Math.floor(interval) + " ימים";
  }
  interval = seconds / 3600;
  if (interval > 1) {
      return Math.floor(interval) + " שעות";
  }
  interval = seconds / 60;
  if (interval > 1) {
      return Math.floor(interval) + " דקות";
  }
  return Math.floor(seconds) + " שניות";
}

