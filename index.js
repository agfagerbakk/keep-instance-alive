/**
 * Script replicates the manual way of refreshing a
 * ServiceNow developer instance. I know, I'm lazy.
 */
(async () => {
  require("dotenv").config();
  const { Builder, By, until } = require("selenium-webdriver");
  const chrome = require("selenium-webdriver/chrome");
  const firefox = require("selenium-webdriver/firefox");

  // Set default screen resolution (for headless instance)
  const screenResolution = {
    width: 1280,
    height: 720,
  };

  // Set config variables
  let webdriver = process.env.WEBDRIVER || "chrome";
  let args = ["--headless ", "--disable-web-security"];

  let driver = await new Builder()
    .forBrowser(webdriver)
    .setChromeOptions(
      new chrome.Options()
        .headless()
        .addArguments(args)
        .windowSize(screenResolution)
    )
    .setFirefoxOptions(
      new firefox.Options()
        .headless()
        .addArguments(args)
        .windowSize(screenResolution)
    )
    .build();

  // Refreshing of instance starts here.
  try {
    // Go to servicenow login page
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
      .findElement(By.name('username'))
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

    await driver.wait(
      until.titleContains("ServiceNow Developers"),
      15000
    );

    writeToLog(
      ">>> Pause for 10 secs before trying to find waking up instance text"
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));

    try {

        let woken = await driver.findElement(By.xpath(
        "/html/body/dps-app//div/main/dps-home-auth-quebec//div/section[1]/div/dps-page-header/div[1]/button")).getText();

        writeToLog(woken);

        if(woken) {
          await driver.quit();
          writeToLog(">>> Instance is already awake...");
          writeToLog(">>> TERMINATING");
        }

      writeToLog(">>> Check if the 'Waking up instance is present'");
      let wakingUp = driver.wait(
        until.elementLocated(
          By.js(
            'return document.querySelector("body > dps-app").shadowRoot.querySelector("div > main > dps-home-auth-quebec").shadowRoot.querySelector("div > section:nth-child(1) > div > dps-page-header > div:nth-child(2) > div > p")'
          )
        ),
        10000
      );

      // /html/body/dps-app//div/main/dps-home-auth-quebec//div/section[1]/div/dps-page-header/div[1]/button
      // /html/body/dps-app//div/main/dps-home-auth-quebec//div/section[1]/div/dps-page-header/div[1]/button
      // /html/body/dps-app//div/main/dps-home-auth-quebec//div/section[1]/div/dps-page-header/div[1]/button
      // document.querySelector("body > dps-app").shadowRoot.querySelector("div > main > dps-home-auth-quebec").shadowRoot.querySelector("div > section:nth-child(1) > div > dps-page-header > div:nth-child(1) > button > span")

      // document.querySelector("body > dps-app").shadowRoot.querySelector("div > main > dps-home-auth-quebec").shadowRoot.querySelector("div > section:nth-child(1) > div > dps-page-header > div:nth-child(1) > button")
      // // Wait until Waking up text disappears, up to 10 mins
      writeToLog(
        ">>> Wait until Waking up text disappears, up to 10 mins"
      );
      await driver.wait(until.stalenessOf(wakingUp), 600000);
    } catch (err) {
      writeToLog(">>> ERROR wakingUp >>" + err);
    } finally {
      // The text might not be present, try to find the Start building button
      writeToLog(">>> Try to locate Start building button");
      try {
        let wakeInstanceBtn = driver.wait(
          // This spaghetti element selector is due to SN Developer page is filled with Shadow Root elements
          until.elementLocated(
            By.js(
              'return document.querySelector("body > dps-app").shadowRoot.querySelector("div > main > dps-home-auth-quebec").shadowRoot.querySelector("div > section:nth-child(1) > div > dps-page-header > div:nth-child(1) > button")'
            )
          ),
          30000
        );
        writeToLog(">>> Waking your instance up!");
        await driver.wait(until.elementIsVisible(wakeInstanceBtn), 30000).click();
        writeToLog(">>> Clicked wake instance button");
      } catch (err) {
        writeToLog(">>> ERROR wakeInstanceBtn >> " + err);
      }
    }
  } catch (err) {
    writeToLog(">>> ERROR >> " + err);
  } finally {
    // Wait 5 minutes before terminating Selenium
    setTimeout(async () => {
      await driver.quit();
    }, 300000);
    writeToLog(">>> TERMINATING");
  }
})();

function writeToLog(message) {
  console.log(new Date().toISOString().replace(/[TZ]/g, " ") + message);
}
