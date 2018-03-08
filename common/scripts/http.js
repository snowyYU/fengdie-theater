// 导入axios的依赖
import axios from 'axios'
import API from './API'

// 实例化一个axios对象





// response 拦截器


class MyHttp {
  constructor() {
    this.api = API
    this.httpInit()
  }
  // public api = API
  post (api,param){
    return this.myHttp.post(api.url,param)
  }
  get (api,param){
    return this.myHttp.get(api.url,param)
  }
  httpInit (){
    this.myHttp = axios.create({
      contenType: 'application/json',
      baseURL: globalSchemaData.baseURL
    })
    // request 拦截器
    // this.myHttp.interceptors.request.use((config) => {
    // 
    // })
  }

}

export const myHttp = new MyHttp()
