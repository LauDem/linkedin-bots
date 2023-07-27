const {Key, By} = require('selenium-webdriver');
const getDriver = require('../commons/driver');
const { typeLikeHuman, getRandomInt } = require('../commons/utils');

 

async function write(text, element = null) {

    driver = await getDriver();

    await driver.sleep(2000);
    let selector = 'form.msg-form.msg-form--is-fully-expanded div.msg-form__contenteditable';
    let msgForm = await driver.findElement(By.css(selector));
    displayed  = await msgForm.isDisplayed();
    await msgForm.click();

    const lines = text.split('\n');


    for (let i = 0; i < lines.length; i++) {

        let p = await element.findElements(By.css('p'));
        console.log(p.length)

        elem = p[i];
      
        const line = lines[i];
        console.log(`line ${i} | length : ${lines[i].length} | ${lines[i]}` )

        await typeLikeHuman(elem, line);

        await elem.sendKeys(Key.RETURN);
        await new Promise(resolve => setTimeout(resolve, getRandomInt(500, 1000)));

      
    }
  }

  async function send() {

  }
  
   
//   function getRandomInt(min, max) {
//     return Math.floor(Math.random() * (max - min) + min);
//   }

  module.exports = {
    write,
    send
  }
  