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
  $('#review').show();
  // 两个接口
  // 先请求献花接口
  //
  getRecommendFund()
  setTimeout(()=>{
    $('#review').css('opacity',1);
    $('#review').css('filter','Alpha(opacity=0)');
  })


})

$('#reviewCloseBtn').on('click',(e)=>{
  $('.wrapper').css('overflow','');
  $('#review').hide();
  $('#review').css('opacity',0);
  $('#review').css('filter','Alpha(opacity=100)');
})

// websocket 部分

var websocket = null;
//判断当前浏览器是否支持WebSocket
var websocketRequestUrl = globalSchemaData.webSocketURL + '?userId='+sessionStorage.getItem("userId")
console.log(websocketRequestUrl);
if ('WebSocket' in window) {
    websocket = new WebSocket(websocketRequestUrl);
}
else {
    alert('当前浏览器 Not support websocket')
}

//连接发生错误的回调方法
websocket.onerror = function () {
    console.log("WebSocket连接发生错误");
};

//连接成功建立的回调方法
websocket.onopen = function () {
    console.log("WebSocket连接成功");
}

//接收到消息的回调方法
websocket.onmessage = function (event) {
  console.log("websocket return data",event.data);
  // 根据后台返回判断今天是否已经献花
  if(event.data&&event.data!=='false'){
    $("#totalFlowers .presentNumber").text(event.data)
    console.log(event.data);
  } else {
    $("#review .review-title").html("今天您已经献过花啦，一天只能献一次花哦")
  }

}

//连接关闭的回调方法
websocket.onclose = function () {
    console.log("WebSocket连接关闭");
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
