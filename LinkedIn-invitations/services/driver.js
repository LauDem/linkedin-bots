const { decorate, injectable } = require('inversify');

class Driver {

    constructor() {

        const {Builder} = require('selenium-webdriver');
        const chrome = require('selenium-webdriver/chrome');
        const options = new chrome.Options();
        const service = new chrome.ServiceBuilder('/Users/ldemouge/SRC/bots/chromedriver_mac64/chromedriver');

        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--disable-blink-features");
        options.addArguments("--disable-blink-features=AutomationControlled");
        options.addArguments("--disable-infobars");
        options.addArguments("--disable-popup-blocking");
        options.addArguments("--disable-notifications");
        options.debuggerAddress("localhost:9988");

        this.driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .setChromeService(service)
            .build();

    }

    get() {
        return this.driver;
    }

}

decorate(injectable(), Driver);

module.exports = Driver;