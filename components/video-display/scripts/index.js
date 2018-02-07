window['_component_video-display'] = function(id) {
  var videoPic = $('#' + id +' .video-pic');
  var videoMain = $('#' + id + ' .video-main');
  var articleText = $('#' + id + ' .article-text');
  var articleInner = $('#' + id + ' .article-inner');
  var moreBtn = $('#' + id +' .more-btn');
  var wrapHeight = articleText.height();
  var innerHeight = articleInner.height();


  if (wrapHeight < innerHeight) {
      moreBtn.removeClass('hidden');
  }

  // 播放视频
  videoPic.on('click', function(e) {
    videoPic.addClass('hidden');
    videoMain.removeClass('hidden');

    videoMain[0].play();
  });

  // 展开全文
  moreBtn.on('click', function() {
    articleText.addClass('open');
    moreBtn.addClass('hidden');
  });

}