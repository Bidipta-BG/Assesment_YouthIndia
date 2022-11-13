const express = require("express")
const router = express.Router()
const tokenModel = require("./tokenModel")


const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];


// /**
//  * Reads previously authorized credentials from the save file.
//  *
//  * @return {Promise<OAuth2Client|null>}
//  */

// /**
//  * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
//  *
//  * @param {OAuth2Client} client
//  * @return {Promise<void>}
//  */

// /**
//  * Lists the next 10 events on the user's primary calendar.
//  * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//  */


const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')


router.post("/login", async function(req, res){
    // console.log('inside')
    let getToken = await tokenModel.find()
    // console.log(getToken);
    // res.send('hi')
    if (getToken.length !== 0){
        if(getToken[0].isLogIn == true) return res.send('User Already logged in. Please get the event from get event api or logout first')
    }
    if (getToken.length==0 || getToken[0].isLogIn == false){
        // console.log('working');
        let client = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        })
        console.log(client);
        if(client.credentials){
            const content = await fs.readFile(CREDENTIALS_PATH);
            const keys = JSON.parse(content);
            // console.log('keys', keys)
            const key = keys.installed || keys.web;
            const payload = {
                type: 'authorized_user',
                client_id: key.client_id,
                client_secret: key.client_secret,
                refresh_token: client.credentials.refresh_token,
                isLogIn: true
            }
            
            if (getToken.length == 0){
                console.log(payload)
                let saveData = await tokenModel.create(payload)
                return res.send({ message: 'logged in and saved token', token: saveData})
            }else{
                let updateToken = await tokenModel.findOneAndUpdate({ type: 'authorized_user' }, payload, {new:true})
                return res.send({ message: 'loggendin and token updated', token: updateToken })
            }
        }
    }

})



router.get("/getevent", async function (req, res) {
    let getToken = await tokenModel.find()
    let { type, client_id, client_secret, refresh_token } = getToken[0]
    

    if (getToken.length == 0 || getToken[0].isLogIn == false) return res.send('User Not logged in. Please Login to see the events')

    let credentials = { type , client_id, client_secret, refresh_token }

    // console.log(credentials)
    
    // console.log('client=', client)
    // return res.send('hi')
    

    async function loadSaveTokenIfExists() {
        try {
            // console.log("credentials= ", credentials);
            return google.auth.fromJSON(credentials);
        } catch (err) {
            return null;
        }
    }


    async function authorize() {
        let client = await loadSaveTokenIfExists();
        // console.log('client=',client);
        if (client) {
            return client;
        }
    }
    async function listEvents(auth) {   //this auth is client same
        // console.log('auth= ', auth)
        const calendar = google.calendar({ version: 'v3', auth });
        const resp = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
        // console.log("object=calen= ", resp);
        const events = resp.data.items;
        if (!events || events.length === 0) {
            // console.log('No upcoming events found.');
            // outputEvent += 'No upcoming events found.'
            return 'No upcoming events found.'
            // return res.send({ message: 'No upcoming events found.'})
        }
        let upcomingEvent = []
        // console.log('Upcoming 10 events:');
        events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
            // console.log(event);
            upcomingEvent.push({eventTime: start, eventTitle: event.summary,  eventDetails: event.description})
        });
        return upcomingEvent
    }
 
    let output =await authorize().then(listEvents)
        .then((res) => res)
    .catch(console.error);

    console.log(output)
    return res.send({'Your Upcoming Events': output})

})





router.post("/logout", async function (req, res) {
    await tokenModel.findOneAndUpdate({ type: 'authorized_user' }, { isLogIn : false}, { new: true })
    return res.status(200).send({ message: 'User Logget out Succeffully' })
})

module.exports = router