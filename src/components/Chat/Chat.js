import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import io from 'socket.io-client';
import './Chat.css';
let socket;

const Chat = ( props )=> {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [model, setModel] = useState('');
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [leave, SetLeave] = useState(false)
    const ENDPOINT = 'https://taotaochat.herokuapp.com/';

    useEffect (()=>{
        const data = queryString.parse(props.location.search);
        const { name, room , model } = data;

        socket = io(ENDPOINT);

        setName(name);
        setRoom(room);
        setModel(model);

        socket.emit('join', {name: name, room:room, model: model}, ({error, user})=>{
            if(error) {
                alert(error);
              }  
         }); 
         console.log("called")
         return ()=>{
            socket.emit('disconnect');
            socket.off();
        }
    },[ENDPOINT, props.location.search])


    useEffect(()=>{
        socket.on('message',(message)=>{
            setMessages([...messages, message]);
        });
        socket.on("roomData", ({ users }) => {
            setUsers(users);
            console.log(users)
          });
    }, [messages])
   
    const handleClick = ()=>{
        if (message) {
            socket.emit('sendMessage', message, model, (info)=> {
                setMessage('');    
                if(info){
                    alert(info);
                }    
            })
        }
    }
    const handleChange = ({target}) =>{
        setMessage(target.value)
    }

    const handleLeave=()=>{
        socket.emit('leave');
        socket.emit('disconnect');
        socket.off();
        SetLeave(true);
    }
   const guestStyle = {
       color:"grey",
       float:"left",
       width:"70%"     
   }

   const userStyle = {
       color:"black",
       float:"right",
       width: "90%",
       padding:"5px",
       backgroundColor:"antiquewhite",
   }
   if ( leave === true ) 
    return (
    <div className = "room">
        <Link to="/">
                <button className="btnSubmit" type="submit" > Join 加入</button>
            </Link>
    </div>)
    
    return (
        <>
        <div className = "room">
            room {room} 
        </div>
        <div className="chatContent">
            <div className="messageBox">
                { messages.map((message, i)=>
                <div className="messageItem"  key={i}> 
                  <div style={message.user === name.trim().toLowerCase()? userStyle : guestStyle}> 
                     <span className="userName">{message.user&&message.user.replace(/\b(\w)/g, s => s.toUpperCase())} : </span>
                     {message.text} 
                  </div>
                 </div>)}
            </div>
            <div className="inputDiv">
                <div className = "inputDiv">
                    <input  className="messageInput inputlist" value={message} onChange ={handleChange} />
                <div className="inputlist sendbtn">
                    <button onClick={handleClick}> 》</button>
                </div>
                </div>
            </div>
        </div>
        <div className="room">
        <button className="btnSubmit" type="submit" onClick={handleLeave}> Leave 离开 </button>
        </div>
        </>
    )
}
export default Chat;