import { myHttp } from '../../../common/scripts/http'
window['_component_video-display'] = function(id) {
}
// 回顾
$('#btnRight').on('click',(e)=>{
  $('.wrapper').css('overflow','hidden');
  $('#present').show();
})

$('#knowBtn').on('click',(e)=>{
  $('.wrapper').css('overflow','');
  $('#present').hide();
})

// 献花与推荐部分
$('#btnCenter').on('click',(e)=>{
  $('.wrapper').css('overflow','hidden');
  send(1);


  // 两个接口
  // 先请求献花接口
  //



})

$('#reviewCloseBtn').on('click',(e)=>{
  $('.wrapper').css('overflow','');
  $('#review').hide();
  $('#review').css('opacity',0);
  $('#review').css('filter','Alpha(opacity=100)');
})

// websocket 部分
// ******************************************* websocket start **********************************
var websocket = null;
var lockReconnect = false;  //避免ws重复连接
//判断当前浏览器是否支持WebSocket
var websocketRequestUrl = globalSchemaData.webSocketURL + '?userId='+sessionStorage.getItem("userId")
console.log(websocketRequestUrl);
createWebSocket(websocketRequestUrl)
// 建立websocket
function createWebSocket(url) {
    try{
        if('WebSocket' in window){
            websocket = new WebSocket(url);
        }else if('MozWebSocket' in window){
            websocket = new MozWebSocket(url);
        }else{
            alert("您的浏览器不支持websocket协议,建议使用新版谷歌、火狐等浏览器，请勿使用IE10以下浏览器，360浏览器请使用极速模式，不要使用兼容模式！");
        }
        initEventHandle();
    }catch(e){
        reconnect(url);
        console.log(e);
    }
}
// 初始化各事件的处理函数
function initEventHandle() {
    //连接关闭的回调方法
    websocket.onclose = function () {
        reconnect(websocketRequestUrl);
        console.log("llws连接关闭!"+new Date().toUTCString());
    };
    //连接发生错误的回调方法
    websocket.onerror = function () {
        reconnect(websocketRequestUrl);
        console.log("llws连接错误!");
    };
    //连接成功建立的回调方法
    websocket.onopen = function () {
        heartCheck.reset().start();      //心跳检测重置
        console.log("llws连接成功!"+new Date().toUTCString());
    };
    //接收到消息的回调方法
    websocket.onmessage = function (event) {    //如果获取到消息，心跳检测重置
        heartCheck.reset().start();      //拿到任何消息都说明当前连接是正常的
        console.log("websocket return data",event.data);
        // 先根据后台返回判断是否是心跳,是的话不会向下执行
        if (event.data == 'ok') {
          return
        }
        // 根据后台返回判断今天是否已经献花
        if(event.data&&event.data!=='false'){
          $("#totalFlowers .presentNumber").text(event.data)
          console.log(event.data);
          // 出现献花动画
          $('#presentFlowers img').addClass('active')
          setTimeout(()=>{
            $('#presentFlowers img').removeClass('active')
          },2000)
          $('#review').show();
          getRecommendFund()
          setTimeout(()=>{
            $('#review').css('opacity',1);
            $('#review').css('filter','Alpha(opacity=0)');
          },2000)
        } else {
          // 修改弹框文案，并且弹框无延迟
          $("#review .review-title").html("今天您已经献过花啦，一天只能献一次花哦");
          $('#review').show();
          getRecommendFund()
          setTimeout(()=>{
            $('#review').css('opacity',1);
            $('#review').css('filter','Alpha(opacity=0)');
          })
        }
    };
}

function reconnect(url) {
    if(lockReconnect) return;
    lockReconnect = true;
    setTimeout(function () {     //没连接上会一直重连，设置延迟避免请求过多
        createWebSocket(url);
        lockReconnect = false;
    }, 2000);
}

//心跳检测
var heartCheck = {
    timeout: 180000,        //5分钟发一次心跳
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function(){
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start: function(){
        var self = this;
        this.timeoutObj = setTimeout(function(){
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            //onmessage拿到返回的心跳就说明连接正常
            send("ping");
            console.log("ping!")
            self.serverTimeoutObj = setTimeout(function(){//如果超过一定时间还没重置，说明后端主动断开了
                websocket.close();     //如果onclose会执行reconnect，我们执行websocket.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
            }, self.timeout)
        }, this.timeout)
    }
}

//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
window.onbeforeunload = function () {
    closeWebSocket();
}

//关闭WebSocket连接
function closeWebSocket() {
    websocket.close();
}
//发送消息
function send(message) {
    websocket.send(message);
}

// 加入心跳检测部分，


// ************************************* websocket end ****************************************


// 专为回顾部分的音频准备的
// 因为接口返回的数据不是数组，采用id选择
const reviewAudioUrl = $("#reviewAudioUrl")
const reviewContent = $("#reviewContent")

// 获取献花总数


// 请求主页音频相关数据
async function initPageHttpRequest() {
  await myHttp.get(myHttp.api.content)
        .then((res)=>{
          console.log(res);
          reviewAudioUrl[0].src=res.data.reviewAudioUrl;
          window['contentData'] = res.data
          // 初始化音频的总时间
          reviewAudioUrl[0].addEventListener("durationchange",()=>{
            setTimeout(()=>{
              setAllTime();
            },100)
          })
          reviewContent.html(audioDescript(res.data.reviewOpinion, res.data.reviewContent))
        })
  myHttp.get(myHttp.api.getTotalFlowers,{params:{theaterId:contentData.id}})
        .then((res)=>{
          console.log(res);
          if (!res.data.count) return
          $("#totalFlowers .presentNumber").text(res.data.count)
        })
}
initPageHttpRequest()
// 获取本期推荐基金
var recommendFundWrapper = $("#review .review-content")
function getRecommendFund () {
  myHttp.get(myHttp.api.recommendFund,{params:{theaterId:contentData.id}})
        .then((res)=>{
          console.log('recommand',res.data)
          if (!res.data[0]) return ;
          res.data.forEach((e)=>{
            // 处理涨幅
            let num = translateNum(e.rate);
            recommendFundWrapper.append(fundTemplate(num,e.fundName,e.fundDesc,e.url))
          })
        })
}
function translateNum(num) {
  let numb = Number(num);
  if (num>0) {
    return `+${num}%`
  } else {
    return `-${num}%`
  }
}
// 本期推荐基金的模板函数
function fundTemplate (rate,title, des,url) {
  return `<div class="review-item">
            <div class="item-part item-left">
              <div class="item-left-num">${rate}</div>
              <div class="item-desc">近一年涨幅</div>
            </div>
            <div class="item-part item-center">
              <div class="item-center-title">${title}</div>
              <div class="item-desc">${des}</div>
            </div>
            <div class="item-part item-right">
              <a class="goToSee" style="background-image:url(${headerSchemaData.goToSee})" href="${url}"></a>
            </div>
          </div>`
}
// 主题内容输出m模版
function audioDescript(type,content) {
  let classType;
  switch (type) {
    case '看好':
      classType = 'redType';
      break;
    case '继续看好':
      classType = 'yellowType';
      break;
    case '观望':
      classType = 'orangeType';
      break;
    default:
      classType = 'redType';
      break;
  }
  let template = `
    <span class="${classType}">${type}</span>${content}
  `
  return template
}

// 激活进度条
function activeProgressBar (btn,pro) {
    console.log('activeProgress',this);
    //如果没有传进度相关的参数进来
    let progressBtn = btn || this.parentNode.querySelector('.progress-btn');
    let progress = pro || this.parentNode.querySelector('.progress');
    //获取播放按钮
    let audioBtn = this.parentNode.querySelector('.audio-btn-wrapper');
    let timeIn = this.parentNode.querySelector('.time-in');
    let timeTotal = this.parentNode.querySelector('.time-total');
    timeIn.innerHTML = timer_format(this.currentTime);
    timeTotal.innerHTML = timer_format(this.duration);
    var percentNum = Math.floor((this.currentTime / this.duration) * 10000) / 100 + '%';
    progress.style.width = percentNum;
    progressBtn.style.left = percentNum;
    //播放结束，暂停，回到0s
    if (percentNum == '100%') {
      removeClass(audioBtn,'active');
      this.pause();
      this.currentTime = 0;
    }
}
var progressTimer;
// 进度条操作音乐播放进度，绑定事件，使用事件委托
const listContent = document.querySelector('#present');
['touchstart','touchmove','touchend'].forEach((eventName)=>{
  listContent.addEventListener(eventName, (e)=>{
    let event = e || window.event;
    let progressBtn = event.target || event.srcElement;
    //获取现在播放时间
    let timeIn = progressBtn.parentNode.parentNode.querySelector('.time-in');
    //获取audio
    let audio = progressBtn.parentNode.parentNode.querySelector('audio');
    //获取progress
    let progress = progressBtn.previousSibling.previousSibling;
    console.log(progress);
    //获取progressbar
    let progressBar = progressBtn.parentNode;
    // 判断是否匹配目标元素
    if (progressBtn.className === 'progress-btn') {
      if (event.type === 'touchstart') {
        clearInterval(progressTimer);
      }
      if (event.type === 'touchmove') {
        console.log(event);
        var percentNum = (event.targetTouches[0].pageX - progressBar.offsetLeft) / progressBar.offsetWidth;
        if (percentNum > 1) {
            percentNum = 1;
        } else if (percentNum < 0){
            percentNum = 0;
        }
        progressBtn.style.left = percentNum * 100 + '%';
        progress.style.width = percentNum * 100 + '%';
        let currentTimeS = audio.duration*percentNum;
        timeIn.innerHTML=timer_format(currentTimeS);
      }
      if (event.type === 'touchend') {
        var percentNum = (event.changedTouches[0].pageX - progressBar.offsetLeft) / progressBar.offsetWidth;
        audio.currentTime = audio.duration * percentNum;
        progressTimer = setInterval(()=>{
          activeProgressBar.call(audio,progressBtn,progress)
        }, 300);
      }
    }

    // clearInterval(touchstart)
  })
})

//点击播放
listContent.addEventListener('click', (e)=>{
  let event = e || window.event;
  let audioBtn = event.target || event.srcElement;
  while (audioBtn && !audioBtn.matches('.audio-btn-wrapper')) {
      audioBtn = audioBtn.parentNode
      if (document === audioBtn) {
          audioBtn = null
      }
  }
  if (audioBtn) {
      let audio = audioBtn.parentNode.parentNode.querySelector('audio');
      console.log(audio);
      if (audio.paused) {
        //开始播放

        //暂停所有播放，清除定时器
        reset();
        clearInterval(progressTimer);
        addClass(audioBtn,'active');
        audio.play();
        progressTimer = setInterval(()=>{
          activeProgressBar.call(audio)
        }, 300);
      }else{
        //清楚定时器
        clearInterval(progressTimer);
        removeClass(audioBtn,'active');
        audio.pause();
      }

  }
  // let audio = audioBtn.parentNode.parentNode
})


//初始化所有音频右侧的总时间
function setAllTime() {
  let timeTotal = document.querySelector('#present .time-total');
  if (reviewAudioUrl[0].duration) {
    timeTotal.innerHTML = timer_format(reviewAudioUrl[0].duration);
  }


}
function reset() {
  //暂停所有音频
  let allAudio = document.querySelectorAll('#list-content audio');
  console.log(allAudio);
  [].forEach.call(allAudio,(e)=>{
    e.pause();
    let active = e.parentNode.querySelector('.audio-btn-wrapper')
    if (hasClass(active,'active')) {
      removeClass(active,'active')
    }
  })
}
//将秒数转化为分秒
function timer_format(s) {
  let t,min,sec;
  if(s > -1){
      min = Math.floor(s/60);
      sec = Math.floor(s % 60);
      t="";
      if(min < 10){t += "0";}
          t += min + ":";
      if(sec < 10){t += "0";}
          t += sec;
  }
  return t;
}
