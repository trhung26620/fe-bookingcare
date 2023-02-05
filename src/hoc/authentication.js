import locationHelperBuilder from "redux-auth-wrapper/history4/locationHelper";
import { connectedRouterRedirect } from "redux-auth-wrapper/history4/redirect";

const locationHelper = locationHelperBuilder({});

export const userIsAuthenticated = connectedRouterRedirect({
    // authenticatedSelector: state => state.user.isLoggedIn,
    authenticatedSelector: state => {
        let userData = JSON.parse(localStorage.getItem('persist:user'))
        if (userData && userData.isLoggedIn && userData.isLoggedIn === "true") {
            return true
        } else {
            return false
        }
    },
    wrapperDisplayName: 'UserIsAuthenticated',
    redirectPath: '/login'
});
// JSON.parse(JSON.parse(localStorage.getItem('persist:user')).userInfo)
export const UserIsNotAuthenticatedAndAdminRole = connectedRouterRedirect({
    // Want to redirect the user when they are authenticated
    authenticatedSelector: state => !state.user.isLoggedIn,
    wrapperDisplayName: 'UserIsNotAuthenticatedAndAdminRole',
    // redirectPath: (state, ownProps) => locationHelper.getRedirectQueryParam(ownProps) || '/',
    // redirectPath: (state, ownProps) => {
    //     console.log("🚀 ~ file: authentication.js:18 ~ ownProps", ownProps)
    //     console.log("🚀 ~ file: authentication.js:20 ~ state.user", state.user)

    //     if (state.user.userInfor && state.user.userInfor.roleId) {
    //         console.log("Debugggggggggg")
    //         return state.user.userInfor.roleId === "R1" ? '/system/user-manage' : '/doctor/manage-schedule'
    //     } else {
    //         return '/login'
    //     }
    // },
    redirectPath: '/system/user-manage',
    allowRedirectBack: false
});


export const UserIsNotAuthenticatedAndDoctorRole = connectedRouterRedirect({
    // Want to redirect the user when they are authenticated
    authenticatedSelector: state => !state.user.isLoggedIn,
    wrapperDisplayName: 'UserIsNotAuthenticatedAndDoctorRole',
    redirectPath: '/doctor/manage-schedule',
    allowRedirectBack: false
});