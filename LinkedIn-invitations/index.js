require('reflect-metadata');
const {By, Key, until} = require('selenium-webdriver');
const { typeLikeHuman } = require('./commons/utils');
const getDriver = require('./commons/driver');
const message = require('./actions/message');


// app.js
const container = require('./commons/container');

const myInjectable = container.resolve('driver');




  
let  test = async() => {

    await myInjectable.get("https://google.com");
    return;
    
    let newConnectionNotificationSelector = "#ember2125 > span > span.notification-badge__count"

    let driver = await getDriver(9988);


    console.log("go to sudipto");
    // await driver.get('https://www.linkedin.com/in/sudipto-manna-26b09a1aa/');
    await driver.get('https://www.linkedin.com/in/jon2s/');
    
    let selector = 'div.pv-top-card-v2-ctas';
    await driver.wait(until.elementLocated(By.css(selector)), 10000);
    let buttonGroup = await driver.findElement(By.css(selector));
    let displayed  = await buttonGroup.isDisplayed();
    console.log("buttonGroup displayed : ",displayed)


    try{
        let connect =  await buttonGroup.findElement(By.css('li-icon[type="connect"]'));
        displayed  = await connect.isDisplayed();
        console.error("connection button displayed : ", displayed)
    }      
    catch(e) {
        
        // await driver.quit();
        console.error(e.name, "connectBtn");

    }

    try{
        let follow =  await buttonGroup.findElement(By.css('li-icon[type="add"]'));
        displayed  = await follow.isDisplayed();
        console.error("follow button displayed : ", displayed)
    }      
    catch(e) {
        
        // await driver.quit();
        console.error(e.name, "connectBtn");

    }

    try{
        await driver.sleep(2000)
        let messageBtn = await buttonGroup.findElement(By.css('div.entry-point'));
        displayed  = await messageBtn.isDisplayed();
        console.log("messageBtn : ", displayed)
        await messageBtn.click();
        
    }
    catch(e) {
        console.error(e.name, "messageBtn");
    }

    try {
        // await driver.sleep(2000);
        // let selector = 'form.msg-form.msg-form--is-fully-expanded div.msg-form__contenteditable';
        // let msgForm = await driver.findElement(By.css(selector));
        // displayed  = await msgForm.isDisplayed();
        // await msgForm.click();
        console.log("msgForm : ", displayed)

        let msg = "Hey Jon, this is my bot pinging you.\nI would personally NOT reach out to people like you\n\nno hard feelings :-))\n\nbut still you're not THAT bad\n\n\nAhahahah"
        // await typeLikeHuman(msgForm, msg);

        message.write(msg);

        await driver.sleep(2000);

    } catch (error) {
        console.error(error.name, "messageForm")
    }


    await driver.get('https://www.fastspring.com');

    await driver.sleep(10000)

    await driver.quit();
} 

test();