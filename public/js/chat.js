//io() //Websocket for client

const socket=io()

//DOM Elements
const $chatForm= document.querySelector('#message-form')
const $chatButton = $chatForm.querySelector('button')
const $chatInput = $chatForm.querySelector('input')
const $sendLocationButton = document.querySelector('#send-location')
const $messages =document.querySelector('#message')
const $sidebar= document.querySelector('#sidebar')


//Templates
  const msgTemplate =document.querySelector('#message-template').innerHTML
  const locationTemplate =document.querySelector('#location-template').innerHTML
  const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//Option for Query String using QS library
  const {username , room}=Qs.parse(location.search, {ignoreQueryPrefix:true}) //ignoreQueryPrefix ignores "?" in the query

//Autoscrolling
  const autoscroll = ()=>{

    //Getting new messages
      const $newMessage = $messages.lastElementChild

    //Getting height of new message
      //getting style of element
      const newMessageStyles = getComputedStyle($newMessage)
      const newMessageMargin = parseInt(newMessageStyles.marginBottom)

      //Alone offsetHeight Doesn't give info about margins therefore getComputedStyle above it
      const newMessageHeight =  $newMessage.offsetHeight + newMessageMargin
    
    //visible height which doesn't change on new message  
      const visibleHeight= $messages.offsetHeight

    //Total height of messages container which keeps on changing with new message
      const containerHeight = $messages.scrollHeight
    
    //How far it is scrolled
      //scrollTop gives us the number of how much is scrolled
      const scrollOffset = $messages.scrollTop + visibleHeight

  //Condition
    if(containerHeight - newMessageHeight <= scrollOffset){
      $messages.scrollTop = $messages.scrollHeight
    }

  }

$chatForm.addEventListener('submit',(event)=>
{
  event.preventDefault();

  //Disabling below elements until action completes

    //Submit button disabled until msg submitted
        $chatButton.setAttribute('disabled', 'disabled')




  //Removed for using "name=msg" in index.html coz below will apply to all 'input' tags which is not always desirable
      //const msg=document.querySelector('input').value;
  //Refactored above code 
    const msg=event.target.elements.message.value
    //"event.target" targets the "msg-from" element. "msg" = name of tag targetted in index.html

  
  //Emitting Client-event
    //Callback as acknowledgement function
    //Though we register a Callback but Server won't acknowledge unless it is setup.
    //If Callback returns params we can access that 
  socket.emit('sendMessage',msg, (isProfane)=>
  {
    //Enabling below elements coz msg submitted

      //Submit button
         $chatButton.removeAttribute('disabled')
      
      //Resetting Input va;ue after submission
          $chatInput.value=''
      
      //Setting focus to chat input
        $chatInput.focus()

    if(isProfane) return console.log(isProfane)

    console.log('Message delivered')
    
  })


})

$sendLocationButton.addEventListener('click',()=>
{
  if(!navigator.geolocation)
  {
    return alert ('Geolocation not supported by your browser')
  }

  //Disabling below until location fetched
    $sendLocationButton.setAttribute('disabled','disabled')

  //Below api doesn't support promises natively
  navigator.geolocation.getCurrentPosition((position)=>{

    socket.emit('sendLocation',{
      lat: position.coords.latitude,
      long:position.coords.longitude
    },()=>
    {
      //Enabling Send Location button
        $sendLocationButton.removeAttribute('disabled')
        console.log("Coordinates sent")
    })
  })
})



//Registering Client-event
socket.on('message',(msg)=>
{
  //2nd argument is passed data as object

  //Step 1 to render - Setting value to the variable in index.html
  const html=Mustache.render(msgTemplate,
  {
    //Refactoring for adjusting to new code receiving object from server in 'msg'
    message:msg.text,

      // moment() for formatting
        createdAt: moment(msg.createdAt).format('h:mm A'),
    //Rendering username
    username:msg.username 
  })

  //Step 2 to render - inserting to actual HTML
  $messages.insertAdjacentHTML('beforeend',html)
  console.log(msg)

  //Calling Autoscroll
    autoscroll()
})

socket.on('locationMessage',(url)=>{
  const html= Mustache.render(locationTemplate,{
    url:url.url,
    createdAt:moment(url.createdAt).format('h:mm A'),
    //Rendering username
      username:url.username
  })

  $messages.insertAdjacentHTML('beforeend',html)
  console.log(url)

  
  //Calling Autoscroll
    autoscroll()
  })

//For room active user list
  socket.on('roomData',({room,users})=>{
    //console.log(room , users)

    const html= Mustache.render(sidebarTemplate,{
      users,
      room
    })

    $sidebar.innerHTML=html
  })


//Error as acknowledgement
socket.emit('join',{username,room},(error)=>{

  if(error)
  {
    //alert(error)
    location.href='/'
  }


})


//Initial code for understanding
    // socket.on('countUpdate',(count)=> //2nd value of socket.emit in src/index.js
    // {  
    //   console.log("Count updated "+count)
    // })

    // document.querySelector('#increment').addEventListener('click',()=>{
    //   console.log('+1');
    //   socket.emit('increment') //Triggering 'increment' event for server to listen and respond
    // })