
//To keep track of active users in a room
  const users=[]

const addUser=({id,username,room})=>{
  
  //Validation
    if(!username || !room){
      return{
        error:"Username or room required"
      }
    }

  //Clean input
    username=username.trim().toLowerCase()
    room= room.trim().toLowerCase()
  
  //Check existing user
    const existingUser = users.find((user)=>{

      return user.room === room && user.username === username
    })

    if(existingUser)
    {
      return {
        error:"User already in use"
      }
    }
  
  //Store unique user
    const user = {id , username , room}
    users.push(user)
    return {user}
}

const removeUser =(id)=>{
  const index = users.findIndex((user)=> user.id===id)

  if(index ){
    return users.splice(index,1)[0]
  }
}

const getUser =(id)=> {
  return users.find((user)=> user.id === id)
}


const getUserInRoom = (room)=>{

  return users.filter((user)=> user.room === room)
}

module.exports ={
  addUser,
  removeUser,
  getUser,
  getUserInRoom
}