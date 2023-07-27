async function typeWithDelay(element = null, text) {
    const lines = text.split('\n');
    console.log(lines);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        // await element.sendKeys(line[j]);
        console.log(line[j])
        await new Promise(resolve => setTimeout(resolve, getRandomInt(50, 200))); // wait for a random amount of time between 50-200ms
      }
      if (i < lines.length - 1) {
        await new Promise(resolve => setTimeout(resolve, getRandomInt(500, 1000))); // wait for a longer delay between paragraphs
        // await element.sendKeys(Key.RETURN);
        console.log("return");
      }
    }
  }
  
   
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  let msg = "Hey Jon, this is my bot pinging you.\nI would personally NOT reach out to people like you\n\nno hard feelings :-))\n\nbut still you're not THAT bad\n\n\nAhahahah"


  typeWithDelay(null,msg)