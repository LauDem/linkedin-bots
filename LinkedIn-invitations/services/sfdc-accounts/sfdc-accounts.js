
const { decorate, inject, injectable, named } = require('inversify');
const {By, Key, until} = require('selenium-webdriver');

const { typeLikeHuman, getRandomInt } = require("../../commons/utils")

class SfdcAccounts 
{
    // tableRowsSelector = "#report-main > div.reportBuilderContainer > div.reportBuilder  div.widget-container.widget-container_table table.data-grid-table tbody tr";

    iFrame = "div.mainContentMark > div.maincontent div#brandBand_2 div.oneCenterStage iframe "
    
    constructor(driver) {
        this.driver = driver.get();
    }
    
    async  open(myReportUrl = "https://fastspring.lightning.force.com/lightning/r/Report/00O8b000009CxOTEA0/view?queryScope=userFolders") {

        let driver = this.driver;
        await driver.get(myReportUrl);
        await driver.sleep(5000);

        
        try {

            let iframe = await driver.wait(until.elementLocated(By.css(this.iFrame)), 20000);

            
            await driver.switchTo().frame(iframe);

            await driver.wait(until.elementLocated(By.css("#report-00O8b000009CxOTEA0 > div > div.dashboard-container.with-header > div.dashboard-builder-body.dashboard-show-header > div > div > div > div > div > div > div.grid-layout > div > div > div.widget-container.widget-container_scroll-container > div > div > div > div.widget-container.widget-container_table > div > div > div > div > div > div > div:nth-child(3) > table")));
            
            let rows = await driver.findElements(By.css(" div.dashboard-container.with-header > div.dashboard-builder-body.dashboard-show-header > div > div > div > div > div > div > div.grid-layout > div > div > div.widget-container.widget-container_scroll-container > div > div > div > div.widget-container.widget-container_table > div > div > div > div > div > div > div:nth-child(3) > table > tbody > tr"));
            console.log(rows[1])
            
            let cell = await rows[1].findElements(By.css("td > div > div"));
            console.log("found ", cell.length)

            // let elem = await cell[].findElement(By.css("div > div"));
            let val = await cell[2].getAttribute("data-tooltip")
            console.log(val);


            await cell[2].click()

            
            console.log("going to sleep");
            await driver.sleep(1000)

            // Get the current URL
            const currentUrl = await driver.getCurrentUrl();
            let url = currentUrl.slice(0, -5)

            // Navigate to a child URL
            await driver.navigate().to(`${url}/related/AccountContactRelations/view`);

            await driver.wait(until.elementLocated(By.css('table[aria-label="Related Contacts"]')), 5000)
            console.log("found table")

            await driver.sleep(2000)

            rows = await driver.findElements(By.css('table[aria-label="Related Contacts"] tr '));
            console.log(rows.length + " rows")


            let cells = await rows[1].findElements(By.css("td"));
            console.log(cells.length + " cells")

            let i=0;

            for(let cell of cells) {
                let text = await cell.getText();
                console.log(`${i} => ${text}`);
                i++;
            }

            cells = await rows[1].findElements(By.css("th"));
            console.log(cells.length + " th")

            let link = await cells[0].findElement(By.css('a'));

            await link.click();

            await driver.wait(until.elementLocated(By.css("iframe")),10000)

            console.log("iframe found");

            await driver.wait(until.elementLocated(By.css("iframe")), 20000);

            let iframes = await driver.findElements(By.css("iframe"));

            console.log(`found ${iframes.length} iframes`)

            // await driver.switchTo().frame(iframe);

            // await driver.wait(until.elementsLocated(By.css("a.social-icon")),10000);

            // console.log("social icon found")


            await driver.sleep(5000);


            

            // Scroll the page to the bottom
            // await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');

            // Wait for new content to load
            await driver.sleep(2000);

        } catch (err) {
            console.log(err)
        }
        // let rowSelector = "tbody tr"
        // let rows = await table.findElements(By.css(rowSelector));
        // 
  }

    async  send() {

    }
}

decorate(injectable(), SfdcAccounts);
decorate(inject('driver'), SfdcAccounts, 0);

module.exports = SfdcAccounts;
