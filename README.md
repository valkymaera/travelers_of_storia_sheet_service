# Overview
This is the web service (backend) of the **Rapid Sheet Data** system. It is responsible for handling requests made from the client library in Unity3D, returning a JSON formated string on success. In order to be able to grab data from private spreadsheets, the service needs to be setup with a Google service account. 

Brief instructions on how to setup the service are provided in the next section 'Setup and Run the Service'. For more information check the complete Rapid Sheet Data documentation at http://www.voidinspace.com/rapid-sheet-data/.

# Setup and Run the Service
Create a **Google service account key** in Google console. Follow the steps detailed in https://developers.google.com/identity/protocols/OAuth2ServiceAccount under 'Creating a service account'. The process is pretty straightforward; in Google developer console (https://console.developers.google.com/iam-admin/serviceaccounts/) select or create a new project and create a service account making sure you've selected **"Furnish a new private key"**. Once you've created the service account, Google will prompt you to download a .json file that contains the service secret.

Before exiting the developers console, make sure you enabled the **Google Sheets API** for the project you created the service account for and copy the **service account ID** that can be found under *IAM & admin -> Service accounts* (e.g.: rapid-sheet-data@rapid-sheet-data-service.iam.gserviceaccount.com). You will need to share your desired private Google sheets with this account in order to allow the servive to pull data from them.

Now copy the service secret .json file in the root directory of the 'rsd_service' project. Open up **rsdModule.js** and in **line 30** paste the full filename including the .json extension in **'CLIENT_SECRET'**.

The Rapid Sheet Data service is now ready to be deployed to your private server or platform of your choice (Google, Heroku, etc), or even run it locally if you have Node.js installed by calling 'node app.js'.