const { decorate, inject, injectable, named } = require('inversify');
const {By, Key, until} = require('selenium-webdriver');

class Network {

    constructor(driver) {
        this.driver = driver.get();
    }

    async followers(lastKnownId="ACoAADMsuWoB_3-a8HP5bbL6yCxDAqCJmfSnPZ4") {

            const url = "https://www.linkedin.com/mynetwork/network-manager/people-follow/followers/";
            const currentUrl = await this.driver.getCurrentUrl();

             url == currentUrl 
                ? (async ()=>{
                    await this.driver.navigate().refresh();
                    console.log("refreshed")
                })()
                : (async ()=>{
                    await this.driver.get(url);
                    console.log("navigated")
                })()

            const selector = "div#mynetwork  main  ul  ul";

            let list = await this.driver.findElement(By.css(selector));

            let items = await list.findElements(By.css('li'));

            let baseUrl = 'https://www.linkedin.com/in/';

            let arr = [];

            for(let item of items) {
                let res = await item.getText();
                console.log(res, res.includes('\n'))
                let linkElem = await item.findElement(By.css('a'));
                let link = await linkElem.getAttribute('href');

                let id = link.replace(new RegExp(baseUrl, 'gi'), '');
                // console.log(id)

                if(id==lastKnownId) break;

                arr.push(id)

                

            }
            console.log(`${arr.length}/${items.length}`)

            return currentUrl;

    }


}

decorate(injectable(), Network);
decorate(inject('driver'), Network, 0);
decorate(inject('ai'), Network, 1);

module.exports = Network;