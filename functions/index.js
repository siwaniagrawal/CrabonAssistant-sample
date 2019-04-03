'use strict';
const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const {
    dialogflow,
    Permission,
    Suggestions,
    BasicCard,
    RegisterUpdate,
    SimpleResponse
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

app.intent('poultry_intent', (conv, parameters) => {
    return poultry.processRequest(conv, parameters);
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

app.intent('land_intent', (conv, parameters) => {
    console.log("Parameters : ", parameters);
    return land.processRequest(conv, parameters);
});

app.intent('reduceEmission_intent', (conv) => {
    //google home
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')){
        conv.ask(`There are few ways following which you can help reduce carbon emission. For example, You can join a NGO or plant a tree, you can reduce your emission in daily transportation, you can reduce the emission by donating clothes or by avoiding food wastage, You can also help by reducing emission in home. Let me how you want to reduce emission and I will help you with it.`)
    } else if(conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')){
    //display screens
        conv.ask(new SimpleResponse({
            speech: "I can help you with reducing emission in couple of fields, let me know which one you want to begin with",
            text: "Here are couple of ways to reduce emission :-"
        }));
        conv.ask(new BasicCard({
            title: '',
            text: "**NGO**  \n  \n *You can be a member of an NGO and help the community in reducing emission* \n  \n  \n**Food** \n \n *You can reduce emission by using organic products and reducing wastage*\n \n\n **Transportation**  \n  \nYou can can reduce emission in your daily transportation by taking alternatives to driving. \n  \n  \n **Clothes and Shopping**\n \n*You can reduce emission by donating clothes and not using plastic bags*\n \n \n **Trees** \n \n *You can always reduce emission be planting trees* \n \n \n **Air Travel** \n \n *You can reduce emission in air travel by avoiding flying when possible, fly less frequently, fly shorter distances, and fly economy class.* \n \n \n **Home** \n \n *You reduce emission at home by turning off lights when not required*",

            
            buttons: [
                {
                 title: "Read More",
                 openUrlAction: {
                    url: "https://cotap.org/reduce-carbon-emissions/",
                    urlTypeHint: "URL_TYPE_HINT_UNSPECIFIED"
                    }
                }
            ]
        }));
        conv.ask('I can send you those updates daily. Would you like that?');
        conv.ask(new Suggestions('Send daily'));     
    }
     
});
app.intent('reduceFood_intent', (conv) => {
    //google home
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')){
        conv.ask(`meat and dairy is responsible for 14.5 percent of manmade global greenhouse gas emissions, mainly from production and processing and the methane that beef and sheep belch out. 1.Every day that you forgo meat and dairy, you can reduce your carbon footprint by 8 pounds—that’s 2,920 pounds a year. You can start by joining Meatless Mondays. 2.Buy foodstuffs in bulk when possible using your own reusable container. 3. Reduce your food waste by planning meals ahead of time, freezing the excess and reusing leftovers. 4.Compost your food waste if possible.`)
    } else if(conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')){
    //display screens
        conv.ask(new SimpleResponse({
            speech: "meat and dairy is responsible for 14.5 percent of manmade global greenhouse gas emissions, mainly from production and processing and the methane that beef and sheep belch out",
            text: "Here are couple of ways in which you can reduce emission due to food production and transportation:-"
        }));
        conv.ask(new BasicCard({
            title: '',
            text: "*1.* **Eat low on the food chain.**  \n  \n *This means eating mostly fruits, veggies, grains, and beans. Livestock—meat and dairy—is responsible for 14.5 percent of manmade global greenhouse gas emissions, mainly from feed production and processing and the methane that beef and sheep belch out. Every day that you forgo meat and dairy, you can reduce your carbon footprint by 8 pounds—that’s 2,920 pounds a year. You can start by joining Meatless Mondays.* \n  \n  \n**2. Choose organic and local foods that are in season.** \n \n *Transporting food from far away, whether by truck, ship, rail or plane, uses fossil fuels for fuel and for cooling to keep foods in transit from spoiling.*\n \n\n **3. Buy foodstuffs in bulk**  \n  \n*Buy food products in bulk when possible using your own reusable container.* \n  \n  \n **4. Reduce Waste**\n \n*Reduce your food waste by planning meals ahead of time, freezing the excess and reusing leftovers.*\n \n \n **5. Compost** \n \n *Compost your food waste if possible.*",

            
            buttons: [
                {
                 title: "Read More",
                 openUrlAction: {
                    url: "http://www.greeneatz.com/foods-carbon-footprint.html",
                    urlTypeHint: "URL_TYPE_HINT_UNSPECIFIED"
                    }
                }
            ]
        }));
    }
        
    
});
app.intent("Setup Daily Updates", conv => {
    // Request to register Daily Updates
    conv.ask(new RegisterUpdate({
        intent: "reduceFood_intent",
        frequency: "DAILY"
    }));
});
app.intent("Finish Daily Updates Setup", (conv, params, registered) => {
    if (registered && registered.status === "OK") {
        conv.close("Ok, I'll start giving you daily updates. See you again.");
    } else {
        reply(conv, "Feel free to register daily updates. When do you want to know the about how to reduce emission?");
    }
})

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