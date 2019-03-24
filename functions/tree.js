var config = require('./config')
const requestLib = require('request');
const utils = require('./utils');

exports.processRequest = function(conv, parameters) {
    return new Promise(function(resolve, reject) {
        if (parameters.tree_name !== "") {
            let tree_name = parameters.tree_name;
            let tree_region = "Default",
                quantity = 1;

            if (parameters.tree_region !== "")
                tree_region = parameters.tree_region;

            if (parameters.quantity !== "")
                quantity = parameters.quantity;

            console.log("tree type = " + tree_name + ", region =" + tree_region + ", quantity =" + quantity);

            var options = {
                uri: config.endpoint + "/emissions",
                method: 'POST',
                headers: {
                    'access-key': config.access_key
                },
                json: true,
                body: {
                    "item": tree_name,
                    "region": tree_region,
                    "quantity": quantity
                }
            };

            requestLib(options, function(error, response, body) {
                const emissionResponse = "The emissions absorbed by " + tree_name + " tree are given below";
                if (!error && response.statusCode === 200) {
                    console.log(body);

                    let emission = -body.emissions.CO2;
                    
                    let basicResponseString = 'Emission absorbed by ' + tree_name + ' in ' + quantity +  ' years' ;
                    let finalResponseString = "";

                    if (tree_region != "Default")
                        finalResponseString = basicResponseString + ' in ' + tree_region + ' is ' + emission;
                    else
                        finalResponseString = basicResponseString + ' is ' + emission;


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
                  utils.handleError(error, response, body, conv);
                  resolve();
                }
            });

        } else {
            conv.ask("Sorry, I did not understand the tree type you said.");
            resolve();
        }
    });
}
