import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            linkToRedirect: '/home'
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState, snapshot) {

    }
    render() {
        let { linkToRedirect } = this.state
        const { isLoggedIn, userInfo } = this.props;
        console.log("🚀 ~ file: Home.js:54 ~ Home ~ render ~ userInfo", userInfo)
        // let linkToRedirect = ''
        if (isLoggedIn && userInfo.roleId === "R1") {
            linkToRedirect = '/system/user-manage'
        } else if (isLoggedIn && userInfo.roleId === "R2") {
            linkToRedirect = '/doctor/manage-schedule'
        }
        console.log("🚀 ~ file: Home.js:10 ~ Home ~ render ~ linkToRedirect", linkToRedirect)
        return (
            <Redirect to={linkToRedirect} />
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
