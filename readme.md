# Particle Post to Google
Google AppScript to create REST API End Point to allow Particle Publish and Webhook to update Google Sheet.

## Context
There already exists a number of tecniques to push/pull particle.io data to Google sheets. The popular push method is IFTTT which allows Particle Publish request to be posted to google however the entire payload from the particle device message is placed into a single cell. A number of pull methods have also been developed in google AppScript however these pull particle variables based on certain triggers all which require the particle device to be online & connected in order to retrieve data. 

This implements a RESTful POST web-service within Google AppScript which allows Particle WebHooks to push data based on Particle-publish events and places the data-field values into individual cells within the Google Sheet. As a result devices can publish and go offline (sleep) whilst particle and google cloud services log the data.

##Design Approach

The implementation is self describing, meaning that once a new device is setup should be able to publish its payload and the logging script automatically creates the log specific to the device. The current implementation retrieves the device-name, creates a worksheet/tab for each device and uses the json keys within the payload to create column headings.

##Prerequisities

1. The GAS code uses the BetterLogger library by Peter Herrmann for in sheet AppScript error logging. https://github.com/peterherrmann/BetterLog. Within the Google Script Editor you need to reference the library through the resources\library menu. The key is listed in the github readme.md
2. The particle device payload must be a JSON string, ie {"name1":value,"name2:"value2"} , see firmware-example.txt

##Security 

The current implementation does not authenticate post requests. As a result the google sheets need to be shared with 'allow anyone with the link' level access. It relies on obscurification through the 44 byte unique code to represent the sheet. Authentication via Google OAuth services is on the roadmap.

##Limitations

- A google sheet is limited to 2 million cells.
- The google API appears to limit request rates greater than ~2 seconds, however in testing bursts appear to be permitted. More testing on this required as I am not sure what resources are consumed based on this dashboard - https://script.google.com/dashboard

##Roadmap
- OAuth / authenticated posts
- Option to create new workbook per device, currently a new worksheet(tab) is created for each device
- Email/SMS notifications if a device is not heard from within a specified period
- Logging to Google Cloud DataStore for larger logs (subject to working through more more complex OAuth requirements)

##Setup / Configuration

###Google Setup.
1. Create a google sheet
2. Select tools \ script-editor
3. Paste the contents of postGoogle.gs into the edit window
4. Select and copy the 44 byte unique ID from the sheets URL and paste it into the errSheetID and logSheetID variables within the script. Note a separate log workbook can be used, BetterLog creates a 'Log' tab in which errors are written.
5. Paste your particle security token into the particleToken variable. This is needed to retrieve the device-name as only device/core-id is included within the webhook.
6. Within the editor save changes and then select Publish \ Deploy as WebApp
7. Copy the the web app URL
8. Change the project version to new, to make future changes live you must always select new version, ie whilst you can republish an old version the changes do not become active.
9. Change who has access to anyone even anonymous and select update. 

Note the AppScript and GoogleSheet can be separated where required. This will be a requirement when logging to device specific workbooks is implemented.

###Create Particle webhook
1. Update the postgoogle.json URL value to be the URL value from step 7 above
2. using the particle CLI create the webhook: particle webhook create postgoogle.json

###Device
1. Within the device firmware code include a Particle.publish("postGoogle", payload-json-string);




