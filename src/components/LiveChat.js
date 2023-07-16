import React, { useState, useEffect, useRef } from 'react'
import './LiveChat.scss';
import { format } from 'timeago.js'

const LiveChat = ({ messages, sendMessage }) => {
    const messagesContainerRef = useRef(null);
    const [currentMessage, setCurrentMessage] = useState("");
    const [displayMessages, setDisplayMessages] = useState([{
        content: 'Xin chào, mình là admin phòng khám. Mình có thể giúp gì cho bạn?',
        owner: false,
        time: format(Date.now())
    }])

    useEffect(() => {
        if (messages && Object.keys(messages).length !== 0) {
            console.log("Debug", messages)
            setDisplayMessages(prevState => [...prevState, messages])
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }, [displayMessages]);


    const handleSendMessage = async () => {
        let result = await sendMessage(currentMessage)
        if (result === true) {
            let dataForDisplay = {
                content: currentMessage,
                owner: true,
                time: format(Date.now())
            }
            setDisplayMessages(prevState => [...prevState, dataForDisplay])
            setCurrentMessage('')
        }
    }

    return (
        <>
            <div className="container d-flex justify-content-center chat-card-container">
                <div className="card mt-5">
                    <div className="d-flex flex-row justify-content-between p-3 adiv text-white">
                        <i className="fas fa-chevron-left"></i>
                        <span className="pb-3">Live chat</span>
                        <i className="fas fa-times"></i>
                    </div>
                    <div className="messages-container" ref={messagesContainerRef}>
                        {displayMessages && displayMessages.map((message, index) => {
                            return (
                                <div key={index}>
                                    {
                                        message.owner ?
                                            (<div className="d-flex flex-row p-3 owner" >
                                                <div className="bg-white mr-2 p-3"><span className="text-muted">{message.content}</span></div>
                                                <img src="https://img.icons8.com/color/48/000000/circled-user-male-skin-type-7.png" width="30" height="30" />
                                            </div>)
                                            :
                                            (<div className="d-flex flex-row p-3">
                                                <img src="https://img.icons8.com/color/48/000000/circled-user-female-skin-type-7.png" width="30" height="30" />
                                                <div className="chat ml-2 p-3">{message.content}</div>
                                            </div>)
                                    }
                                </div>)

                        })}

                    </div>
                    <div className="form-group px-3 text-area-container">
                        <textarea className="form-control" rows="5" placeholder="Type your message" onChange={(e) => setCurrentMessage(e.target.value)} value={currentMessage}></textarea>
                        <button onClick={() => handleSendMessage()} className="send-btn">Send</button>
                    </div>

                </div>
            </div>
        </>
    )
}

export default LiveChat