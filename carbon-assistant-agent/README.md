# CarbonFootprint DialogFlow Agent


CarbonFootPrint DialogFlow agent is one part of the Google Assistant Action named 'CarbonFootPrint'. The agent which handles NLP, combined with the firebase function which forms the backend and executes several APIs form the Google Assistant Action.

# Features:

  - Support for all kind of queries supported by Project CarbonFootprint
  - Support across all categories such as obtaining emissions caused due to a road trip to somewhere OR due to train journey between two stations AND even due to Flights between two airports along with specification of number of passengers (e.g: "How much emissions are produced after I take a flight from Mumbai to Dubai ?")
  - Support for appliance usage along with their types, region of usage and their counts. (e.g: How much emissions are caused by 2 CRT TVs used for 11 hours in Canada?")
  - Support for queries related to emissions caused by meat and poultry productions (e.g: "What emissions are released for 3 kg beef production ?")
  - Reverse lookup and provide user-relatable emission comparisons (Provides you real-life examples which produce similar emissions)
  - Context management support (Able to remember what you said last and continue conversation over it)
  - Slot filling support (Able to recognize and re-enquire missing pieces of required information in your query)

### Deploying

The deployment of the Google Assistant Action is done in two parts: Deployment of DialogFlow Agent and Deployment of Firebase Cloud Function. This documentation will only guide through Deployement of DialogFlow Agent. For guide on deployment of Firebase Cloud function, please refer the repository of cloud function [here](https://gitlab.com/aossie/CarbonAssistant-Function)
#### Part 1 - Deploying DialogFlow Agent:

- Download the repository as a zip by clicking [here](https://gitlab.com/aossie/CarbonAssistant-Agent/-/archive/master/CarbonAssistant-Agent-master.zip)
- Once you have a zip, head to [Actions on Google](https://console.actions.google.com/u/0/) and create a new project by entering a name and country for the project
- Once the project is created, you will be on the Onboarding screen. Select 'Education & Reference' on this screen.
- Fill in the basic details about your action such as invocation phrase, voice etc in the 'Quick Setup' section.
- In 'Build your Action' section, select 'Add new action' and select 'Custom Intent' in the consecutive dialog box and click 'Build'
- You will redirected to DialogFlow's project page. On this screen - select your timezone - don't change the language. Then select 'Create' and wait for the process to complete.
- Once done, select the Settings gear icon at the top left and then go to Export and Import tab.
- On this screen, select 'Restore from Zip' and restore the zip you downloaded!
- Go to the 'Fulfillment' tab and you will see a field 'Webhook', you have to enter your own https endpoint. You can create your webhook by following [Part 2](https://gitlab.com/aossie/CarbonAssistant-Function) of the deployment.
- That's it, you are almost there! Next select the 'Integrations' tab and then under Google Assistant section click on 'Integration Settings' and click on Test! You are done!
- Now, the Google assistant action has been deployed only for your Gmail account. You can fire up your Google Assistant app and test it!


License
----
See [LICENSE](LICENSE).
