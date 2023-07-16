import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter as Router } from 'connected-react-router';
import { history } from '../redux'
import { ToastContainer } from 'react-toastify';
import { userIsAuthenticated, UserIsNotAuthenticatedAndAdminRole, UserIsNotAuthenticatedAndDoctorRole } from '../hoc/authentication';
import { path } from '../utils'
import Home from '../routes/Home';
// import Login from '../routes/Login';
import Login from '../containers/Auth/Login';
// import Header from './Header/Header';
import System from '../routes/System';
import DetailDoctor from './Patient/Doctor/DetailDoctor';
import HomePage from '../containers/HomePage/HomePage'
import { CustomToastCloseButton } from '../components/CustomToast';
import CustomScrollbars from '../components/CustomScrollbars';
import Doctor from '../routes/Doctor';
import IntlProviderWrapper from "../hoc/IntlProviderWrapper";
import VerifyEmail from './Patient/VerifyEmail';
import DetailSpecialty from './Patient/Specialty/DetailSpecialty';
import DetailClinic from './Patient/Clinic/DetailClinic';
import Payment from './Patient/Payment';
import { HashRouter } from "react-router-dom";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roleId: '',
        }
    }

    handlePersistorState = () => {
        const { persistor } = this.props;
        let { bootstrapped } = persistor.getState();
        console.log("🚀 ~ file: App.js:36 ~ App ~ bootstrapped:", bootstrapped)
        if (bootstrapped) {
            if (this.props.onBeforeLift) {
                Promise.resolve(this.props.onBeforeLift())
                    .then(() => this.setState({ bootstrapped: true }))
                    .catch(() => this.setState({ bootstrapped: true }));
            } else {
                this.setState({ bootstrapped: true });
            }
        }
    };

    componentDidMount() {
        this.handlePersistorState();
    }

    async componentDidUpdate(prevProps, preState, snapshot) {
        if (this.props.isLoggedIn !== prevProps.isLoggedIn) {
            if (this.props.isLoggedIn && this.props.userInfo && this.props.userInfo.roleId) {
                this.setState({
                    roleId: this.props.userInfo.roleId
                })
            } else if (!this.props.isLoggedIn) {
                this.setState({
                    roleId: ''
                })
            }
        }
    }

    render() {
        let { roleId } = this.state
        return (
            // <IntlProviderWrapper>
            <Fragment>
                <Router history={history}>
                    <div className="main-container">
                        {/* {this.props.isLoggedIn && <Header />} */}
                        <div className="content-container" style={{ height: '100vh', width: '100%' }}>
                            <CustomScrollbars>
                                <Switch>
                                    {/* {roleId && roleId === 'R1' && <Route path={path.SYSTEM} component={userIsAuthenticated(System)} />} */}
                                    {/* <HashRouter> */}
                                    <Route path={path.HOME} exact component={Home} />
                                    {roleId === '' && <Route path={path.LOGIN} component={Login} />}
                                    {/* <Route path={path.LOGIN} component={UserIsNotAuthenticatedAndAdminRole(Login)} /> */}
                                    {roleId && roleId === 'R1' && <Route path={path.LOGIN} component={UserIsNotAuthenticatedAndAdminRole(Login)} />}
                                    {roleId && roleId === 'R2' && <Route path={path.LOGIN} component={UserIsNotAuthenticatedAndDoctorRole(Login)} />}
                                    {/* </HashRouter> */}

                                    <Route path={path.SYSTEM} component={userIsAuthenticated(System)} />
                                    <Route path={'/doctor'} component={userIsAuthenticated(Doctor)} />
                                    <Route path={path.HOMEPAGE} component={HomePage} />
                                    <Route path={path.DETAIL_DOCTOR} component={DetailDoctor} />
                                    <Route path={path.DETAIL_SPECIALTY} component={DetailSpecialty} />
                                    <Route path={path.DETAIL_CLINIC} component={DetailClinic} />
                                    <Route path={path.VERIFY_EMAIL_BOOKING} component={VerifyEmail} />
                                    <Route path={path.PAYMENT} component={Payment} />
                                </Switch>
                            </CustomScrollbars>
                        </div>
                        {/* 
                        <ToastContainer
                            className="toast-container" toastClassName="toast-item" bodyClassName="toast-item-body"
                            autoClose={false} hideProgressBar={true} pauseOnHover={false}
                            pauseOnFocusLoss={true} closeOnClick={false} draggable={false}
                            closeButton={<CustomToastCloseButton />}
                        /> */}
                        <ToastContainer
                            position="bottom-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="light"
                        />
                    </div>
                </Router>
            </Fragment>
            // </IntlProviderWrapper>
        )
    }
}

const mapStateToProps = state => {
    return {
        started: state.app.started,
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);