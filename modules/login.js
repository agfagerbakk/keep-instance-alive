async function login(driver) {
  // const { writeToLog } = require("./util").default;
  const { By, until } = require("selenium-webdriver");
  require("dotenv").config();

  try {
    writeToLog(
      ">>> Redirecting to https://developer.servicenow.com/ssologin.do?relayState=%2Fdev.do%23%21%2Fhome"
    );
    await driver.get(
      "https://signon.service-now.com/ssologin.do?RelayState=%252Fapp%252Fservicenow_ud%252Fexks6phcbx6R8qjln0x7%252Fsso%252Fsaml%253FRelayState%253Dhttps%25253A%25252F%25252Fdeveloper.servicenow.com%25252Fdev.do&redirectUri=&email="
    );

    // enter username
    writeToLog(">>> Setting username...");
    await driver.actions().pause(5000).perform();
    await driver
      .findElement(By.name("username"))
      .sendKeys(`${process.env.EMAIL}`);

    // click next
    await driver.actions().pause(5000).perform();
    writeToLog(">>> Submit username...");
    await driver.findElement(By.id("usernameSubmitButton")).click();

    // enter password
    writeToLog(">>> Waiting for password field to appear...");
    let pwd = driver.wait(until.elementLocated(By.id("password")), 5000);
    await driver
      .wait(until.elementIsVisible(pwd), 5000)
      .sendKeys(`${process.env.PASSWORD}`);

    // click sign in
    writeToLog(">>> Find submit button");
    let signInBtn = driver.wait(
      until.elementLocated(By.id("submitButton")),
      5000
    );
    await driver.wait(until.elementIsVisible(signInBtn), 5000).click();
    writeToLog(">>> Clicked submit button");

    writeToLog(">>> Wait 5 secs for signing in");
    await driver.actions().pause(5000).perform();
    await driver.wait(until.titleContains("ServiceNow Developers"), 15000);

    writeToLog(">>> Pause 10 secs before checking instance status");
    await new Promise((resolve) => setTimeout(resolve, 10000));
  } catch (err) {
    writeToLog(">>> Error " + err);
  }
}
