//message-bus.js

const { decorate, injectable } = require('inversify');
const redis = require('redis');

const socket = { host: 'localhost', port: 6379 };

class Client {

    constructor() {

        this.client = redis.createClient({socket: socket});
        this.client.connect();

        this.ready = new Promise((resolve)=>{this.client.on('ready', () => {
            console.log(`Redis client ${this.name} connected`);
            resolve();
        });})
        
        this.client.on('error', (error) => {
            console.error(`Redis error: ${error}`);
          });

        process.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Process ${this.name} exited with code ${code}`);
        }
        });

    }
}

class Publisher extends Client {

    name = "Publisher";

    constructor(){
        super()
    }

    // constructor() {

    //     this.client = redis.createClient({socket: socket});
    //     this.client.connect();

    //     this.ready = new Promise((resolve)=>{this.client.on('ready', () => {
    //         console.log(`Redis client ${this.name} connected`);
    //         resolve();
    //     });})
        
    //     this.client.on('error', (error) => {
    //         console.error(`Redis error: ${error}`);
    //       });

    //     process.on('exit', (code) => {
    //     if (code !== 0) {
    //         console.error(`Process ${this.name} exited with code ${code}`);
    //     }
    //     });

    // }
    

    async notify(channel, message, timeout=5000) {
        console.log('checking if client is ready')
        await this.ready;
        console.log("client is ready")
        console.log(`received message ${message} to publish in channel ${channel}`)

        return new Promise((resolve, reject) => {
            
            this.client.publish(channel, message, (err, reply) => {
                
                if (err) {
                    reject(err);
                } else {
                    resolve(reply);
                }
            });
        });
        // this.client.publish(channel, message, (err)=> {
        //     if(err) {console.log("error publishing")}
        //     console.log('no error')
        // })
    }


}

class Subscriber extends Client{

    name = "Subscriber";
    
    constructor() {
        super()
    }

    // constructor() {

    //     this.client = redis.createClient({socket: socket});
    //     this.client.connect();

    //     this.ready = new Promise((resolve)=>{this.client.on('ready', () => {
    //         console.log(`Redis client ${this.name} connected`);
    //         resolve();
    //     });})
        
    //     this.client.on('error', (error) => {
    //         console.error(`Redis error: ${error}`);
    //       });

    //     process.on('exit', (code) => {
    //     if (code !== 0) {
    //         console.error(`Process ${this.name} exited with code ${code}`);
    //     }
    //     });

    // }

    async listen() {
        await this.ready;

        // let handler = "toto";

        let handler = (message)=>{
            console.log(`A message was received in channel. Here it is\n\n ${message}`);
        }
        function test(c,m) {}
        // this.client.subscribe('myChannel', handler);
        this.client.subscribe('myChannel', (message, channel) => {
              console.log(`Received message "${message}" on channel "${channel}"`);
            });
          
        // this.client.on('message', handler)
    }
}

decorate(injectable(), Publisher);
decorate(injectable(), Subscriber);
decorate(injectable(), Client);

module.exports = {Publisher, Subscriber};