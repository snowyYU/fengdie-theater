window['_component_list'] = function(id) {
  // 凤蝶组件入口函数，会自动注入组件的 id，
  // 可根据此 id 获取组件对应在页面上的 DOM 元素
  const component = document.getElementById(id);



};

$('.video-list-li').on('click', function(e){
    var target = e.target;
    if (e.target.nodeName !== 'LI') {
      target = target.parentElement;
    }
    var targetHref = $(target).data('href');

    window.location = targetHref;
});
