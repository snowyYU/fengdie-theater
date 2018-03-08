import {myHttp} from '../../../common/scripts/http'
window['_component_list'] = function(id) {
  // 凤蝶组件入口函数，会自动注入组件的 id，
  // 可根据此 id 获取组件对应在页面上的 DOM 元素
  const component = document.getElementById(id);

  // console.log('测试组件1',id);

};
  // console.log('测试组件2');

// 因为接口返回的数据不是数组，采用id选择
const AAudioUrl = $("#AAudioUrl")
const AContent = $("#AContent")
const BondAudioUrl = $("#BondAudioUrl")
const BondContent = $("#BondContent")
const HKAudioUrl = $("#HKAudioUrl")
const HKContent = $("#HKContent")

// 请求主页音频相关数据
console.log(myHttp);
myHttp.get(myHttp.api.content)
      .then((res)=>{
        console.log(res);
        AAudioUrl[0].src=res.data.aAudioUrl;
        BondAudioUrl[0].src=res.data.bondAudioUrl;
        HKAudioUrl[0].src=res.data.hkAudioUrl;
        // 保存剧场期数id
        window['theaterId']=res.data.id;
        // 初始化音频的总时间
        // 遍历,监听durationchange
        [AAudioUrl[0],BondAudioUrl[0],HKAudioUrl[0]].forEach((e)=>{
          e.addEventListener("durationchange",()=>{
            setTimeout(()=>{
              setAllTime();
            },100)
          })
        })

        AContent.html(audioDescript(res.data.aOpinion, res.data.aContent))
        BondContent.html(audioDescript(res.data.bondOpinion, res.data.bondContent))
        HKContent.html(audioDescript(res.data.hkOpinion, res.data.hkContent))
      })
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
const listContent = document.querySelector('#list-content');
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
listContent.addEventListener('touchstart', (e)=>{
  let event = e || window.event;
  let audioBtn = event.target || event.srcElement;
  // 遍历，直到获取按钮
  while (audioBtn && !audioBtn.matches('.audio-btn-wrapper')) {
      audioBtn = audioBtn.parentNode
      if (document === audioBtn) {
          audioBtn = null
      }
  }
  // alert("XXXXX");
  if (audioBtn) {
      let audio = audioBtn.parentNode.parentNode.querySelector('audio');

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
  let allAudio = document.querySelectorAll('#list-content audio');
  [].forEach.call(allAudio,(e)=>{
    let timeTotal = e.parentNode.querySelector('.time-total');
    timeTotal.innerHTML = timer_format(e.duration);
  })
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
