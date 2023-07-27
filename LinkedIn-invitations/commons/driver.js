const {Builder} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options();

let drivers = {};

options.addArguments("--no-sandbox");
options.addArguments("--disable-dev-shm-usage");
options.addArguments("--disable-blink-features");
options.addArguments("--disable-blink-features=AutomationControlled");
options.addArguments("--disable-infobars");
options.addArguments("--disable-popup-blocking");
options.addArguments("--disable-notifications");


async function getDriver(debuggerAddressPort = 9988) {
  if (!drivers[debuggerAddressPort]) {

    console.log("creating driver for DebuggerAddress  " +`localhost:${debuggerAddressPort}`)

    options.debuggerAddress(`localhost:${debuggerAddressPort}`);

    drivers[debuggerAddressPort] = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  }
  
  console.log("returning driver for DebuggerAddress  " +`localhost:${debuggerAddressPort}`)
  return drivers[debuggerAddressPort];
}

module.exports = getDriver;
