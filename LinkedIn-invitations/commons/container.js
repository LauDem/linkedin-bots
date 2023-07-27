// container.js

const { Builder } = require('selenium-webdriver');
const { Container, decorate, injectable } = require('inversify');


const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options();

let debuggerAddressPort = 9988;

options.addArguments("--no-sandbox");
options.addArguments("--disable-dev-shm-usage");
options.addArguments("--disable-blink-features");
options.addArguments("--disable-blink-features=AutomationControlled");
options.addArguments("--disable-infobars");
options.addArguments("--disable-popup-blocking");
options.addArguments("--disable-notifications");
options.debuggerAddress(`localhost:${debuggerAddressPort}`);

// Create a new driver instance
const driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

// Define the driver instance as an injectable dependency
decorate(injectable(), driver);

// Create a new container
const container = new Container();

// Bind the driver instance to the container
container.bind('driver').toConstantValue(driver);

module.exports = container;
