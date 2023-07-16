import React, { Component } from 'react';
import { Fragment } from 'react';
import { connect } from "react-redux";
import HomeHeader from '../../../containers/HomePage/HomeHeader';
import './DetailDoctor.scss';
import { getDetailInforDoctor } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import DoctorSchedule from './DoctorSchedule';
import DoctorExtraInfor from './DoctorExtraInfor';
import Test from './Test';
import LikeAndShare from '../SocialPlugin/LikeAndShare';
import Comment from '../SocialPlugin/Comment';
import LiveChat from '../../../components/LiveChat';
import { io } from 'socket.io-client'
import { format } from 'timeago.js'

class DetailDoctor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            detailDoctor: {},
            currentDoctorId: -1,
            socket: io("ws://localhost:3001"),
            messages: {},
            doctorIsOnline: false,
        }
    }

    sendMessage = async (message) => {
        let { socket, detailDoctor } = this.state;
        let data = {
            messageText: message,
            doctorId: detailDoctor?.id,
        }
        await socket.emit('sendMessage', data);
        return true;
    }

    async componentDidMount() {
        console.log(this.state.messages)
        let { socket } = this.state;
        socket.emit('getAnonymousUser', +this.props.match.params.id);
        socket.on('messageToClient', (message) => {
            console.log(message)
            this.setState({
                messages: {
                    content: message,
                    owner: false,
                    time: format(Date.now())
                }
            })
        });
        socket.on('isDoctorOnline', (doctorId) => {
            if (doctorId === +this.props.match.params.id) {
                this.setState({
                    doctorIsOnline: true
                })
            }
        })
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id
            this.setState({
                currentDoctorId: id
            })
            let res = await getDetailInforDoctor(id)
            if (res && res.errCode === 0) {
                this.setState({
                    detailDoctor: res.data,
                })
            }
        }
    }

    componentDidUpdate() {

    }

    componentWillUnmount() {
        let { socket } = this.state;
        socket.close();
    }
    render() {

        let { language } = this.props;
        let { detailDoctor, messages, doctorIsOnline } = this.state;
        let nameVi = '', nameEn = '';
        if (detailDoctor && detailDoctor.positionData) {
            nameVi = `${detailDoctor.positionData.valueVi}, ${detailDoctor.lastName} ${detailDoctor.firstName}`;
            nameEn = `${detailDoctor.positionData.valueEn}, ${detailDoctor.firstName} ${detailDoctor.lastName}`;
        }

        return (
            <Fragment>
                <HomeHeader
                    isShowBanner={false}
                />
                <div className='doctor-detail-container'>
                    <div className='intro-doctor'>
                        <div className='content-left'
                            style={{ backgroundImage: `url(${detailDoctor && detailDoctor.image ? detailDoctor.image : ''})` }}
                        >
                        </div>
                        <div className='content-right'>
                            <div className='up'>
                                {language === LANGUAGES.VI ? nameVi : nameEn}
                            </div>
                            <div className='down'>
                                {detailDoctor.Markdown
                                    && detailDoctor
                                    && detailDoctor.Markdown.description
                                    &&
                                    <span>
                                        {detailDoctor.Markdown.description}
                                    </span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='schedule-doctor'>
                        <div className='content-left'>
                            <DoctorSchedule
                                doctorIdFromParent={this.state.currentDoctorId}
                            />
                        </div>
                        <div className='content-right'>
                            {/* <Test test1={"abc"}> */}
                            <DoctorExtraInfor
                                doctorIdFromParent={this.state.currentDoctorId}
                            />
                            {/* </Test> */}
                        </div>
                    </div>
                    <div className='detail-infor-doctor'>
                        {detailDoctor && detailDoctor.Markdown && detailDoctor.Markdown.contentHTML &&
                            <div dangerouslySetInnerHTML={{ __html: detailDoctor.Markdown.contentHTML }}>
                            </div>
                        }
                    </div>
                    <div className='comment-doctor'>

                    </div>
                </div>
                {doctorIsOnline &&
                    <div className='live-chat-container'>
                        <LiveChat
                            messages={messages}
                            sendMessage={this.sendMessage}
                        />
                    </div>
                }
            </Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailDoctor);
