const axios = require('axios');

// let id = '1eRbhwwRTMfZjrwR87YfsWRujCEp5s95dn1Y6XxD6j1Y';
let id = '1ixMvXLVCbW7CXh6g6voACDCsTx6uQ8nNPer1s7oz4vI'
// https://docs.google.com/spreadsheets/d/1ixMvXLVCbW7CXh6g6voACDCsTx6uQ8nNPer1s7oz4vI/edit?usp=sharing
let name = 'TestBoSoftwareDev--UseStripe--1-49persons--DecisionMakers-202304140115145475';

let sheetURL = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=${name}`

axios.get(sheetURL)
  .then(function (response) {
    // Handle success
    for(let i; i< 10; i++){
        console.log( i, response.data[i.toString()]);

    }
    console.log(Object.keys(response.data), response.data);



  })
  .catch(function (error) {
    // Handle error
    console.log("error");
  });

