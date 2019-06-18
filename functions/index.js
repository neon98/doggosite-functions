const functions = require('firebase-functions');
var serviceAccount = require("./doggosite-serviceaccount.json");
const admin = require('firebase-admin')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: require('./config.json')
})

exports.calculateHighest = functions.https.onRequest((request, response) => {
    var db = admin.firestore();
    db.collection('users').get().then(snapshot => {
        var userdata = [];
        snapshot.forEach(doc => {
            var data = doc.data();
            userdata.push({
                'userid': doc.id,
                'totalboops': data.totalboops,
                'totalpats': data.totalpats,
                'totaltreats': data.totaltreats
            })
        });

        console.log("userdata : ", userdata);
        var max_boops_index = 0, max_pats_index = 0, max_treats_index = 0;
        for (var i = 0; i < userdata.length; i++) {
            if (userdata[i].totalboops > userdata[max_boops_index].totalboops) {
                max_boops_index = i;
            }
            if (userdata[i].totalpats > userdata[max_pats_index].totalpats) {
                max_pats_index = i;
            }
            if (userdata[i].totaltreats > userdata[max_treats_index].totaltreats) {
                max_treats_index = i
            }
        }
        var res = {};
        var winnersDocRef = db.collection('winners').doc('winners');
        if (userdata[max_boops_index].totalboops !== 0) {
            winnersDocRef.update({
                highestBoops: userdata[max_boops_index].userid
            })
            res['max_boops'] = userdata[max_boops_index].userid
        }
        if (userdata[max_pats_index].totalpats !== 0) {
            winnersDocRef.update({
                highestPats: userdata[max_pats_index].userid
            })
            res['max_pats'] = userdata[max_pats_index].userid
        }
        if (userdata[max_treats_index].totaltreats !== 0) {
            winnersDocRef.update({
                highestTreats: userdata[max_treats_index].userid
            })
            res['max_treats'] = userdata[max_treats_index].userid
        }
        response.send(res)
        return "";

    }).catch(error => {
        console.log(error);
        return error;
    })
    // response.send(data)
});

