const path =  require ('path')
const http= require('http')  //for creating raw http server
const express = require('express')
const socketio= require('socket.io')
const Filter = require ('bad-words')
const {generateMsg, generateLocationMsg} =require('./utils/messages.js')
const {addUser,removeUser,getUser,getUserInRoom} = require ('./utils/users.js')
const app = express()

//Refactoring for socket.io

  //Passing "app" for creating server
    const server = http.createServer(app)
     
  //Raw HTTP Server is required for socket.io which is not available if server directly created from "express" 
    const io =socketio(server) 

const port = process.env.PORT || 3000;

const _dirname=process.cwd();
const publicPath=path.join(_dirname,'/public')

app.use(express.static(publicPath))

//"server" instead of "app" for socket.io refactoring
  server.listen(port,()=> console.log("Server started at port "+port))
  



//Server side SOCKET.IO setup
  //'connect' is a built-in event on socket.io therefore no need to explicitly "emit"
  io.on('connection',(socket)=>
  {
    
    console.log("New websocket started ");

    socket.on('join',({username,room}, callback)=>{

      //socket.id == Unique id for the user by socketio
      const {user,error} =addUser({id:socket.id , username, room})
    
      if(error){
        return callback(error)
      }



      //emits event only for that "room"
        socket.join(user.room)

      //Triggering Server-event to client only
      //Generating via function therefore commenting
          //socket.emit('message',"Welcome")
          socket.emit('message',generateMsg("Server","Welcome"))


    //Triggering Server-event to all clients except the current socket
    //Generating via function therefore commenting
        //socket.broadcast.emit('message',"New user joined")
        //changing to emit only to room
         //socket.broadcast.emit('message',generateMsg("New user joined"))
         socket.broadcast.to(user.room).emit('message',generateMsg("Server",`${user.username} has joined the chat`))

      //Sending active user list to all
        io.to(user.room).emit("roomData",{
          room:user.room,
          users:getUserInRoom(user.room)
        })

      //Calling callback as acknowledgement
        callback()
      
    })




    //Registering Client-event
      //Server setup with "callback" as acknowledgement function
      socket.on('sendMessage',(msg, callback)=>
      {
        const user= getUser(socket.id)
        const filter= new Filter() //for bad-words

        if(filter.isProfane(msg)){
          return callback("Profane language detected")
        }

    //Sending to all clients informing about new message
      //Generating via function therefore commenting
        //io.emit('message',msg)
        //changing to emit only to room
          //io.emit('message',generateMsg(msg))
          io.to(user.room).emit('message',generateMsg(user.username,msg))
    
      //Calling acknowledgement function with params
        callback()
      })


    //For triggering an event on Disconnect of any client
      //'disconnect' is a built-in event in socket.io therefore no need to explicitly "emit"
      socket.on('disconnect',()=>
      {
        //Removing user from active list
          const user = removeUser(socket.id)

        if(user){
        //Informing all about disconnection
        //Generating via function therefore commenting
          //io.emit('message',"User left chat");
        //Chnaging to emit only to room
            //io.emit('message',generateMsg(`${user.username} left chat`))
            io.to(user.room).emit('message',generateMsg("Server",`${user.username} left the chat`));
          
          //Sending active user list to all
            io.to(user.room).emit("roomData",{
              room:user.room,
              users:getUserInRoom(user.room)
        })
        }
        

      })

      //Registering for 'sendLocation' event in "Share Your Location" button
      //.on() can accept any number of params but if there is a callback it must be last
      socket.on('sendLocation',({lat,long},callback)=>
      { 
        const user= getUser(socket.id)
        
        //Sending Google maps link
        //Generating via function therefore commenting
          //io.emit('locationMessage',`https://google.com/maps?q=${lat},${long}`)
          io.to(user.room).emit('locationMessage',generateLocationMsg(user.username,`https://google.com/maps?q=${lat},${long}`))

        
        //socket.emit('locationMessage',loc)
        callback()
      })



    




//Initial understanding code
        // //Emitting an event from Server to the client-side.
        //   socket.emit('countUpdate',count) 
        //     //To send data pass it as 2nd argument of emit

        // //Listening to client-side event 'increment' 
        //   socket.on('increment',()=>
      //{
        //     count++;
        //One can notice new sockets being open with each instance of client side "c" increments

        //     The below socket.emit emits the event only to that particular client for which the current connection is open.
        //       //socket.emit('countUpdate',count)
            
        //     //Therefore to emit the event to all the currently opened clients we use below command
        //       io.emit('countUpdate',count)
      //})




    
  })


