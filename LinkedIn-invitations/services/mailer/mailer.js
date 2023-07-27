const { decorate, inject, injectable, named } = require('inversify');
const {By, Key, until} = require('selenium-webdriver');
const { elementLocated } = require('selenium-webdriver/lib/until');

class Mail {
    to;
    cc;
    cci;
    subject;
    body;
}

class Mailer {

    gmail = "";
    recipient = "input.agP.aFw";
    subject = "input.aoT";
    body = "div.gmail_default";
    fsBody = "td.Ap div.Am.Al";
    sendBtn = "div.T-I.J-J5-Ji.aoO.v7.T-I-atl.L3";
    outreachSendBtn = "or-shadow-host div.MuiBox-root.jss112 > div "
    testMessage = `<div>
    <p>Bonjour Laurent</p>
    <p>J'espere que vous allez bien.</p>
    <p>Voici quelques points que j'aurais aimé discuté avec vous :</p>
    <ol>
        <li>d'abord</li>
        <li>ensuite</li>
        <li>et pour finir</li>
    </ol>
    <p>je vous joins egalement <a href="https://www.google.com">ce lien</a></p>
    <img src="https://seekvectorlogo.com/wp-content/uploads/2022/02/fastspring-vector-logo-2022.png" alt="FastSrping">
</div>`

    constructor(driver) {
        this.driver = driver.get();
    }

    async send(email) {

        console.log(email)
        console.log(email instanceof Mail)

        // if(!email || !(email instanceof Mail)) {

        //     console.log("using test email")
        //     email = {
        //         to:"ldemouge@gmail.com",
        //         cc: null,
        //         cci:null,
        //         subject: "De 0 à 10, comment ça va avec Stripe, Laurent?",
        //         body:null
        //     }
        // }

       

        let driver = this.driver;

        let currentUrl = await driver.getCurrentUrl();

        if(currentUrl != "https://mail.google.com/mail/u/0/#inbox") {
            await driver.get("https://mail.google.com/mail/u/0/#inbox");
        }
        
        
        // {
        // const element = await driver.findElement(By.css(".gb_3e > svg"))
        // await driver.actions({ bridge: true }).moveToElement(element).perform()
        // }
        await driver.findElement(By.css(".T-I-KE")).click()

        await driver.wait(until.elementLocated(By.css(this.recipient)),10000)
        let field = await driver.findElement(By.css(this.recipient))
        await field.click()
        await field.sendKeys(email.to+Key.ENTER)

        await driver.wait(until.elementLocated(By.css(this.subject)),10000);
        field = await driver.findElement(By.css(this.subject))
        await field.click()
        await field.sendKeys(email.subject+Key.ENTER)

        try {
            await driver.wait(until.elementLocated(By.css(this.body)),1000);
            field = await driver.findElement(By.css(this.body))
        } catch (error) {
            await driver.wait(until.elementLocated(By.css(this.fsBody)),1000);
            field = await driver.findElement(By.css(this.fsBody))
        }
        
        // await driver.wait(until.elementLocated(By.css(this.body)),10000);
        // field = await driver.findElement(By.css(this.body))
        await field.click()
        // driver.executeScript('arguments[0].innerHTML = arguments[1];', field, this.testMessage);
        driver.executeScript('arguments[0].innerHTML = arguments[1];', field, email.body);


        // let send = await driver.findElement(By.css(this.sendBtn));
        let selector = "table tbody tr.btC td.gU.Up or-shadow-host";
        let shadowHost = await driver.findElement(By.css(selector));
        console.log(await shadowHost.getText())
        let shadowRoot = await driver.executeScript('return arguments[0].shadowRoot', shadowHost);
        
        let outreachSendBtn = await shadowRoot.findElement(By.css('div.MuiBox-root button span.MuiButton-label'));
        await outreachSendBtn.click();
        // console.log(divs.length)
        
        // const innerElement = await driver.executeScript('return arguments[0].querySelector("#inner-element")', shadowRoot);
        // console.log(await innerElement.getText());
        return;
        await driver.wait(until.elementLocated(By.css(selector)), 10000)
        // let divs = await driver.findElements(By.css(selector));

        console.log(divs.length);
        return;

        await driver.wait(until.elementLocated(By.css(this.outreachSendBtn)),10000);
        let send = await driver.findElement(By.css(this.outreachSendBtn));
        await send.click();

        driver.sleep(2000)

    }

}


decorate(injectable(), Mailer);
decorate(inject('driver'), Mailer, 0);

module.exports = Mailer;