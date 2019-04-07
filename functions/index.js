'use strict';
const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const {
    dialogflow,
    Permission,
    Suggestions,
    BasicCard,
    SimpleResponse,
    List
} = require('actions-on-google'); // Google Assistant helper library
const requestLib = require('request');
var config = require('./config');
var flights = require('./flights');
var vehicles = require('./vehicles');
var fuels = require('./fuels');
var electricity = require('./electricity');
var poultry = require('./poultry');
var appliances = require('./appliances');
var trains = require('./trains');
var land = require('./land');

const app = dialogflow({
    debug: true
});



// The default welcome intent has been matched, welcome the user (https://dialogflow.com/docs/events#default_welcome_intent)
app.intent('Default Welcome Intent', (conv) => {
    const options = {
        context: `Hello, Welcome to CarbonFootPrint Action! To address you by name and provide you relatable emission comparisons based on your location`,
        // Ask for more than one permission. User can authorize all or none.
        permissions: ['NAME', 'DEVICE_PRECISE_LOCATION'],
    };
    if ((!conv.user.storage.name || !conv.user.storage.location) && !conv.user.storage.noPermission)
        conv.ask(new Permission(options));
    else {
        if (!conv.user.storage.noPermission) {
            const name = conv.user.storage.name.given;
            conv.ask(`Hello ${name}, what's the info you need today? Feel free to ask what I can do for assistance or you can simply say 'help'`);
        } else {
            conv.ask(`Hey there!, what's the info you need today? Feel free to ask what I can do for assistance or you can simply say 'help'`);
        }
    }
});

app.intent('actions.intent.OPTION', (conv, parameters, option) => {
    console.log("");
    let response = 'You did not select any item';
    if (option) {
      response = "Hoorah! You selected " + option;
    }
    conv.ask(response); 
});

app.intent('request_permission', (conv) => {
    const options = {
        context: `Hello, Welcome to CarbonFootPrint Action! To address you by name and provide you relatable emission comparisons based on your location`,
        // Ask for more than one permission. User can authorize all or none.
        permissions: ['NAME', 'DEVICE_PRECISE_LOCATION'],
    };
    if (!conv.user.storage.name || !conv.user.storage.location)
        conv.ask(new Permission(options));
    else
        conv.ask(`I already have all the permissions I need. Thanks!`);
});

app.intent('permission_confirmation', (conv, parameters, permission_allowed) => {
    if (permission_allowed) {
        const {
            location
        } = conv.device;
        const {
            name
        } = conv.user;

        conv.user.storage.noPermission = false;
        conv.user.storage.name = name;
        conv.user.storage.location = location;

        const {
            latitude,
            longitude
        } = location.coordinates;
        conv.ask(`Ok ${name.given}, we are all set!`);
    } else {
        //For display screens
        if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')){
            conv.ask(` Unfortunately, we can't provide you intelligent emission results without the location information.
                Therefore, you'll only be able to receive raw emission results. You can allow the permission if you change your mind.`);
            conv.ask(new Suggestions(['Request Permission', 'Allowed Permission']));    
            conv.user.storage.noPermission = true;
        } else if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')){
            // google home
            conv.ask(` Unfortunately, we can't provide you intelligent emission results without the location information.
                Therefore, you'll only be able to receive raw emission results. You can allow the permission if you change your mind.`);
            conv.user.storage.noPermission = true;

        }
        

    }
});

app.intent('help_intent', (conv) => {
    //google home
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')){
        conv.ask(`I can try to answer some of your emission related questions. I promise to make it less boring by giving you info that you can relate with!I can provide you with info regarding emissions released due to appliance usage, flight travels, train journeys, road trips, fuel consumption, poultry and meat generation and electricity generation across the world.  You can ask me about how much emissions your washing machine produces, or, how much pollution you contribute to by taking a flight to Mauritius. I support limited number of categories right now but trust me I'll get better over time.`)
    } else if(conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')){
    //display screens
        conv.ask(new SimpleResponse({
            speech: "I can tell you the emissions produced by different activities and appliances. Try asking me about them.",
            text: "Here's what I can do:"
        }));
        conv.ask(new BasicCard({
            title: '',
            text: "**Appliances**  \n  \ne.g: *How much emissions are produced if a radio is used for 3 hours in Canada?* \n  \n  \n**Travel \u0026 Journeys**  \n  \nYou can ask about emissions generated due to a travel by flight,"
             +" train or a private vehicle by road between two places, optionally, with no. of passengers if you"+
              "know.  \n  \ne.g: *How much emissions are produced due to flight from Mumbai to Seattle airport with 1202 passengers?*  \n  \nThere is much more I can do. Click Read More to know more.",
            
            buttons: [
                {
                 title: "Read More",
                 openUrlAction: {
                    url: "https://gitlab.com/aossie/CarbonAssistant-Function/tree/master/docs/Usage.md",
                    urlTypeHint: "URL_TYPE_HINT_UNSPECIFIED"
                    }
                }
            ]
        }));
    }
        
    
});

app.intent('trains_intent', (conv, parameters) => { 
    conv.user.storage.lastParams = parameters;
    if (!conv.user.storage.noPermission)
        return trains.processRequest(conv, parameters, true);
    else
        return trains.processRequest(conv, parameters, false);
});

app.intent('trains_intent - followup', (conv, parameters) => {
    let contextParams = conv.user.storage.lastParams;
    let newParams = {};

    if (parameters.origin && parameters.origin !== "")
        newParams.origin = parameters.origin;
    else
        newParams.origin = contextParams.origin;

    if (parameters.destination && parameters.destination !== "")
        newParams.destination = parameters.destination;
    else
        newParams.destination = contextParams.destination;

    if (parameters.passengers && parameters.passengers !== "")
        newParams.passengers = parameters.passengers;
    else
        newParams.passengers = contextParams.passengers;

    conv.user.storage.lastParams = newParams;

    if (!conv.user.storage.noPermission)
        return trains.processRequest(conv, newParams, true);
    else
        return trains.processRequest(conv, newParams, false);
});

app.intent('vehicle_intent', (conv, parameters) => {
    conv.user.storage.lastParams = parameters;
    if (!conv.user.storage.noPermission)
        return vehicles.processRequest(conv, parameters, true);
    else
        return vehicles.processRequest(conv, parameters, false);
});

app.intent('vehicle_intent - followup', (conv, parameters) => {
    let contextParams = conv.user.storage.lastParams;
    let newParams = {};

    if (parameters.origin && parameters.origin !== "")
        newParams.origin = parameters.origin;
    else
        newParams.origin = contextParams.origin;

    if (parameters.destination && parameters.destination !== "")
        newParams.destination = parameters.destination;
    else
        newParams.destination = contextParams.destination;

    if (parameters.mileage && parameters.mileage !== "")
        newParams.mileage = parameters.mileage;
    else
        newParams.mileage = contextParams.mileage;

    if (parameters.emission_type && parameters.emission_type !== "")
        newParams.emission_type = parameters.emission_type;
    else
        newParams.emission_type = contextParams.emission_type;

    if (parameters.fuel_type && parameters.fuel_type !== "")
        newParams.fuel_type = parameters.fuel_type;
    else
        newParams.fuel_type = contextParams.fuel_type;

    conv.user.storage.lastParams = newParams;

    if (!conv.user.storage.noPermission)
        return vehicles.processRequest(conv, newParams, true);
    else
        return vehicles.processRequest(conv, newParams, false);
});

app.intent('flights_intent', (conv, parameters) => {
    conv.user.storage.lastParams = parameters;
    if (!conv.user.storage.noPermission)
        return flights.processRequest(conv, parameters, true);
    else
        return flights.processRequest(conv, parameters, false);
});

app.intent('flights_intent - followup', (conv, parameters) => {
    let contextParams = conv.user.storage.lastParams;
    let newParams = {};

    if (parameters.origin && parameters.origin !== "") {
        newParams.origin = parameters.origin;
        newParams.origin_original = newParams.origin_original;
    } else {
        newParams.origin = contextParams.origin;
        newParams.origin_original = contextParams.origin_original;
    }

    if (parameters.destination && parameters.destination !== "") {
        newParams.destination = parameters.destination;
        newParams.destination_original = parameters.destination_original;
    } else {
        newParams.destination = contextParams.destination;
        newParams.destination_original = contextParams.destination_original;
    }

    if (parameters.passengers && parameters.passengers !== "")
        newParams.passengers = parameters.passengers;
    else
        newParams.passengers = contextParams.passengers;

    conv.user.storage.lastParams = newParams;

    if (!conv.user.storage.noPermission)
        return flights.processRequest(conv, newParams, true);
    else
        return flights.processRequest(conv, newParams, false);
});

app.intent('fuels_intent', (conv, parameters) => {
    return fuels.processRequest(conv, parameters);
});

app.intent('electricity_intent', (conv, parameters) => {
    return electricity.processRequest(conv, parameters);
});

app.intent('poultry_intent', (conv, parameters, option) => {
    if (parameters.poultry_type === ""){
            let dataArr = ["egg", "lamp", "beef", "turkey", "broiler chicken", "pork"];
            let items = {};
            
            dataArr.forEach(element => {
                items[element] = { // key
                title: element
                // optional: array of synonyms, description, image
                }
            });
            conv.ask('This is the list of poultry types Please choose one So, that I can provide you the exact value of the emission.');
            conv.ask(new List({
                title: "Poultry Types List",
                items: items
            }));

        conv.user.storage.lastParams = parameters;
        
        console.log("parametersfinal:", parameters);
    } else {
        return poultry.processRequest(conv, parameters);
    }
});

app.intent('poultry_region_list?',(conv, parameters,option) => {
    parameters.poultry_type=option;
    if (parameters.poultry_region === ""){
        if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
            conv.ask("do you want to provide region name?")
            conv.ask(new Suggestions(`provide poultry region`));
            conv.ask(new Suggestions('no poultry region'));
        }
        conv.user.storage.lastParams = parameters;
        
    } else {
        return poultry.processRequest(conv, parameters);
    }
    console.log("final2 parameters", parameters);
});

app.intent('poultry_region_list? - yes', (conv, parameters, option) => {
    parameters.poultry_type=conv.user.storage.lastParams.poultry_type;
    if (parameters.poultry_region === ""){
        
        if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
          // Create a list
            let dataArr = ["ohio", "idaho", "michigan"];
            let items = {};
            
            dataArr.forEach(element => {
                items[element] = { // key
                title: element
                // optional: array of synonyms, description, image
                }
            });
            conv.ask('This is the list of poultry regions Please choose one So, that I can provide you the exact value of the emission.');
            conv.ask(new List({
                title: "Poultry Regions List",
                items: items
            }));

        }
        conv.user.storage.lastParams = parameters;
        
        console.log("parametersfinal:", parameters,"region option",option,"lastparams", conv.user.storage.lastParams);
    } else {
        return poultry.processRequest(conv, parameters);
    }
});    

app.intent('poultry_emission1',(conv,parameters,option) => {

    let contextParams = conv.user.storage.lastParams;
    let newParams = {};
    
    if (parameters.poultry_region && parameters.poultry_region !== "")
        newParams.poultry_region = parameters.poultry_region;
    else if(option)
        newParams.poultry_region = option;
    else
        newParams.poultry_region = contextParams.poultry_region;
    
    if (parameters.poultry_quantity && parameters.poultry_quantity !== "")
        newParams.poultry_quantity = parameters.poultry_quantity;
    else
        newParams.poultry_quantity = contextParams.poultry_quantity;    

    
    if (parameters.poultry_type && parameters.poultry_type !== "")
        newParams.poultry_type = parameters.poultry_type;
    // else if(option)
    //     newParams.poultry_type = option;
    else
        newParams.poultry_type = contextParams.poultry_type;
    conv.user.storage.lastParams = newParams;

    return poultry.processRequest(conv, newParams, option);
});

app.intent('appliance_intent', (conv, parameters) => {
    conv.user.storage.lastParams = parameters;
    if (!conv.user.storage.noPermission)
        return appliances.processRequest(conv, parameters, true);
    else
        return appliances.processRequest(conv, parameters, false);
});

app.intent('appliance_intent - followup', (conv, parameters) => {
    let contextParams = conv.user.storage.lastParams;
    let newParams = {};

    if (parameters.type && parameters.type !== "")
        newParams.type = parameters.type;
    else
        newParams.type = contextParams.type;

    if (parameters.appliance && parameters.appliance !== "")
        newParams.appliance = parameters.appliance;
    else
        newParams.appliance = contextParams.appliance;

    if (parameters.geo_country && parameters.geo_country !== "")
        newParams.geo_country = parameters.geo_country;
    else
        newParams.geo_country = contextParams.geo_country;

    if (parameters.emission_type && parameters.emission_type !== "")
        newParams.emission_type = parameters.emission_type;
    else
        newParams.emission_type = contextParams.emission_type;

    if (parameters.duration && parameters.duration !== "")
        newParams.duration = parameters.duration;
    else
        newParams.duration = contextParams.duration;

    if (parameters.size && parameters.size !== "")
        newParams.size = parameters.size;
    else
        newParams.size = contextParams.size;

    if (parameters.quantity && parameters.quantity !== "")
        newParams.quantity = parameters.quantity;
    else
        newParams.quantity = contextParams.quantity;

    conv.user.storage.lastParams = newParams;

    if (!conv.user.storage.noPermission)
        return appliances.processRequest(conv, newParams, true);
    else
        return appliances.processRequest(conv, newParams, false);
});

app.intent('land_intent', (conv, parameters, option) => {
    if (parameters.land_type === ""){
        if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
          // Create a list
            let dataArr = ["Cropland", "Grassland", "Forest land", "Burning biomass"];
            let items = {};
            
            dataArr.forEach(element => {
                items[element] = { // key
                title: element
                // optional: array of synonyms, description, image
                }
            });
            conv.ask('This is the list of land types Please choose one So, that I can provide you the exact value of the emission.');
            conv.ask(new List({
                title: "Land Types List",
                items: items
            }));
        }
        conv.user.storage.lastParams = parameters;
    } else {
        return land.processRequest(conv, parameters);
    }
});
app.intent('land_emission_intent',(conv,parameters,option) => {

    console.log("Option : ", option);
    console.log("last params : ", conv.user.storage.lastParams);

    let contextParams = conv.user.storage.lastParams;
    let newParams = {};
    
    if (parameters.land_region && parameters.land_region !== "")
        newParams.land_region = parameters.land_region;
    else
        newParams.land_region = contextParams.land_region;

    
    if (parameters.land_type && parameters.land_type !== "")
        newParams.land_type = parameters.land_type;
    else if(option)
        newParams.land_type = option;
    else
        newParams.land_type = contextParams.land_type;
    conv.user.storage.lastParams = newParams;

    return land.processRequest(conv, newParams, option);
});


// The default fallback intent has been matched, try to recover (https://dialogflow.com/docs/intents#fallback_intents)
app.intent('Default Fallback Intent', (conv) => {
    // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
    sendGoogleResponse(conv, `I'm having trouble, can you try that again?`);
});

// Function to send correctly formatted Google Assistant responses to Dialogflow which are then sent to the user
function sendGoogleResponse(conv, responseToUser) {
    conv.ask(responseToUser); // Google Assistant response
}

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
//exports.app = app;