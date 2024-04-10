import { useState ,useEffect, useMemo} from 'react'
import './App.css'
import {nanoid} from 'nanoid'
import io from 'socket.io-client'
const username = nanoid(10);
function App() {
  const [message, setmessage] = useState("")
  const [chats,setchats] = useState([])
  const [count,setcount] = useState(0)
  console.log(chats)
  const  sendchat= (e)=>{
    e.preventDefault();
    socket.emit("chat",count)
    setmessage('')
  }

  useEffect(()=>{
    socket.on("chat",(payload)=>{
      setcount(payload)
    })
  })
  return (
    <>
       <div>
        <form onSubmit={sendchat}>
          <p>{count}</p>
          {/* <input type='text' name='chat' placeholder='send text' value={message} onChange={(e)=>setmessage(e.target.value)} required/> */}
          <button type='submit'>Submit</button>
        </form>
        <div>
          {/* {
            chats.map((ele,index)=>(
              <p key={index}>{ele.message} <span>id:{ele.userName}</span></p>
            ))
          } */}
        </div>
    </div>
    </>
   
  )
}

export default App
