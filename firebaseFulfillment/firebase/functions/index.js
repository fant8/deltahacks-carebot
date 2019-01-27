const functions = require('firebase-functions')
const { dialogflow } = require('actions-on-google')

const app = dialogflow()

const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase)
const db = admin.firestore()

app.intent('addPatientInfo', (conv, {givenName, lastName, patientNumber, diagnosis, prescription}) => {
    return db.collection('records').doc(`${patientNumber}`).set({
        givenName: givenName,
        lastName: lastName,
        patientNumber: patientNumber,
        diagnosis: diagnosis,
        prescription: prescription
    }).then(() => {
        conv.ask(`Okay, the following record has been added to the database:
        Given name: ${givenName};
        Last name: ${lastName};
        Patient Number: ${patientNumber};
        Diagnosis: ${diagnosis};
        Prescription: ${prescription}
        `)
    })
})

app.intent('getPatientInfo', (conv, {patientNumber, field}) => {
    return db.collection('records').doc(`${patientNumber}`).get().then(doc => {
        if (doc.exists) {
            var data = doc.data()
            var info
            if (field == 'everything') {
                conv.ask(`Patient ${patientNumber}:
                Name: ${data.givenName} ${data.lastName}
                Diagnosis: ${data.diagnosis}
                Prescription: ${data.prescription}`)
            } else {
                if (field == 'name') {
                    info = data.givenName + ' ' + data.lastName
                } else if (field == 'givenName') {
                    info = data.givenName
                } else if (field == 'lastName') {
                    info = data.lastName
                } else if (field == 'diagnosis') {
                    info = data.diagnosis
                } else {
                    info = data.prescription
                }
                conv.ask(`Patient ${patientNumber}'s ${field} is ${info}`)
            }
        } else {
            conv.ask(`Patient ${patientNumber} does not exist in the database.`)
        }
    })
})

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app)