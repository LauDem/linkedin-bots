const redis = require('redis');

// Create a Redis client
const client = redis.createClient({socket:{ host: 'localhost', port: 6379 }});
client.on('ready', (err, result) => {
    if(err) console.log("error - not ready");
    console.log("ready",result)
})
client.connect();
// client.connect();

let run = async()=> {

    // let c = await client.connect();
    // console.log(c);
    
    
    
    // let pro = await ready;

    // console.log(pro, "bye")

    // console.log("checking if connected")

    

    // console.log("connected")

    // console.log("running", client)


    // Add some elements to the list
    c = await client.rPush('myList', ["demouge", "laurent"]);

    console.log("rPush", c);

    c = await client.lRange('myList', 0, -1);

    console.log("lRange", c)

    // Pop the first element from the list
    // c = await client.lPop('myList');
    // console.log("lPop", c)

    // Check the list after popping
    c = await client.lRange('myList', 0, -1);

    console.log("lRange", c)
    
    

        

    }

run()
