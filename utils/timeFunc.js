function getTimestamp() {
  const today = new Date();
  const dateString =
    today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
  const timeString = today.getHours() + ":" + today.getMinutes();
  const timestampToday = dateString + " " + timeString;
  return timestampToday;
}

module.exports = getTimestamp();
