//Coz the 'timestamp' and 'message' are to be added multiple time therefore a function is best created

  const generateMsg=(username,text)=>{
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
  }

  const generateLocationMsg =(username,url)=>{
    return {
      username,
      url,
      createdAt: new Date().getTime()
    }
  }
  module.exports= {
    generateMsg,
    generateLocationMsg
  }