/*
 * @Author: JP
 * @Date: 2018-01-25 09:46:47
 * @Last Modified by: JP
 * @Last Modified time: 2018-01-26 15:20:14
 */
import axios from 'axios';

class Auth {
    constructor(authConfig) {
        this.appId = authConfig.appId
        this.userAPI = authConfig.userIdAPI
        this.scopeType = authConfig.scopeType
        this.redirectScope = authConfig.redirectScope
        this.localUserInfo = authConfig.localUserInfo
    }
    // 获取信息
    getUserInfo() {
        const code = this.queryUrlParam('auth_code');
        if (globalEnv === 'local' || globalEnv === 'editor') {
            sessionStorage._DL_userInfo = JSON.stringify(this.localUserInfo)
        }
        const localUserInfo = sessionStorage._DL_userInfo && JSON.parse(sessionStorage._DL_userInfo)
        const _self = this
        return new Promise(function(resolve, reject) {
            if (!localUserInfo) {
                if (!code) {
                    _self.authRedirect()
                } else {
                    axios.get(_self.userAPI, {
                        params: {
                            code: code,
                            scope: _self.scopeType
                        }
                    })
                    .then((res) => {
                        sessionStorage._DL_userInfo = JSON.stringify(res.data)
                        resolve(res.data)
                    })
                    .catch ((err) => {
                        reject(err);
                    })
                }
            } else {
                resolve(localUserInfo)
            }
        })
    }
    // 授权回调
    authRedirect() {
        const redirectU = window.location.href
        window.location.replace('https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=' + this.appId + '&scope='+ this.redirectScope + '&redirect_uri=' + redirectU);
    }
    // 获取浏览地址参数
    queryUrlParam(key) {
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURIComponent(r[2]);
        return null
    }
}
let authConfig = globalSchemaData
authConfig.localUserInfo = {
    userId: 2088802298938696,
    nickname: null
}

export const auth = new Auth(authConfig)
