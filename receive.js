#!/usr/bin/env node

amqp.connect('amqp://localhost',function(err,conn){//apro connessione
  conn.createChannel(function(err,ch){//apro canale
    var q='hello';//nome della coda

    ch.assertQueue(q,{durable:false});//dichiaro coda
    console.log("[*]Waiting for messages in %s. To exit press CTRL+C",q);
    ch.consume(q.function(msg){
      console.log("Received %s",msg.content.toString());
    },{noAck:true});
  });
});
