require('dotenv').config();
const r = require('rethinkdb');
const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path'); 
const bodyparser = require('body-parser');
const passport = require('passport');
const cookieSession = require('cookie-session');
require('./public/modules/passport');
require("babel-polyfill");
const hackerEarthsdk=require('hackerearth-node'); //require the Library
const hackerEarth = new hackerEarthsdk(
    process.env.HACKEREARTH_CLIENT_SECRET, //client secret key
    ''
);

const PORT = process.env.port|| 7001; 
  

app.use(cookieSession({
   name: 'tuto-session',
   keys: ['key1', 'key2']
 }))
// Static Middleware 
app.set('view engine', 'ejs'); 
app.use('/public/',express.static(path.join(__dirname, 'public'))) 
app.use('/node_modules',express.static(path.join(__dirname,'node_modules')));

app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

const isLoggedIn = (req, res, next) => {
   if (req.user) {
       next();

   } else {
       res.render(__dirname+'/views/templates/401.ejs')
     
       res.end()
   }
}

app.use(passport.initialize());
app.use(passport.session());


// Example protected and unprotected routes
app.get('/', (req, res) => res.render(__dirname+'/views/pages/login.ejs'))
app.get('/failed', (req, res) => res.send('You Failed to log in!'))

// In this route you can see that if the user is logged in u can acess his info in: req.user
app.get('/home', isLoggedIn, (req, res) =>{
  var hash= req.body.room;
  var username = req.body.user;
   console.log("this is / =  " + hash+username);
    res.render(__dirname + '/views/pages/home.ejs',{
       name:req.user.displayName,
       pic:req.user.photos[0].value,
       email:req.user.emails[0].value
      });
})

// Auth Routes
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/createrooms');
  }
);

app.get('/logout', (req, res) => {
  console.log(req.session);

    req.session = null;
    console.log(req.session);
    req.logout();
    res.redirect('/');
})



 app.get('/createrooms',isLoggedIn, function(req,res,next){
    res.render(__dirname + '/views/pages/create_room.ejs',{
      name:req.user.displayName,
    }); 
  })

  app.get('/joinrooms',isLoggedIn, function(req,res,next){
    res.render(__dirname + '/views/pages/join_room.ejs',{
      name:req.user.displayName,
    });
  }) 


 
 
 r.connect({ host:  process.env.RETHINKDB_HOST || "localhost",  port: process.env.RETHINKDB_PORT || 28015,}, function(err, conn) {
     if (err) throw err;
     r
       .db("test")
       .tableList()
       .run(conn, function(err, response) {
         if (response.indexOf("edit") > -1) {
           // do nothing it is created...
           console.log("Table exists, skipping creation...");
           console.log("Tables - " + response);
         } else {
           // create table...
           console.log("Table does not exist. Creating table");
           r
             .db("test")
             .tableCreate("edit")
             .run(conn);
         }
       });
   
     // Socket Stuff
     io.on("connection", function(socket) {
 
      // console.log( socket.client.conn.server.clientsCount + " users connected" );
 
      io.sockets.emit('activeuser',{
        description: socket.client.conn.server.clientsCount
      })
       console.log("user connected with id of" +socket.id);
       socket.on("disconnect", function() {
         //console.log( socket.client.conn.server.clientsCount );
         io.sockets.emit('activeuser',{
           description: socket.client.conn.server.clientsCount  })
         
         console.log("user disconnected with id of "+ socket.id );
       });

       socket.on("document-update", function(msg) {
         console.log(msg);
         r
           .table("edit")
           .insert(
             { id: msg.id, value: msg.value, user: msg.user },
             { conflict: "update" }
           )
           .run(conn, function(err, res) {
             if (err) throw err;
             //console.log(JSON.stringify(res, null, 2));
           });
       });
       r
         .table("edit")
         .changes()
         .run(conn, function(err, cursor) {
           if (err) throw err;
           cursor.each(function(err, row) {
             if (err) throw err;
             io.emit("doc", row);
           });
         });
     });
   
     app.get("/getData/:id", function(req, res, next) {
       r
         .table("edit")
         .get(req.params.id)
         .run(conn, function(err, result) {
           if (err) throw err;
           res.send(result);
           //return next(result);
         });
     });
   });
 
   
  app.post('/home',(req,respo)=>{
   let codes =req.body.data;
    let inputs = req.body.input;
    let lang =  req.body.lang_val;

    console.log("180 "+ inputs);
    let cp,rn;
    const config = {};

    config.time_limit=1;  //your time limit in integer
    config.memory_limit=323244;  //your memory limit in integer
    config.source=codes;  //your source code for which you want to use hackerEarth api
    config.input=inputs;  //input against which you have to test your source code
    config.language=lang; //optional choose any one of them or none
    
    hackerEarth.compile(config, (err, code) => {
        if (err) {
            console.log(err);
        }
        rn= JSON.parse(code);
       // respo.write(rn)
    });

    console.log(cp);
    hackerEarth.run(config, (err, code) => {
        if (err) {
            console.log(err);
        }
        rn=JSON.parse(code);
        console.log(rn);
        //respo.write(JSON.stringify(rn))
        respo.json(rn);
    });


}) 
http.listen(PORT, (err)=> {
    if (err) console.log(err); 
    console.log("listening on:  "+ PORT);
  });
  
