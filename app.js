/*
   Questo è un web server da eseguire con NodeJS, da cmd > node app.js.
   Rimane in ascolto su https://localhost:3000, per cui riceve le richieste get/post su quell'indirizzo.
   In prospettiva dovrà essere sempre attivo su un ipotetico server da affittare.
*/

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var store = require('store');

var app = express();
app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Questa funzione viene chiamata in risposta ad una richiesta post (vedi sotto "app.post").
// Prende i dati del body della post e dopo essersi connesso al database prova ad inserirli.
function register(body){
    // connessione al databse
    MongoClient.connect("mongodb://simonestaffa:VqhfwYZVnY8XzEjU@parkidleusers-shard-00-00-ertqo.mongodb.net:27017,parkidleusers-shard-00-01-ertqo.mongodb.net:27017,parkidleusers-shard-00-02-ertqo.mongodb.net:27017/Users?replicaSet=ParkIdleUsers-shard-0&ssl=true&authSource=admin", function(err, db) {
      if(err) { return console.dir(err); }
      console.log("Succesfully Connected");
      // scelgo la collection in cu inserire (es. 'utenti')
      var collection = db.collection('utenti');
      // documento da inviare che sarà inserito
      var user = {
          'name': body.name,
          'last_name': body.last_name,
          'username': body.username,
          'email': body.email,
          'password': body.password,
          'birth_date': body.birth_date
      };
      // inserimento nella collection 'utenti' (vedi sopra)
      // la gestione dell'unicità dei campi username ed email è gestita completamente da MongoDb
      // infatti ho impostato quei campi come 'index' (similar a primary key) in tal modo
      // se inserisco un duplicato lancia un'eccezione che viene catturata
      collection.insert(user, function(err,result){
          if(err){
              // 'err' è un JSONObject da cui prendo il campo 'message' che contiene informazioni sull'errore lanciato
              // cercando 'username' in err.message so che il messaggio d'errore si riferisce ad un username duplicato
              // string.indexOf('esempio') ritorna -1 se la parola 'esempio' non è presente
              if(err.message.indexOf('username') != -1){
                  console.log("Username already exists");
              }
              // stessa cosa ma ricerco la parola 'email'
              if(err.message.indexOf('email') != -1){
                  console.log("Email already exists");
              }
              return false;
          }else{
              console.log("Insert Completed!");
              db.close();
              return true;
          }
      });
    });
}

// rimango in ascolto in attesa di ricevere una POST e definisco il comportamento da eseguire all'arrivo di una richiesta
// in questo caso se ricevo una POST su "https://localhost:3000/register" sarà eseguito il codice qui di seguito
// POST che viene mandata dal form di registrazione nel file 'contactus.html' al momento della submit, impostando action="https://localhost:3000/register"
app.post('/register', function (req, res) {
    if(register(req.body) == true){
        console.log("Registration success! Redirecting to homepage...");
        //res.send('Data received:\n' + JSON.stringify(req.body));
        res.redirect('https://lim996.github.io/index.html'); //redirect page
    }
    else{
        console.log("Registration failed!");
        // pass a local variable to the view
        res.render('index', { title: 'Registration Failed', message: 'This page will redirect you in 2 seconds, if it takes too long click on the link above:' });
        //res.redirect('https://lim996.github.io/contactus.html');
        //window.location.replace("contactus.html");
    }
});

// stessa cosa ma in questo caso gestisco il caso del login
// POST mandata dal form di Login nel modal (vedi navbar) al momento della submit, impostando action="https://localhost:3000/login"
// TODO
app.post('/login', function (req, res) {
    MongoClient.connect("mongodb://simonestaffa:VqhfwYZVnY8XzEjU@parkidleusers-shard-00-00-ertqo.mongodb.net:27017,parkidleusers-shard-00-01-ertqo.mongodb.net:27017,parkidleusers-shard-00-02-ertqo.mongodb.net:27017/Users?replicaSet=ParkIdleUsers-shard-0&ssl=true&authSource=admin", function(err, db) {
        if(err) { return console.dir(err); }
        // faccio una query per vedere se esiste un record (username,password) valido
        db.collection('utenti').find({"username":req.body.username,"password":req.body.password}).toArray(function(err,result){
            if(err) return console.dir(err);
            if(result.length == 0){ // se non esiste il record, l'array risultante avrà lunghezza 0
                console.log("Incorrect username or password");
                db.close();
                return false;
            }else{
                //window.location.replace(window.location.href);
                console.log("Successfully logged!");
                res.redirect('https://lim996.github.io/user_detect.html?id='+req.body.username);
                db.close();
                return true;
            }
        });
    });
});

// imposto la porta e l'IP su cui rimango in ascolto
//app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0' );

var port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
app.listen(port, ip_address, function () {
  console.log( "Listening on " + ip_address + ", port " + port )
});
