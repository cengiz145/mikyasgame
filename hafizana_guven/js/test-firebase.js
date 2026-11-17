const firebase = require('firebase/app');
require('firebase/database');

const firebaseConfig = { 
    apiKey: "AIzaSyBDGdQjm6NX8ANQm90HJR8wD2Nk2E1h-ro", 
    authDomain: "hgfz-5a1ca.firebaseapp.com", 
    projectId: "hgfz-5a1ca", 
    storageBucket: "hgfz-5a1ca.firebasestorage.app", 
    messagingSenderId: "306647848341", 
    appId: "1:306647848341:web:2906c477450f999130129c",
    databaseURL: "https://hgfz-5a1ca-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

db.ref('pvp_queue/test_connection').set({
    matchId: "test_match",
    name: "tester"
}).then(() => {
    console.log("Write success!");
    return db.ref('pvp_queue/test_connection').once('value');
}).then((snap) => {
    console.log("Read success:", snap.val());
    process.exit(0);
}).catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
