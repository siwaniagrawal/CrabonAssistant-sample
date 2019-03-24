var config = require('./config')
const requestLib = require('request');
const utils = require('./utils');

const path=require('path');

const fs = require('fs');

exports.processRequest = function(conv, parameters) {
    return new Promise(function(resolve, reject) {
        if (parameters.year !== "" && parameters.country !== "") {
            let year = parameters.year;
            let country = parameters.country;
            
            let emission = "";
            fs.readFile(path.join(__dirname, './assets/raw_data_percap.json'), function(err, data) {
                if (err) {
                    return console.log(err);
                }
                console.log("data: ", JSON.parse(data));
                data = JSON.parse(data);
                data.forEach((obj) => {
                    if (obj.Country === country) {
                        console.log("Country, country ",obj.Country," and ",country);
                        emission = obj[year];
                    }
                });
                console.log("emission :", emission);
                const emissionResponse = "The percapita of " + country +" are given below";
                let finalResponseString = 'Percapita in the year ' + year  + ' iof ' + country + ' are ' + emission;
                let outputUnit = ' tons';

                finalResponseString = finalResponseString + outputUnit;
                utils.richResponse(conv, finalResponseString, emissionResponse);
                resolve();
                
               
            });

            

        } else {
            conv.ask("Sorry, need a valid country name and year. Could you please repeat your question with correct information?");
            resolve();
        }
    });
}
