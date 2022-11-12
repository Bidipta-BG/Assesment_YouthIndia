const express = require("express")
const router = express.Router()
const tokenModel = require("./tokenModel")


const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

const credentials = {
        client_id: "206717800097-pusbvi353vvlnh6idubl6l3rnv3lr07b.apps.googleusercontent.com",
        project_id: "youthindia-assignment",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token", 
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "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", 
        javascript_origins: ["http://localhost:3000"], 
        redirect_uris: ["http://localhost:3000/gettingtoken"]
    }

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
        console.log('working');
        let client = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        })
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
                return res.send({ message: 'updated new token', token: updateToken })
            }
        }
    }

})



router.get("/getevent", async function (req, res) {
    let getToken = await tokenModel.find()
    let { type, client_id, client_secret, refresh_token } = getToken[0]
    

    if (getToken.length == 0 || getToken[0].isLogIn == false) return res.send('User Not logged in. Please Login to see the events')

    let credentials = { type , client_id, client_secret, refresh_token }

    console.log(credentials)
    let client = await google.auth.fromJSON(credentials)
    
    console.log('auth= ', client)
    
    const calendar = await google.calendar({ version: 'v3', client });
    
    // return res.send('hi')
    
    const resp = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    });

    console.log("object=calen= ", resp);
    return res.send('hi')

    const events = await resp.data.items;
    if (!events || events.length === 0) {
        console.log('No upcoming events found.');
        return;
    }
    console.log('Upcoming 10 events:');
    events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
    });
    return res.send('hi')

})



module.exports = router