

async function typeLikeHuman(elem, myString) {


        

        for (let j = 0; j < myString.length; j++) {


            try {
                console.log(myString[j])
                await elem.sendKeys(myString[j]);
            } catch (e) {

              // TBD send an event or something
              // we want to log the errors and handle them
                console.log(console.log(e.message, ` failed write character on line ${j}`))
                await new Promise(resolve => setTimeout(resolve, 20000))  //to be removed
            }


            await new Promise(resolve => setTimeout(resolve, getRandomInt(50, 200))); // wait for a random amount of time between 50-200ms
      }

  }
  
   
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  module.exports = { typeLikeHuman, getRandomInt }
  