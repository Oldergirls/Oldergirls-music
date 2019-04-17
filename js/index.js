(function () {
    /* 页面刚加载 读取本地存储的列表*/
    let data = localStorage.getItem('mList') ?
        JSON.parse(localStorage.getItem('mList')) : [];

    let searchData = [];

    //搜索列表
    let searchDate = [];
    //获取元素
    let start = document.querySelector('.start');
    let next = document.querySelector('.next');
    let prev = document.querySelector('.prev');
    let audio = document.querySelector('audio');
    let nowTimeSpan = document.querySelector('.nowTime');
    let totalTimeSpan = document.querySelector('.totalTime');
    let songSinger = document.querySelector('.ctrl-bars-box span');
    let logoImg = document.querySelector('.logo img');
    let ctrlBars = document.querySelector('.ctrl-bars');
    let nowBars = document.querySelector('.nowBars');
    let ctrlBtn = document.querySelector('.ctrl-btn');
    let modeBtn = document.querySelector('.mode');
    let infoEl = document.querySelector('.info');
    let body = document.querySelector('.body');
    let listBox = document.querySelector('.play-list-box ul');


    //变量
    let index = 0;//标识当前播放歌曲索引
    /*      let str = '';//用来累积播放项*/
    let rotateDag = 0;//记录专辑封面旋转角度
    let timer = null;//保存定时器
    let modeNum = 0;//0顺序播放 1单曲循环 2随机播放
    let infoTimer = null;

    // 加载播放列表
    function loadPlayList() {
        if (data.length) {
            let str = ''; // 用来累计播放项
            // 加载播放列表
            for (let i = 0; i < data.length; i++) {
                str += '<li>';
                str += '<i>×</i>';
                str += '<span>' + data[i].name + '</span>';
                str += '<span>';
                for (let j = 0; j < data[i].ar.length; j++) {
                    str += data[i].ar[j].name + '  ';
                }
                str += '</span>';

                str += '</li>';
            }
            listBox.innerHTML = str;
        }
    }

    loadPlayList();

    //实现当前播放歌曲数量
    function loadNum() {
        $('.play-list').html(data.length);
    }

    loadNum();
    /*  listBox.innerHTML = str;*/

    //请求服务器
    $('.search').on('keydown', function (e) {
        if (e.keyCode === 13) {
            //按下回车键
            $.ajax({
                url: 'https://api.imjad.cn/cloudmusic/',
                //参数
                data: {
                    type: 'search',
                    s: this.value
                },
                success: function (data) {
                    searchData = data.result.songs;
                    var str = '';
                    for (var i = 0; i < searchData.length; i++) {
                        str += '<li>';
                        str += '<span class="left song">' + searchData[i].name + '</span>';
                        str += '<span class="right singer">';
                        for (var j = 0; j < searchData[i].ar.length; j++) {
                            str += searchData[i].ar[j].name + '  ';
                        }
                        str += '</span>';
                        str += '</li>';
                    }
                    $('.searchUl').html(str);
                },
                error: function (err) {
                    console.log(err);
                }
            });
            this.value = '';
        }
    });

    // 点击搜索列表
    $('.searchUl').on('click', 'li', function () {
        data.push(searchData[$(this).index()]);
        localStorage.setItem('mList', JSON.stringify(data));
        loadPlayList();
        index = data.length - 1;
        init();
        play();
    });

    //切换播放列表
    function checkPlayList() {
        let playList = document.querySelectorAll('.play-list-box li');
        for (let i = 0; i < data.length; i++) {
            playList[i].className = '';
        }
        playList[index].className = 'active';
    }

    function info(str) {
        infoEl.innerHTML = str;
        $(infoEl).fadeIn();
        clearInterval(infoTimer);
        infoTimer = setTimeout(function () {
            $(infoEl).fadeOut();
        }, 1000)
    }

    //点击列表中的歌曲进行播放
    $(listBox).on('click', 'li', function () {
        index = $(this).index();
        init();
        play();
    });
    //点击播放放列表
    $(listBox).on('click','i',function (e) {
        data.splice($(this).parent().index(),1);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        e.stopPropagation();
    });

    // 初始化播放
    function init() {
        // 给audio设置播放路径
        rotateDeg = 0;
        checkPlayList();
        $('.mask').css({
            background: 'url("' + data[index].al.picUrl + '")',
            backgroundSize: '100%',

        });
        audio.src = 'http://music.163.com/song/media/outer/url?id=' + data[index].id + '.mp3';
        let str = '';
        str += data[index].name + ' --- ';
        for (let i = 0; i < data[index].ar.length; i++) {
            str += data[index].ar[i].name + '  ';
        }
        songSinger.innerHTML = str;
        logoImg.src = data[index].al.picUrl;
    }

    init();

    //去不重复的随机数
    function getRandomNum() {
        let randomNum = Math.floor(Math.random() * data.length);
        if (randomNum === index) {
            randomNum = getRandomNum();
        }
        return randomNum;
    }

    //播放音乐
    function play() {
        audio.play();
        clearInterval(timer);
        timer = setInterval(function () {
            rotateDag++;
            logoImg.style.transform = 'rotate(' + rotateDag + 'deg)';
        }, 30);
        start.style.backgroundPositionY = '-163px';
    }

    //格式化时间
    function formatTime(time) {
        return time > 9 ? time : '0' + time;
    }

    //小方框播放循序提醒
    function info(str) {
        infoEl.style.display = 'block';
        infoEl.innerHTML = str;
        setTimeout(function () {
            infoEl.style.display = 'none';
        }, 1000)
    }

    //播放暂停
    start.addEventListener('click', function () {
        //检测歌曲播放状态
        if (audio.paused) {
            play();
        } else {
            audio.pause();
            clearInterval(timer);
            start.style.backgroundPositionY = '-202px';

        }
    });
    //下一曲
    next.addEventListener('click', function () {
        index++;
        index = index > data.length - 1 ? 0 : index;
        init();
        play();
    })
    //上一曲
    prev.addEventListener('click', function () {
        index--;
        index = index < 0 ? data.length - 1 : index;
        init();
        play();
    });

    //切换播放模式
    modeBtn.addEventListener('click', function () {
        modeNum++;
        modeNum = modeNum > 2 ? 0 : modeNum;
        switch (modeNum) {
            case 0:
                info('顺序播放');
                modeBtn.style.backgroundPositionX = '0px';
                modeBtn.style.backgroundPositionY = '-339px';
                break;
            case 1:
                info('单曲播放');
                modeBtn.style.backgroundPositionX = '-64px';
                modeBtn.style.backgroundPositionY = '-339px';
                break;
            case 2:
                info('随机播放');
                modeBtn.style.backgroundPositionX = '-64px';
                modeBtn.style.backgroundPositionY = '-243px';
                break;

        }
    })

    //获取音乐时间
    audio.addEventListener('canplay', function () {
        let totalTime = audio.duration;
        let totalM = parseInt(totalTime / 60);
        let totalS = parseInt(totalTime % 60);
        totalTimeSpan.innerHTML = formatTime(totalM) + ' : ' + formatTime(totalS);
        audio.addEventListener('timeupdate', function () {
            let currentTime = audio.currentTime;
            let currentM = parseInt(currentTime / 60);
            let currentS = parseInt(currentTime % 60);
            nowTimeSpan.innerHTML = formatTime(currentM) + ':' + formatTime(currentS);

            let barWidth = ctrlBars.clientWidth;
            let position = currentTime / totalTime * barWidth;
            nowBars.style.width = position + 'px';
            ctrlBtn.style.left = position + 'px';

            if (audio.ended) {
                switch (modeNum) {
                    //顺序播放
                    case 0:
                        next.click();
                        break;
                    case 1:
                        init();
                        play();
                        break;
                    case  2:
                        // let  randomNum =Math.floor(Math.random()*data.length);
                        // if (randomNum===index){
                        //
                        // }
                        index = getRandomNum();
                        init();
                        play();
                        break;
                }
            }


        });
        ctrlBars.addEventListener('click', function (e) {
            audio.currentTime = e.offsetX / ctrlBars.clientWidth * audio.duration;
        });
        ctrlBars.addEventListener('mousedown', function () {
            body.style.userSelect = 'none';
            window.onmouseover = function (e) {

                audio.currentTime = e.offsetX / ctrlBars.clientWidth * audio.duration;

            }
        });
        ctrlBars.addEventListener('mouseup', function () {
            window.onmouseover = null;

        })

    })

})();