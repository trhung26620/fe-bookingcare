import React, { Component } from 'react';
import { connect } from "react-redux";
import { postVerifyBookAppointment } from '../../services/userService';
import HomeHeader from '../HomePage/HomeHeader';
import './VerifyEmail.scss'
import Payment from './Payment';

class VerifyEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statusVerify: false,
            errCode: 0,
            token: '',
            isSuccessStatus: false
        }
    }
    async componentDidMount() {
        if (this.props.location && this.props.location.search) {
            let urlParams = new URLSearchParams(this.props.location.search);
            let token = urlParams.get('token');
            let doctorId = urlParams.get('doctorId');
            this.setState({
                token: token
            })
            let res = await postVerifyBookAppointment({
                token: token,
                doctorId: doctorId
            })
            if (res && res.errCode === 0) {
                this.setState({
                    statusVerify: true,
                    errCode: res.errCode
                })
            } else {
                this.setState({
                    statusVerify: true,
                    errCode: res && res.errCode ? res.errCode : -1
                })
            }
        }
    }

    async componentDidUpdate(prevProps, preState, snapshot) {
        if (this.props.language !== prevProps.language) {

        }
    }

    changeToSuccessStatus = () => {
        console.log("Debuggggggggggggg1")
        this.setState({
            isSuccessStatus: true
        })
    }

    showHideDetailInfor = (status) => {
        this.setState({
            isShowDetailInfor: status
        })
    }
    render() {
        let { statusVerify, errCode, token, isSuccessStatus } = this.state
        console.log("🚀 ~ file: VerifyEmail.js:64 ~ VerifyEmail ~ render ~ isSuccessStatus", isSuccessStatus)
        return (
            <>
                <HomeHeader />
                <div className='verify-email-container'>
                    {statusVerify === false ?
                        <div>
                            Loading data...
                        </div>
                        :
                        <div>
                            {errCode === 0 && token && isSuccessStatus === false ?
                                // <div className='infor-booking'>Xác nhận lịch hẹn thành công!</div>
                                <div>
                                    <Payment
                                        token={token}
                                        changeToSuccessStatus={this.changeToSuccessStatus}
                                    /></div>
                                :
                                <div className='infor-booking'>
                                    {isSuccessStatus === true ?
                                        "Xác nhận lịch hẹn thành công!"
                                        :
                                        "Lịch hẹn không tồn tại hoặc đã được xác nhận!"
                                    }
                                </div>

                            }
                        </div>
                    }
                </div>
            </>
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

export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmail);
