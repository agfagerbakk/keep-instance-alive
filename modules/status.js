async function instanceStatus(driver) {
  try {
    // const { writeToLog } = require("./util").default;
    let button = await driver.findElement(
      By.js(
        'return document.querySelector("body > dps-app").shadowRoot.querySelector("div > main > dps-home-auth-quebec").shadowRoot.querySelector("div > section:nth-child(1) > div > dps-page-header > div:nth-child(1) > button")'
      )
    );

    if ((await button.getAttribute("label")).match("Start Building ")) {
      writeToLog("Instance already awake, TERMINATING!");
      await driver.quit();
      await new Promise((resolve) => setTimeout(resolve, 10000));
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

    writeToLog(">>> Wait until waking up text disappears, up to 10 mins");
    await driver.wait(until.stalenessOf(wakingUp), 600000);
  } catch (err) {
    writeToLog(">>> ERROR waking up >>" + err);
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
}

module.exports = instanceStatus;
