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