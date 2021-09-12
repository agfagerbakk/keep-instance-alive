function writeToLog(message) {
  console.log(new Date().toISOString().replace(/[TZ]/g, " ") + message);
}
