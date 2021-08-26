var server       = ""; // add your Keycloak-URL here (without /auth)
var realm        = ""; // the name of the realm
var grantType    = "password"; // the granttype, with password you can login as a normal user
var clientId     = ""; // the name of the client you created in Keycloak
var clientSecret = ""; // the secret you copied earlier
var username     = ""; // the username of the user you want to test with
var password     = ""; // the password of the user you want to test with

var url = `${server}/auth/realms/${realm}/protocol/openid-connect/token`;
var data = `grant_type=${grantType}&client_id=${clientId}&username=${username}&password=${password}`;
//&client_secret=${clientSecret}`;  --> append this part to the above line if your setup requires client_secret

const old_token = pm.variables.get("token");
var oldTokenJson;
var tokenExpired;

if (typeof (old_token) !== "undefined" && old_token !== null && old_token) {
    oldTokenJson = parseJwt(pm.variables.get("token"));
    if (oldTokenJson.exp >= Math.floor(Date.now() / 1000)) {
        tokenExpired = false;
        console.log("Token is still valid, it will expire on: " + new Date(oldTokenJson.exp * 1000))
    } else {
        tokenExpired = true;
        console.log("Token expired " + oldTokenJson.exp + ", going to refresh it")
    }
}

if (tokenExpired || !oldTokenJson || (typeof (oldTokenJson) === "undefined" && (oldTokenJson === null || (typeof (oldTokenJson) === "undefined")))) {
    pm.sendRequest({
        url: url,
        method: 'POST',
        header: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: {
            mode: 'raw',
            raw: data
        }
    }, function (err, response) {
        var response_json = response.json();
        var token = response_json.access_token;
        pm.environment.set('token', token);
        console.log(token);
    });
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};