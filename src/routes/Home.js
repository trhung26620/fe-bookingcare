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
        // this.setState({
        //     linkToRedirect: '/home'
        // })
        // console.log("Debug2")
        // const { isLoggedIn, userInfo } = this.props;
        // console.log("🚀 ~ file: Home.js:9 ~ Home ~ render ~ userInfo", userInfo)
        // let linkToRedirectTemp = '/home'
        // if (isLoggedIn && userInfo.roleId === "R1") {
        //     linkToRedirectTemp = '/system/user-manage'
        // } else if (isLoggedIn && userInfo.roleId === "R2") {
        //     linkToRedirectTemp = '/doctor/manage-schedule'
        // }
        // this.setState({
        //     linkToRedirect: linkToRedirectTemp
        // })
        // console.log("🚀 ~ file: Home.js:17 ~ Home ~ componentDidMount ~ linkToRedirectTemp", linkToRedirectTemp)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // if (prevProps.userInfo !== this.props.userInfo) {
        //     console.log("Debug1")
        //     const { isLoggedIn, userInfo } = this.props;
        //     console.log("🚀 ~ file: Home.js:9 ~ Home ~ render ~ userInfo", userInfo)
        //     let linkToRedirectTemp = ''
        //     if (isLoggedIn && userInfo.roleId === "R1") {
        //         linkToRedirectTemp = '/system/user-manage'
        //     } else if (isLoggedIn && userInfo.roleId === "R2") {
        //         linkToRedirectTemp = '/doctor/manage-schedule'
        //     } else {
        //         linkToRedirectTemp = '/home'
        //     }
        //     this.setState({
        //         linkToRedirect: linkToRedirectTemp
        //     })
        //     console.log("🚀 ~ file: Home.js:10 ~ Home ~ render ~ linkToRedirect", linkToRedirectTemp)
        // }
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
