import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageChat.scss'
import { io } from 'socket.io-client'
import { format } from 'timeago.js'

class ManageChat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentMessage: '',
            selectedConversation: null,
            socket: io("ws://localhost:3001"),
            conversations: [],
            initialMessage: {
                content: 'Xin chào, mình là admin phòng khám. Mình có thể giúp gì cho bạn?',
                owner: true,
                time: format(Date.now())
            },
        }
    }
    // {
    //     patientId: 'hung',
    //     displayMessages: [{
    //         content: 'Xin chào, mình là admin phòng khám. Mình có thể giúp gì cho bạn?',
    //         owner: true,
    //         time: format(Date.now())
    //     }]
    // }
    async componentDidMount() {
        let { conversations, socket } = this.state
        // if (conversations) {
        //     this.setState({
        //         selectedConversation: conversations[0].patientId
        //     })
        // }
        // const socket = io("ws://localhost:3001");
        socket.emit("getDoctorInfo", {
            doctorSession: this.props?.user?.accessToken,
            doctorId: this.props?.user?.id
        })

        socket.on("messageToDoctor", (data) => {
            let currentConversationList = this.state.conversations;
            let checkConversationExist = currentConversationList.some((conversation) => conversation.patientId === data.patientId)
            if (!checkConversationExist) {
                this.setState({
                    conversations: [
                        ...currentConversationList,
                        {
                            patientId: data.patientId,
                            displayMessages: [this.state.initialMessage, {
                                content: data.messageText,
                                owner: false,
                                time: format(Date.now())
                            }]
                        }
                    ]
                })
            } else {
                this.setState({
                    conversations: currentConversationList.map((conversation) => {
                        if (conversation.patientId === data.patientId) {
                            conversation.displayMessages.push({
                                content: data.messageText,
                                owner: false,
                                time: format(Date.now())
                            })
                        }
                        return conversation
                    })
                })
            }
        })
    }

    async componentDidUpdate(prevProps, preState, snapshot) {
    }

    handleOnClickConversation(id) {
        this.setState({ selectedConversation: id })
    }

    componentWillUnmount() {
        let { socket } = this.state;
        socket.close();
    }
    getMessagesOfConversation() {
        let data = this.state.conversations.find((conversation) => {
            return conversation.patientId === this.state.selectedConversation
        })
        if (data) {
            return data.displayMessages
        } else {
            return []
        }
    }

    shortenName = (patientId) => {
        return "User " + patientId.slice(0, 3) + "..." + patientId.slice(-3);
    }

    handleSendMessage = async () => {
        let { socket, selectedConversation, currentMessage } = this.state;
        let currentConversationList = this.state.conversations;
        let data = {
            messageText: currentMessage,
            patientId: selectedConversation
        }
        await socket.emit('messageFromDoctor', data);
        this.setState({
            conversations: currentConversationList.map((conversation) => {
                if (conversation.patientId === selectedConversation) {
                    conversation.displayMessages.push({
                        content: currentMessage,
                        owner: true,
                        time: format(Date.now())
                    })
                }
                return conversation
            }),
            currentMessage: ''
        })
        // return true;
        // console.log(this.state.currentMessage)
    }

    render() {
        let { conversations, selectedConversation, currentMessage } = this.state
        let displayMessages = this.getMessagesOfConversation()
        return (
            <>
                <div className="container manage-chat-container">
                    <div className="row clearfix manage-chat-block">
                        <div className="col-lg-12">
                            <div className="card chat-app">
                                <div id="plist" className="people-list">
                                    <ul className="list-unstyled chat-list mt-2 mb-0">
                                        {conversations && conversations.map((item, index) => {
                                            return (
                                                <li className={selectedConversation === item.patientId ? 'clearfix active' : 'clearfix'} key={index} onClick={() => this.handleOnClickConversation(item.patientId)}>
                                                    <img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="avatar" />
                                                    <div className="about">
                                                        <div className="name">{this.shortenName(item.patientId)}</div>
                                                        <div className="status"> <i className="fa fa-circle offline"></i> left 7 mins ago </div>
                                                    </div>
                                                </li>
                                            )
                                        })
                                        }
                                    </ul>
                                </div>
                                <div className="chat">
                                    <div className="chat-header clearfix">
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <a href="javascript:void(0);" data-toggle="modal" data-target="#view_info">
                                                    <img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="avatar" />
                                                </a>
                                                <div className="chat-about">
                                                    <h6 className="m-b-0">{selectedConversation}</h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="chat-history">
                                        <ul className="m-b-0">
                                            {displayMessages && displayMessages.map((message, index) => {
                                                return (
                                                    <li className="clearfix" key={index}>
                                                        {message.owner ?
                                                            (
                                                                <div>
                                                                    <div className="message-data text-right">
                                                                        <span className="message-data-time">{message.time}</span>
                                                                    </div>
                                                                    <div className="message other-message float-right"> {message.content} </div>
                                                                </div>
                                                            )
                                                            :
                                                            (
                                                                <div>
                                                                    <div className="message-data">
                                                                        <span className="message-data-time">{message.time}</span>
                                                                    </div>
                                                                    <div className="message my-message">{message.content}</div>
                                                                </div>
                                                            )
                                                        }
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                    <div className="chat-message clearfix">
                                        <div className="input-group mb-0">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text"><i className="fa fa-send"></i></span>
                                            </div>
                                            {/* <div className='bottom-container'> */}
                                            <input value={currentMessage} onChange={(e) => this.setState({ currentMessage: e.target.value })} type="text" className="form-control" placeholder="Enter text here..." />
                                            <button onClick={() => this.handleSendMessage()}>Send</button>
                                            {/* </div> */}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        // language: state.app.language,
        user: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageChat);
