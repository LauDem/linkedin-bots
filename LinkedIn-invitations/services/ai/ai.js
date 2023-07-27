const { decorate, inject, injectable, named } = require('inversify');
const { Configuration, OpenAIApi } = require('openai');


class AI {

    openai;

    constructor() {

        const configuration = new Configuration({
            // organization: "org-OONrIM1bRaFOraUujHI9o9Zj",
            apiKey: "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",
        });
        this.openai = new OpenAIApi(configuration);
        
    }

    async comment(text) {

        let testPost = `Attn Founders!

        💢 Your VC messaging is NOT your market messaging.
        
        They have very different attributes & purposes:
        
        👔 VC Message
        
        → Broad & ambitious
        → Communicate the growth potential
        → Audience goal — big exit
        
        The purpose?
        
        💰 Raise money
        _________________________________
        
        👩 Market Message
        
        → Focused & honest
        → Communicate impact for a user
        → Audience goal — problem solved
        
        The purpose?
        
        👤 Get a new user
        ;`

        testPost = `Quand j’ai codé mon premier site web à 12 ans j’avais l’impression d’être un hacker 😎

        Quand j’ai appris le C et le C++ quelques années plus tard, j’ai eu l’impression de me rapprocher un peu plus de ce que faisait un hacker.
        
        Mais j’ai aussi compris qu’avec mon site web en HTML à 12 ans, j’étais bien loin d’être un hacker !
        
        ☝️ Plus on apprend, plus on se rend compte que l’on sait peu.
        
        Depuis ça ne s’est pas amélioré.
        
        Après maintenant 12 ans d’expérience professionnelle, je ne suis toujours pas un hacker 🤣 Je n’en ai plus envie.
        
        Surtout je me rends compte qu’à 12 ans, 15 ans, 20 ans et même l’année dernière je ne savais vraiment rien.
        
        Je ne cesse d’apprendre dans ce métier. J’ai une vision plus globale de “l’informatique” et j’ai conscience que je ne saurai jamais tout.
        
        Alors maintenant je choisis ce que j’apprends.
        
        Je le fais en fonction de mes objectifs business, des besoins clients ou de mes envies sur le moment pour m'amuser.
        
        Les deux seuls pièges à éviter en tant que développeur :
        
        👉 penser qu’on peut tout savoir
        👉 arrêter d’apprendre un jour
        
        On peut devenir un très bon développeur si on continue à apprendre et à se remettre en question.
        
        C’est ce que je m’efforce de faire chaque jour.`

        let post = !text ? testPost : text; 

        let prompt = "Your are a benevolent, straightforward and opinonated solution's architect with 20 years of experience. I will give you a linkedin post. please write a 20 to 50 words long comment in the same language like the post. here is the post \n\n"+post

        
        const response = await this.openai.createCompletion({
        model: "text-davinci-003",
        prompt:prompt,
        max_tokens: 100,
        temperature: 0.8,
        });

        console.log({comment: response.data.choices[0].text});

        
    }

    async react() {

    }

    async #callOpenaAI(prompt, max_tokens){

    }

}

decorate(injectable(), AI);
// decorate(inject('driver'), Mailer, 0);

module.exports = AI;


