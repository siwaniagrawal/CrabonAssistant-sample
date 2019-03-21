var config = require('./config')
const requestLib = require('request');
const utils = require('./utils');

exports.processRequest = function(conv, parameters) {
    return new Promise(function(resolve, reject) {
        if (parameters.land_type !== "" && parameters.land_region !== "") {
            let land_type = parameters.land_type;
            let land_region = parameters.land_region;
            var options = {
                uri: config.endpoint + "/land",
                method: 'POST',
                headers: {
                    'access-key': config.access_key
                },
                json: true,
                body: {
                    "item": land_type,
                    "region": land_region
                }
            };

            requestLib(options, function(error, response, body) {
                const emissionResponse = "The net emission or removals  due to this land type are given below";
                if (!error && response.statusCode === 200) {
                    let emission = body.quantity;
                    let finalResponseString = 'Net emissions for ' + land_type  + ' in ' + land_region + ' are ' + emission;


                    let outputUnit = body.unit;
                    if (outputUnit !== undefined) {
                        finalResponseString = finalResponseString + ' ' + outputUnit;
                        utils.richResponse(conv, finalResponseString, emissionResponse);
                        resolve();
                    } else {
                        finalResponseString = finalResponseString + ' kg'
                        utils.richResponse(conv, finalResponseString, emissionResponse);
                        resolve();
                    }
                } else {
                  // Handle errors here
                  
                  if (!error)
                    error = body.error;
                  utils.handleError(error, response, body, conv);
                  resolve();
                }
            });

        } else {
            conv.ask("Sorry, need a valid country name and land type. Could you please repeat your question with correct information?");
            resolve();
        }
    });
    
}

