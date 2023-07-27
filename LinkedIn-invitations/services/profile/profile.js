const { decorate, inject, injectable, named } = require('inversify');
const {By, Key, until} = require('selenium-webdriver');
const { getRandomInt } = require("../../commons/utils");
const { tryParse } = require('selenium-webdriver/http');

        /*

        TBD : 

        check when overflow FIRES

        selector = body.artdeco-modal-is-open

        */



class Profile {


    constructor(driver, ai) {
        this.driver = driver.get();
        this.ai = ai;

        this.degreeSelector = "div.ph5 > div.mt2.relative > div.pv-text-details__left-panel > div > span > span.dist-value";
        this.nameSelector = "div.ph5 > div.mt2.relative > div.pv-text-details__left-panel > div > h1";
        this.descriptionSelector = "div.ph5 > div.mt2.relative > div.pv-text-details__left-panel > div.text-body-medium";
        this.talksAboutSelector = 'div.ph5 > div.mt2.relative > div.pv-text-details__left-panel > div.text-body-small > span[aria-hidden="true"]';
        this.locationSelector = "div.ph5 > div.mt2.relative > div.pv-text-details__left-panel.mt2 > span.text-body-small";
        this.followersSelector = "div.ph5 > div.mt2.relative > ul > li > span"
        this.mutualConnectionSelector = 'div.ph5 > a > span > span[aria-hidden="true"]';
        this.aboutSelector = ""
        this.activitySelector = "#ember191 > div.pvs-header__container > div > div > div.pvs-header__title-container > h2"
    
    }

    // TBD : move this in UTILS
    camelCase(string) {
        const str = string;

        const camelCaseStr = str.replace(/[\W_]+/g, ' ')
            .split(' ')
            .map((word, index) => index === 0 ? word.charAt(0).toLowerCase() + word.slice(1) : word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
      

        // console.log(camelCaseStr); // "endProfileInAMessage"

        return camelCaseStr;

    }

    async scrap(url) {  //TBD : change param with ProfileVO firstname lastname company url
        
        await this.visit(url);

        let scrapingResult = {
            degree: await this.degree(),
            about: await this.about(),
            activity: await this.activity(),
            description: await this.description(),
            followers: await this.followers(),
            location: await this.location(),
            mutualConnection: await this.mutualConnection(),
            name: await this.name(),
            talksAbout: await this.talksAbout(),
            experiences: await this.experiences()
        };

        console.clear();
        console.log(scrapingResult)

        return scrapingResult;


    }

    async visit(url) {
        await this.driver.get(url);
    }

    async follow() {

        try {
            await this.actions('follow');
            return true;
        } catch (error) {
            return false;
        }
        
    }

    async connect() {
        try {
            await this.actions('connect');
            return true;
        } catch (error) {
            return false;
        }

    }

    async actions(action) {

        let availableActions = [
            'aboutThisProfile',
            'aboutThisProfileAboutThisProfile',
            'connect',
            'follow',
            'following',
            'giveKudos',
            'message',
            'more',
            'recommend',
            'removeConnection',
            'reportBlock',
            'requestARecommendation',
            'saveToPDF',
            'sendProfileInAMessage'
          ];


        let driver = this.driver;
        let actions = {};
        driver.wait(until.elementLocated(By.css("div.pvs-profile-actions")), 2000)
        let btnGroup = await this.driver.findElements(By.css("div.pvs-profile-actions > *"));
        
        let i= [];

        for(let btn of btnGroup) {
            let key = await btn.getText();
            key = this.camelCase(key);
            if(key.length <1) key = "more";
            actions[key] = btn;
            i.push(key);

            // continue;

            if(key == action) {
                await btn.click();
                return;
            }
            // console.log(actions);
        }

        await actions.more.click();

        let moreActions = await actions.more.findElements(By.xpath("./div/div/ul/li"));

        
        for(let mo of moreActions) {
            let key = await mo.getText();
            if (key.length < 1) continue;
            key = this.camelCase(key);
            i.push(key);

            // continue;

            if(key == action) {
                await btn.click();
                return;
            }
            // console.log(i, key);

            // if(i==6) console.log(key.length)
            // i++
        }
        // console.log(i)
        // console.log(moreActions.length)

        //TBD : wait before closing the overflow menu so that it's not too quick and detected

        await actions.more.click();

        return i;

        // throw new Error()

    }

    async startMessage() {

        let driver = this.driver;

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
    }

    async degree() {
        try {
            await this.wait();
            await this.driver.wait(until.elementLocated(By.css(this.degreeSelector)), 2000);
            let elem = await this.driver.findElement(By.css(this.degreeSelector));
            let degree = await elem.getText()
            console.log(degree[0]);
            return Number(degree[0])
        } catch (err) {
            console.log("degree ", err.name)
            return null;
        }
    }

    async name() {
        try {
            await this.driver.wait(until.elementLocated(By.css(this.nameSelector)), 2000);
            let elem = await this.driver.findElement(By.css(this.nameSelector));
            let name = await elem.getText()
            console.log(name);
            return name;
        } catch (err) {
            console.log("name ", err.name)

            
        }
    }

    async description() {
        try {
            await this.driver.wait(until.elementLocated(By.css(this.descriptionSelector)), 2000);
            let elem = await this.driver.findElement(By.css(this.descriptionSelector));
            let name = await elem.getText()
            console.log(name);
            return name;

        } catch (err) {
            console.log("description ", err.name);
            return null;

        }
    }

    async talksAbout() {
        try {
            await this.driver.wait(until.elementLocated(By.css(this.talksAboutSelector)), 2000);
            let elem = await this.driver.findElement(By.css(this.talksAboutSelector));
            let text = await elem.getText()
            console.log(text);
            return text;

        } catch (err) {
            console.log("talksAbout ", err.name)
            return null;
        }
    }

    async location(){
        try {
            await this.driver.wait(until.elementLocated(By.css(this.locationSelector)), 2000);
            let elem = await this.driver.findElement(By.css(this.locationSelector));
            let text = await elem.getText()
            console.log(text);
            return text;

            
        } catch (err) {
            console.log("location ", err.name)
            return null;

        }
    }

    async mutualConnection() {
        try {
            await this.driver.wait(until.elementLocated(By.css(this.mutualConnectionSelector)), 2000);
            let elem = await this.driver.findElement(By.css(this.mutualConnectionSelector));
            let text = await elem.getText()
            console.log(text);
            return text;

        } catch (err) {
            console.log("mutualConnection  ", err.name)
            return null;
        }
    }

    async followers() {
        try {
            await this.driver.wait(until.elementLocated(By.css(this.followersSelector)), 2000);
            let elem = await this.driver.findElement(By.css(this.followersSelector));
            let text = await elem.getText();
            console.log(text);
            return text;

        } catch (err) {
            return null;
        }
    }

    async about() {
        return null;
    }

    async seeAllRecentActivity() {

        let selector = "a#navigation-index-see-all-recent-activity";
        let link = await this.driver.findElement(By.css(selector));
        await link.click();
        // TBD 
        // call recentactivity service
        // handle
        await this.driver.navigate().back()
    }
    
    
    async activity() {
        let elem = await this.driver.findElement(By.css("div#recent_activity"));
        let section = await elem.findElement(By.xpath('..'));
        let activities = await section.findElements(By.css("div.pvs-list__outer-container > ul > li"));
        // let activities = await list.findElements(By.css("li"));

        console.log(activities.length)

        if(activities.length == 1) {
            let text = await activities[0].findElement(By.css("div > div.display-flex.flex-column.full-width.align-self-center > div > div.display-flex.flex-column.full-width > div > span > span.visually-hidden")).getText();
            console.log(text)
            console.log(text.includes("hasn't posted lately"))

            if(text.includes("hasn't posted lately")) return 0;
        }

        return activities.length;


        // NOT LIVE : Load recent activities and comment it
        for(let activity of activities ) {
            let link = await activity.findElement(By.css("div > div > a.pr4.pb2"))
            let text = await link.getAttribute('aria-label');
            console.log(text);
            await this.ai.comment(text);
            await this.driver.sleep(1000)
        }
    }

    async experiences() {
        let result = {};
        await this.driver.wait(until.elementLocated(By.css("div#experience")), 2000)
        let elem = await this.driver.findElement(By.css("div#experience"));
        let section = await elem.findElement(By.xpath('..'));
        let experiences = await section.findElements(By.xpath("./div/ul/li"));
        console.log(experiences.length)


        for(let i=0; i<experiences.length; i++ ) {

            let title, company, timeframe;

            try {
                 title = await experiences[i].findElement(By.css("span.mr1.t-bold > span")).getText()
            } catch (error) {
                 title = null
            }

            try {
                company = await experiences[i].findElement(By.css("span.t-14 > span")).getText()
            } catch (error) {
                company=null;
            }

            try {
                timeframe = await experiences[i].findElement(By.css("span.t-black--light > span")).getText()
            } catch (error) {
                timeframe = null;
            }

            result[i] = {
                title: title,
                company: company,
                timeframe: timeframe
            };


            // result[i] = {title: await experiences[i].findElement(By.css("span.mr1.t-bold > span")).getText()};
        }
        
        return result;

    }

    async wait() {

        await this.driver.sleep(getRandomInt(2000,5000))

    }
}

decorate(injectable(), Profile);
decorate(inject('driver'), Profile, 0);


module.exports = Profile;