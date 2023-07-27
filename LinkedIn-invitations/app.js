// app.js
require('reflect-metadata');

const container = require('./services/container');

const crypto = require('crypto');
let uuid = crypto.randomUUID();
console.log(uuid);

let post = `> Quand on n’est pas au mieux de sa forme psychologique, on se dit parfois qu’investir en soi est une dépense inutile.

Comme jeter un caillou dans un puits sans fond.

> Quand on a appris à s’en sortir toujours tout seul, on se dit parfois que c’est juste une question de temps…

Alors on sert les dents. On fait le dos rond.

On dilapide de l’argent en compensation : Alcool, tabac, malbouffe, shopping compulsif, abonnement Tinder, frais d’avocat, somnifères…

Et on perd notre plus grande richesse : notre temps.

Rappel en secondes de vidéo.

🏄‍♀️

Quand quelque chose destiné à nous faire du bien et nous aider nous semble cher demandons-nous :

1/ Combien cela me coûtera de ne pas le faire ?

2/ Est-ce que la part de moi qui s’en prive n’est pas 𝑗𝑢𝑠𝑡𝑒𝑚𝑒𝑛𝑡 la part de moi que je veux aider à avancer ?

Vous saurez tout de suite si 𝑣𝑜𝑢𝑠 𝑑𝑖𝑟𝑒 𝑜𝑢𝑖 en investissant dans de l’aide personnalisée est justifié.

Souvenons-nous :

Notre argent se regagne et se récupère.
Pas notre temps.`

let mb = async()=>{
    
    
    const sub = container.get('subscriber');
    await sub.listen();

    const pub = container.get('publisher');
    
    setInterval(async () => {
        await pub.notify('myChannel', Math.random().toString());
      }, 2000);

    



}

// mb();

let followers = async() => {
    let network = container.get('network');
    let res = await network.followers();
    console.log(res)
}

// followers()

// return;

let email = {
    to:"ldemouge@gmail.com",
    cc: null,
    cci: null,
    subject:"test animation",
    body:`<!DOCTYPE html>
    <html>
    <head>
        <title>Falling Letters</title>
        <style>
    
            #myDiv {
              animation-name: hideDiv;
              animation-duration: 2s;
              animation-delay: 5s; /* Delay before the animation starts */
              animation-fill-mode: forwards;
            }
    
            @keyframes hideDiv {
              0% {
                height: auto;
                width: auto;
                overflow: visible;
              }
              100% {
                height: 0;
                width: 0;
                visibility: hidden;
                overflow: hidden;
              }
            }
    
            @keyframes fallingLetters {
                0% {
                    opacity: 1;
                    transform: translateY(0) rotateX(0) rotateY(0) rotateZ(0);
                }
                100% {
                    opacity: 0;
                    transform: translateY(300px) rotateX(360deg) rotateY(360deg) rotateZ(360deg);
                }
            }
    
            p {
                font-size: 24px;
                display: inline-block;
            }
    
            span {
                display: inline-block;
                animation: fallingLetters linear infinite;
                animation-duration: var(--duration);
                animation-delay: var(--delay);
            }
    
            @keyframes restoreLetters {
                0% {
                    opacity: 0;
                    transform: translateY(300px) rotateX(360deg) rotateY(360deg) rotateZ(360deg);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) rotateX(0) rotateY(0) rotateZ(0);
                }
            }
    
            p.restore {
                animation: restoreLetters linear forwards;
                animation-delay: 5s;
                animation-duration: 2s;
            }
    
            body.stop-animations p span {
                animation-play-state: paused;
            }
        </style>
    </head>
    <body>
    
        <div id="myDiv">This a text <br> on one or 2 lines <br> for testing purposes</div>
        <p>
            <span style="--delay: 0s; --duration: 4s;">L</span>
            <span style="--delay: 0.2s; --duration: 3s;">o</span>
            <span style="--delay: 0.4s; --duration: 5s;">r</span>
            <span style="--delay: 0.6s; --duration: 4.5s;">e</span>
            <span style="--delay: 0.8s; --duration: 3.8s;">m</span>
            <span style="--delay: 1s; --duration: 4.2s;"> </span>
            <span style="--delay: 1.2s; --duration: 3.6s;">i</span>
            <span style="--delay: 1.4s; --duration: 5.2s;">p</span>
            <span style="--delay: 1.6s; --duration: 3.3s;">s</span>
            <span style="--delay: 1.8s; --duration: 4.8s;">u</span>
            <span style="--delay: 2s; --duration: 4s;">m</span>
            <span style="--delay: 2.2s; --duration: 3.5s;"> </span>
            <span style="--delay: 2.4s; --duration: 4.3s;">d</span>
            <span style="--delay: 2.6s; --duration: 3.2s;">o</span>
            <span style="--delay: 2.8s; --duration: 5.1s;">l</span>
            <span style="--delay: 3s; --duration: 4.7s;">o</span>
            <span style="--delay: 3.2s; --duration: 3.9s;">r</span>
            <span style="--delay: 3.4s; --duration: 4.6s;"> </span>
            <span style="--delay: 3.6s; --duration: 3.7s;">s</span>
            <span style="--delay: 3.8s; --duration: 5s;">i</span>
            <span style="--delay: 4s; --duration: 4.4s;">t</span>
            <span style="--delay: 4.2s; --duration: 3.4s;"> </span>
            <span style="--delay: 4.4s; --duration: 4.9s;">a</span>
            <span style="--delay: 4.6s; --duration: 4.1s;">m</span>
            <span style="--delay: 4.8s; --duration: 3.1s;">e</span>
            <span style="--delay: 5s; --duration: 5s;">t</span>
            <span style="--delay: 5.2s; --duration: 4.5s;">,</span>
            <span style="--delay: 5.4s; --duration: 3.8s;"> </span>
            <span style="--delay: 5.6s; --duration: 4.2s;">c</span>
            <span style="--delay: 5.8s; --duration: 3.6s;">o</span>
            <span style="--delay: 6s; --duration: 4.8s;">n</span>
            <span style="--delay: 6.2s; --duration: 4s;">s</span>
            <span style="--delay: 6.4s; --duration: 3.5s;">e</span>
            <span style="--delay: 6.6s; --duration: 4.3s;">c</span>
            <span style="--delay: 6.8s; --duration: 3.2s;">t</span>
            <span style="--delay: 7s; --duration: 5.1s;">e</span>
            <span style="--delay: 7.2s; --duration: 4.7s;">t</span>
            <span style="--delay: 7.4s; --duration: 3.9s;">u</span>
            <span style="--delay: 7.6s; --duration: 4.6s;">r</span>
            <span style="--delay: 7.8s; --duration: 3.7s;">.</span>
        </p>
        <p>
            <span style="--delay: 0s; --duration: 3.5s;">N</span>
            <span style="--delay: 0.2s; --duration: 4.1s;">u</span>
            <span style="--delay: 0.4s; --duration: 4.8s;">l</span>
            <span style="--delay: 0.6s; --duration: 3.2s;">l</span>
            <span style="--delay: 0.8s; --duration: 5s;">a</span>
            <span style="--delay: 1s; --duration: 4s;"> </span>
            <span style="--delay: 1.2s; --duration: 4.2s;">f</span>
            <span style="--delay: 1.4s; --duration: 3.8s;">a</span>
            <span style="--delay: 1.6s; --duration: 4.6s;">c</span>
            <span style="--delay: 1.8s; --duration: 3.4s;">i</span>
            <span style="--delay: 2s; --duration: 4.9s;">l</span>
            <span style="--delay: 2.2s; --duration: 3.6s;">i</span>
            <span style="--delay: 2.4s; --duration: 4.3s;">s</span>
            <span style="--delay: 2.6s; --duration: 3.1s;">i</span>
            <span style="--delay: 2.8s; --duration: 5.1s;">s</span>
            <span style="--delay: 3s; --duration: 4.7s;">i</span>
            <span style="--delay: 3.2s; --duration: 3.9s;">.</span>
            <span style="--delay: 3.4s; --duration: 4.5s;"> </span>
            <span style="--delay: 3.6s; --duration: 4.8s;">M</span>
            <span style="--delay: 3.8s; --duration: 3.5s;">a</span>
            <span style="--delay: 4s; --duration: 4.2s;">e</span>
            <span style="--delay: 4.2s; --duration: 3.7s;">c</span>
            <span style="--delay: 4.4s; --duration: 4.4s;">e</span>
            <span style="--delay: 4.6s; --duration: 3.3s;">n</span>
            <span style="--delay: 4.8s; --duration: 4.9s;">a</span>
            <span style="--delay: 5s; --duration: 4.1s;">s</span>
            <span style="--delay: 5.2s; --duration: 3.8s;"> </span>
            <span style="--delay: 5.4s; --duration: 4.6s;">i</span>
            <span style="--delay: 5.6s; --duration: 3.4s;">n</span>
            <span style="--delay: 5.8s; --duration: 4.3s;"> </span>
            <span style="--delay: 6s; --duration: 3.2s;">e</span>
            <span style="--delay: 6.2s; --duration: 4.8s;">x</span>
            <span style="--delay: 6.4s; --duration: 4s;"> </span>
            <span style="--delay: 6.6s; --duration: 3.5s;">m</span>
            <span style="--delay: 6.8s; --duration: 4.3s;">e</span>
            <span style="--delay: 7s; --duration: 3.1s;">t</span>
            <span style="--delay: 7.2s; --duration: 4.9s;">u</span>
            <span style="--delay: 7.4s; --duration: 4.7s;">s</span>
            <span style="--delay: 7.6s; --duration: 3.9s;">.</span>
        </p>
    </body>
    </html>
    `
}

let mail = async()=>{

    let mailer = container.get('mailer');
    await mailer.send(email);

}
mail();

let ai = async(post)=>{
    let ai = container.get('ai');
    let comment = await ai.comment(post);
    console.log(comment);
}

// ai(post);


let test = async ()=>{

    // const driver = container.get('driver').get();
    
    

    // let sfdcAccounts = container.get('sfdc-accounts');
    // await sfdcAccounts.open();

    let profiles = [
        "https://www.linkedin.com/in/valentin-vauchelles-997bb7155/",
        "https://www.linkedin.com/in/drobi/",
        "https://www.linkedin.com/in/john-lindsey-0bb6a3212/",
        "https://www.linkedin.com/in/jordanchenevier/",
        "https://www.linkedin.com/in/lorris-cnl/",
        "https://www.linkedin.com/in/julien-renier-086b0459/",
        "https://www.linkedin.com/in/jon2s/"
    ]

    
    let profile = container.get('profile');
    // await profile.visit("https://www.linkedin.com/in/jon2s/");
    
    
    // await profile.visit("https://www.linkedin.com/in/julien-renier-086b0459/")
    // await profile.startMessage();

    // let message = container.get('message');
    // let msg = "Hey Jon, this is my bot pinging you.\nI would personally NOT reach out to people like you\n\nno hard feelings :-))\n\nbut still you're not THAT bad\n\n\nAhahahah"

    // await message.write(msg);

    let r, res = [];


    for(let url of profiles) {
        
        await profile.visit(url);
        r = await profile.actions('message');

        for(let elem of r) {
            if(!res.includes(elem)) res.push(elem)
        }
        
        continue;

        r= await profile.scrap(url);
        res.push(r)
        // break;



       
    
    }

    res.sort();
    console.log(res)
     
    
}

// test()