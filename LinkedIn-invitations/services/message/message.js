
const { decorate, inject, injectable, named } = require('inversify');
const {By, Key, until} = require('selenium-webdriver');

const { typeLikeHuman, getRandomInt } = require("../../commons/utils")

class Message 
{
    constructor(driver) {
        this.driver = driver.get();
    }
    
    async  write(text) {

        let driver = this.driver;

        await driver.sleep(2000);
        let selector = 'form.msg-form.msg-form--is-fully-expanded div.msg-form__contenteditable';
        let msgForm = await driver.findElement(By.css(selector));
        let displayed  = await msgForm.isDisplayed();
        await msgForm.click();

        const lines = text.split('\n');


        for (let i = 0; i < lines.length; i++) {

            let p = await msgForm.findElements(By.css('p'));
            console.log(p.length)

            let elem = p[i];
        
            const line = lines[i];
            console.log(`line ${i} | length : ${lines[i].length} | ${lines[i]}` )

            await typeLikeHuman(elem, line);

            await elem.sendKeys(Key.RETURN);
            await new Promise(resolve => setTimeout(resolve, getRandomInt(500, 1000)));

        
        }
  }

    async  send() {

    }
}

decorate(injectable(), Message);
decorate(inject('driver'), Message, 0);

module.exports = Message;
