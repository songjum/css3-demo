var songjum = function() {
    var confi = {
        keepZoomRatio: false,
        layer: {
            "width": "100%",
            "height": "100%",
            "top": 0,
            "left": 0
        },

        setTime: {
            walkToThird: 6000,
            walkToMiddle: 6500,
            walkToEnd: 6500,
            walkTobridge: 2000,
            bridgeWalk: 2000,
            walkToShop: 1500,
            walkOutShop: 1500,
            openDoorTime: 800,
            shutDoorTime: 500,
            waitRotate: 850,
            waitFlower: 800
        },
        snowflakeURl: ["images/snowflake/snowflake1.png", "images/snowflake/snowflake2.png", "images/snowflake/snowflake3.png", "images/snowflake/snowflake4.png", "images/snowflake/snowflake5.png", "images/snowflake/snowflake6.png"]
    };
    var debug = 0;

    if (debug) {
        $.each(conf.setTime, function(key, val) {
            confi.setTime[key] = 500

        })
    }
    if (confi.keeZo6mRatio) {
        var proportionY = 900 / 1440;
        var screenHeight = $(document).height();
        var zooomHeight = screenHeight * proportionY;
        var zooomTop = (screenHeight - zooomHeight) / 2;
        confi.layer.height = zooomHeight;
        confi.layer.top = zooomTop
    }
    var container = $("#content");
    container.css(confi.layer);
    //页面可视区域
    var visualHeight = container.height();
    var visualWidth = container.width();
    //获取数据
    var getValue = function(className) {
        var $elem = $(' ' + className + ' ');

        return {
            height: $elem.height(),
            top: $elem.position().top //得到相对于定位祖辈的top值；
        };
    };

    // 路Y
    var pathY = function() {
        var data = getValue('.a_background_middle');
        return data.top + data.height / 2;

    }();
    var bridgeY = function() {
        var data = getValue('.c_background_middle');
        return data.top;
    }();
    var animationEnd = (function() {
        var explorer = navigator.userAgent;
        if (~explorer.indexOf("webKit")) {
            return "webKitAnimationEnd";
        }
        return "animationend";
    })();

    var swipe = Swipe(container);

    function scrollTo(time, proportionX) {
        var distX = visualWidth * proportionX;
        swipe.scrollTo(distX, time)
    }

    var girl = {
        elem: $(".girl"),
        getHeight: function() {
            return this.elem.height();
        },
        rotate: function() {
            this.elem.addClass("girl-rotate")
        },
        setOffset: function() {
            this.elem.css({
                left: visualWidth / 2,
                top: bridgeY - this.getHeight()
            })
        },
        getOffset: function() {
            return this.elem.offset()
        },
        getWidth: function() {
            return this.elem.width();
        }
    };
    var bird = {
        elem: $(".bird"),
        fly: function() {
            this.elem.addClass("birdFly");
            this.elem.transition({
                right: visualWidth
            }, 15000, "linear")
        }
    };
    var logo = {
        elem: $(".logo"),
        run: function() {
            this.elem.addClass("logolightSpeedIn").on(animationEnd, function() {
                $(this).addClass("logoshake").off()
            })
        }
    };
    var boy = BoyWalk();
    boy.walkTo(confi.setTime.walkToThird, 0.6).then(function() {
        $("#sun").addClass('rotation');
        $(".cloud:first").addClass('cloud1Anim');
        $(".cloud:last").addClass('cloud2Anim');
        scrollTo(confi.setTime.walkToMiddle, 1);
        return boy.walkTo(confi.setTime.walkToMiddle, 0.5)
    }).then(function() {
        bird.fly()
    }).then(function() {
        boy.stopWalk();
        return BoyToShop(boy)
    }).then(function() {
        girl.setOffset();
        scrollTo(confi.setTime.walkToEnd, 2);
        return boy.walkTo(confi.setTime.walkToEnd, 0.15)
    }).then(function() {
        return boy.walkTo(confi.setTime.walkTobridge, 0.25, (bridgeY - girl.getHeight()) / visualHeight)
    }).then(function() {
        var proportionX = (girl.getOffset().left - boy.getWidth() - instanceX + girl.getWidth() / 5) / visualWidth;
        return boy.walkTo(confi.setTime.bridgeWalk, proportionX)
    }).then(function() {
        boy.resetOriginal();
        setTimeout(function() {
            girl.rotate();

            boy.rotate(function() {
                snowflake()

            })
        }, confi.setTime.waitRotate)
    }).then(function() {

        logo.run();
        snowflake();
    })


    // 小孩走路

    function BoyWalk() {

        var $boy = $("#boy");
        var boyHeight = $boy.height();
        var boywidth = $boy.width();

        //调整boy的位置
        $boy.css({
            top: pathY - boyHeight + 25
        });

        //暂停走路

        function pauseWalk() {
            $boy.addClass('pauseWalk');
        }

        function restoreWalk() {
            $boy.removeClass('pauseWalk');
        }
        //css3的动作变化
        function slowWalk() {
            $boy.addClass('slowWalk');
        }

        function stratRun(options, runTime) {
            var dfdPlay = $.Deferred();
            //恢复
            restoreWalk();
            $boy.transition(options, runTime, 'linear', function() {
                dfdPlay.resolve();
            });
            return dfdPlay;
        }
        //开始走路

        function walkRun(time, dist, disY) {
            time = time || 3000;
            //脚
            slowWalk();
            //开始
            var d1 = stratRun({
                'left': dist + 'px',
                'top': disY ? disY : undefined
            }, time);
            return d1;
        }

        //走进商店
        function walkToShop(doorObj, runTime) {
            var defer = $.Deferred();
            var doorObj = $(".door");
            var offsetDoor = doorObj.offset();
            var doorOffsetLeft = offsetDoor.left;
            var offsetBoy = $boy.offset();
            var boyOffetLeft = offsetBoy.left;
            instanceX = (doorOffsetLeft + doorObj.width() / 2) - (boyOffetLeft + $boy.width() / 2);
            var walkPlay = stratRun({
                transform: "translateX(" + instanceX + "px),scale(0.3,0.3)",
                opacity: 0.1
            }, 2000);
            walkPlay.done(function() {
                $boy.css({
                    opacity: 0
                });
                defer.resolve()
            });
            return defer
        }

        function walkOutShop(runTime) {
            var defer = $.Deferred();
            restoreWalk();
            var walkPlay = stratRun({
                transform: "translate(" + instanceX + "px,0px),scale(1,1)",
                opacity: 1
            }, runTime);
            walkPlay.done(function() {
                defer.resolve()
            });
            return defer
        }

        //计算距离
        function calculateDist(direction, proportion) {
            return (direction == "x" ? visualWidth : visualHeight) * proportion
        }
        return {
            walkTo: function(time, proportionX, proportionY) {
                var distX = calculateDist("x", proportionX);
                var distY = calculateDist("y", proportionY);
                return walkRun(time, distX, distY)
            },
            stopWalk: function() {
                pauseWalk()
            },
            resetOriginal: function() {
                this.stopWalk();
                $boy.removeClass("slowWalk slowFlolerWalk").addClass("boyOriginal")
            },
            toShop: function() {
                return walkToShop.apply(null, arguments)
            },
            outShop: function() {
                return walkOutShop.apply(null, arguments)
            },
            rotate: function() {
                restoreWalk();
                $boy.addClass("boy-rotate");
            },
            getWidth: function() {
                return $boy.width()
            },
            getDistance: function() {
                return $boy.offset().left
            },
            talkFlower: function() {
                $boy.addClass("slowFlolerWalk")
            }
        }
    }
    var BoyToShop = function(boyObj) {
        var defer = $.Deferred();
        var $door = $(".door");
        var doorLeft = $(".door-left");
        var doorRight = $(".door-right");

        function doorAction(left, right, time) {
            var defer = $.Deferred();
            var count = 2;
            var complete = function() {
                if (count == 1) {
                    defer.resolve();
                    return
                }
                count--
            };
            doorLeft.transition({
                "left": left
            }, time, complete);
            doorRight.transition({
                "left": right
            }, time, complete);
            return defer
        }

        function openDoor(time) {
            return doorAction("-50%", "100%", time)
        }

        function shutDoor(time) {
            return doorAction("0%", "50%", time)
        }

        function talkFlower() {
            var defer = $.Deferred();
            boyObj.talkFlower();
            setTimeout(function() {
                defer.resolve()
            }, confi.setTime.waitFlower);
            return defer
        }
        var lamp = {
            elem: $(".b_background"),
            bright: function() {
                this.elem.addClass("lamp-bright")
            },
            dark: function() {
                this.elem.removeClass("lamp-bright")
            }
        };
        var waitOpen = openDoor(confi.setTime.openDoorTime);
        waitOpen.then(function() {
            lamp.bright();
            return boyObj.toShop($door, confi.setTime.walkToShop)
        }).then(function() {
            return talkFlower()
        }).then(function() {
            return boyObj.outShop(confi.setTime.walkOutShop)
        }).then(function() {
            shutDoor(confi.setTime.shutDoorTime);
            lamp.dark();
            defer.resolve()
        });
        return defer
    };

    function snowflake() {
        console.log(123);
        var $flakeContainer = $("#snowflake");

        function getImagesName() {
            return confi.snowflakeURl[[Math.floor(Math.random() * 6)]]
        }

        function createSnowBox() {
            var url = getImagesName();
            return $('<div class="snowbox" />').css({
                "width": 41,
                "height": 41,
                "position": "absolute",
                "backgroundSize": "cover",
                "zIndex": 100000,
                "top": "-41px",
                "backgroundImage": "url(" + url + ")"
            }).addClass("snowRoll")
        }
        setInterval(function() {
            var startPositionLeft = Math.random() * visualWidth - 100;
            var startOpacity = 1;
            var endPositionTop = visualHeight - 40;
            var endPositionLeft = startPositionLeft - 100 + Math.random() * 500;
            var duration = visualHeight * 10 + Math.random() * 5000;
            var randomStart = Math.random();
            var randomStart = randomStart < 0.5 ? startOpacity : randomStart;
            var $flake = createSnowBox();
            $flake.css({
                left: startPositionLeft,
                opacity: randomStart
            });
            $flakeContainer.append($flake);
            $flake.transition({
                top: endPositionTop,
                left: endPositionLeft,
                opacity: 0.7
            }, duration, "ease-out", function() {
                $(this).remove()
            })
        }, 200)
    }

    // function Html5Audio(url, loop) {
    //     var audio = new Audio(url);
    //     audio.autoplay = true;
    //     audio.loop = loop || false;
    //     audio.play();
    //     return {
    //         end: function(callback) {
    //             audio.addEventListener("ended", function() {
    //                 callback()
    //             }, false)
    //         }
    //     }
    // }
};
$(function() {
    songjum()
});

function Swipe(container, options) {
    var element = container.find(":first");
    var swipe = {};
    var slides = element.find(">");
    var width = container.width();
    var height = container.height();
    element.css({
        width: (slides.length * width) + "px",
        height: height + "px"
    });
    $.each(slides, function(index) {
        var slide = slides.eq[index];
        slides.eq(index).css({
            width: width + "px",
            height: height + "px"
        })
    });
    var isComplete = false;
    var timer;
    var callbacks = {};
    container[0].addEventListener("transitionend", function() {
        isComplete = true
    }, false);

    function monitorOffet(element) {
        timer = setTimeout(function() {
            if (isComplete) {
                clearInterval(timer);
                return
            }
            callbacks.move(element.offset().left);
            monitorOffet(element)
        }, 500)
    }
    swipe.watch = function(eventName, callback) {
        callbacks[eventName] = callback
    };
    swipe.scrollTo = function(x, speed) {
        element.css({
            "transition-timing-function": "linear",
            "transition-duration": speed + "ms",
            "transform": "translate3d(-" + x + "px,0px,0px)"
        });
        return this
    };
    return swipe
}