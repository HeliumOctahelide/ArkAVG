"use strict";
/*
 * @Author: dx3906
 * @Date: 2020-10-28 19:32:18
 * @LastEditors: dx3906
 * @LastEditTime: 2020-12-10 22:54:59
 */

// 载入资源用到的函数

function logging(text) {
    let date = new Date(Date.now());
    console.log(`[${date.toLocaleTimeString("it-IT")}.${date.getMilliseconds()}] ${text}`);
}

function logging_text(text) {
    let date = new Date(Date.now());
    console.log(`[${date.toLocaleTimeString("it-IT")}.${date.getMilliseconds()}] ${text}`);
}

// 这个函数来自https://www.runoob.com/w3cnote/js-get-url-param.html
function getQueryVariable(variable) {
    let query = window.location.search.substring(1);
    let vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

// 尝试修复鹰角丈育程序员的笔误
function fixInputMistakes(text) {
    let correctionList = {
        fatetime: 'fadetime',
        fedetime: 'fadetime',
        fadeitme: 'fadetime',
        fadetiem: 'fadetime',
        "blo=": 'block=',
        blok: 'block',
        "xT=": 'xTo=',
        "yT=": 'yTo=',
        xTO: 'xTo',
        yTO: 'yTo',
        cvoerall: "coverall", // 我不能确认这是不是鹰角程序员想要的效果但是就这样吧

    };
    for (let key of Object.keys(correctionList)) {
        text = text.replaceAll(key, correctionList[key]);
    }
    return text;
}

// 格式化剧情文本中传入的参数
function readArgs(args) {
    if (!args) {
        logging("blank...");
        return "{}";
    }
    return '{"' + fixInputMistakes(args).replace(/\=/g, "\":").replace(/,\s*/g, ", \"") + '}';
}

// 从音频名获取音频的文件名
function getAudioFileName(file) { // 为这里添加一个catch捕获错误，鹰角程序员天天写错字
    logging(file);
    if (file[0] === '$') {
        return 'audio/' + storyVariables[file.substring(1)].toLowerCase() + '.mp3';
    } else {
        return 'audio/' + file.toLowerCase() + '.mp3';
    }
}

// 同一函数中可能有多个参数起同样作用，此时按照次序将它们取出
function getArgsFrom(x) {
    for (let arg of arguments) {
        if (arg != undefined) {
            return arg;
        }
    }
    return undefined;
}

function argIsDefined(arg) {
    return arg === undefined ? false : true;
}

function intWidthOf(div) {
    return parseInt(div.css("width"));
}

function intHeightOf(div) {
    return parseInt(div.css("height"));
}

function naturalWidthOf(div) {
    return parseInt(div.get(0).naturalWidth);
}

function naturalHeightOf(div) {
    return parseInt(div.get(0).naturalHeight);
}

// 从人物名获取立绘的文件名
function getCharFileName(avg_name) { // 同上
    //logging(avg_name);
    if (avg_name.indexOf("#") === -1) {
        return "graphics/characters/" + avgList[avg_name.toLowerCase()]['array'][0]['file'];
    } else {
        return "graphics/characters/" + avgList[avg_name.toLowerCase().split("#")[0]]['array'][parseInt(avg_name.split('#')[1]) - 1]['file'];
    }
}

// 获取本段文本中出现的资源，预先加载
function getResFileNameFromText(text) {
    function unique(arr) {
        return Array.from(new Set(arr))
    }
    let imgList = [];
    let voiList = [];
    text.shift(); // 第一个行是文件头，没有用
    for (let line of text) {
        if (line.search(RegExp('Character', 'i')) != -1) { // 读取立绘
            if (line.match(/name="(.*?)"/i)) {
                //charList.push(line.match(/name="(.*?)"/i)[1]);
                imgList.push(getCharFileName(line.match(/name="(.*?)"/i)[1]))
            }
            if (line.match(/name2="(.*?)"/i)) {
                //charList.push(line.match(/name2="(.*?)"/i)[1]);
                imgList.push(getCharFileName(line.match(/name2="(.*?)"/i)[1]))
            }
        } else if (line.search(RegExp('PlayMusic', 'i')) != -1) { // 读取音乐
            if (line.match(/intro="(.*?)"/i)) {
                //musicList.push(line.match(/intro="(.*?)"/i)[1]);
                voiList.push(getAudioFileName(line.match(/intro="(.*?)"/i)[1]))
            }
            if (line.match(/key="(.*?)"/i)) {
                //musicList.push(line.match(/key="(.*?)"/i)[1]);
                voiList.push(getAudioFileName(line.match(/key="(.*?)"/i)[1]))
            }
        } else if (line.search(RegExp('PlaySound', 'i')) != -1) { // 读取音效
            if (line.match(/intro="(.*?)"/i)) {
                //soundList.push(line.match(/intro="(.*?)"/i)[1]);
                voiList.push(getAudioFileName(line.match(/intro="(.*?)"/i)[1]))
            }
            if (line.match(/key="(.*?)"/i)) {
                //soundList.push(line.match(/key="(.*?)"/i)[1]);
                voiList.push(getAudioFileName(line.match(/key="(.*?)"/i)[1]))
            }
        } else if (line.search(RegExp('\\[Image', 'i')) != -1) { // 读取图片
            if (line.match(/image="(.*?)"/i)) {
                imgList.push(`graphics/images/${line.match(/image="(.*?)"/i)[1]}.png`);
            }
        } else if (line.search(RegExp('Background', 'i')) != -1) { // 读取背景
            if (line.match(/image="(.*?)"/i)) {
                imgList.push(`graphics/backgrounds/${line.match(/image="(.*?)"/i)[1]}.png`);
            }
        } else if (line.search(RegExp('showitem', 'i')) != -1) { // 读取物品
            if (line.match(/image="(.*?)"/i)) {
                imgList.push(`graphics/items/${line.match(/image="(.*?)"/i)[1]}.png`);
            }
        }
    }
    resAmount = unique(imgList).length + unique(voiList).length;
    return {
        img: unique(imgList),
        voi: unique(voiList)
    }
}

// 将所有动画效果都放在一个虚拟div的动画队列中，统一操作
function animating(block, duration, foo) {
    if (!animateChain) {
        animateChain = $("#origin_point");
    }
    if (block) {
        logging("向动画队列中添加动画效果 时长：" + duration);
        animateChain
            .queue((next) => {
                logging("开始执行动画");
                foo();
                next();
            })
            .delay(duration)
            .queue((next) => {
                logging("延迟完毕");
                next();
            })
    } else {
        logging("添加平行动画效果 时长：" + duration);
        animateChain
            .queue((next) => {
                logging("开始执行动画");
                foo();
                next();
            })
    }
}

function breakTextRolling() {
    typing.typeSpeed = 0.2; // 加速文本打字效果
}

// JavaScript没有命名参数（即Python和C#中那样foo(paras=value)形式的写法，参数完全按照传入的顺序被赋值。
// 解构是ES6中引入的实现命名参数的一种取巧办法，如下所示
// 不过传入参数还是要以字典的形式传入，不能像Python中那样写
function background({ // 处理背景；背景和图片的处理逻辑应该是一样的
    image = '',
    block = false, // 这个block应当是指阻塞其他动画效果
    screenadapt = false, // screenadapt的coverall属性用于将图片拉伸到整个屏幕，否则按原有尺寸显示
    ease = "linear", // 参见Image；虽然现在还没有但以后万一有了呢
    width,
    height,
    x = 0,
    y = 0,
    xScale, // 似乎与上面的width和height一个效果？
    yScale,
    fadetime = 0
} = {}) {
    // 初始化参数
    let div = $("#background");
    xScale = getArgsFrom(xScale, width);
    yScale = getArgsFrom(yScale, height);
    fadetime *= S_2_MS;
    ease = ease === "InOutCubic" ? "easeInOutCubic" : ease;

    animating(block, fadetime, () => {
        div.finish();
        if (image) { // 先加载图片
            div.attr("src", imgPool["graphics/backgrounds/" + image + ".png"].src);
        }
        let zoom;
        if (screenadapt === 'coverall') {
            zoom = FULL_HEIGHT / naturalHeightOf(div) > FULL_WIDTH / (div) ? FULL_HEIGHT / naturalHeightOf(div) : FULL_WIDTH / naturalWidthOf(div);
        } else {
            // zoom = 1.0;
            // background需要保证至少为满屏显示
            zoom = FULL_HEIGHT > naturalHeightOf(div) ? FULL_HEIGHT / naturalHeightOf(div) : 1;
        }
        width = zoom * naturalWidthOf(div);
        height = zoom * naturalHeightOf(div);
        if (xScale) {
            width = xScale * width;
        }
        if (yScale) {
            height = yScale * height;
        }
        div.css({
            left: x,
            top: -y, // 切记，鹰角的轮子中y轴向上为正，但HTML中y轴是向下为正
            width: width,
            height: height
        });
        if (image) {
            // 如果有图片需要被加载，则是fadeIn
            logging("淡入图片");
            div.fadeIn({
                duration: fadetime,
                easing: ease,
                queue: false,
                complete: () => {
                    logging("淡入完毕");
                }
            });
        } else if (div.attr("src")) {
            // 如果没有图片需要被加载且有图片已被加载，则是fadeOut
            logging("淡出图片");
            div.stop();
            div.fadeOut({
                duration: fadetime,
                easing: ease,
                queue: false,
                complete: () => {
                    logging("淡出完毕");
                    // 淡出则需要修改为空图片
                    div.attr("src", '');
                }
            });
        } else {
            // 如果都没有，那你是来干哈的
            logging("略过...");
            div.delay(fadetime);
        }
    });
    return true;
}

function backgroundtween({
    image = "",
    block = false,
    screenadapt = false,
    ease = 'linear',
    x, // x/y和xFrom/yFrom是一回事
    y,
    xFrom,
    yFrom,
    xTo,
    yTo,
    xScale, // 同上
    yScale,
    xScaleFrom,
    yScaleFrom,
    xScaleTo,
    yScaleTo,
    duration = 0
} = {}) {
    // 初始化参数
    let div = $("#background");
    xFrom = getArgsFrom(xFrom, x);
    xTo = getArgsFrom(xTo, x);
    yFrom = getArgsFrom(yFrom, y);
    yTo = getArgsFrom(yTo, y);
    xScaleFrom = getArgsFrom(xScaleFrom, xScale);
    xScaleTo = getArgsFrom(xScaleTo, xScale);
    yScaleFrom = getArgsFrom(yScaleFrom, yScale);
    yScaleTo = getArgsFrom(yScaleTo, yScale);
    duration *= S_2_MS;
    ease = ease === "InOutCubic" ? "easeInOutCubic" : ease;

    animating(block, duration, () => {
        div.finish();
        if (image) {
            div.attr("src", imgPool["graphics/backgrounds/" + image + ".png"].src);
        }
        let zoom;
        if (screenadapt === 'coverall') {
            zoom = FULL_HEIGHT / naturalHeightOf(div) > FULL_WIDTH / (div) ? FULL_HEIGHT / naturalHeightOf(div) : FULL_WIDTH / naturalWidthOf(div);
        } else {
            zoom = 1.0;
        }
        let width = zoom * naturalWidthOf(div);
        let height = zoom * naturalHeightOf(div);
        let widthTo = zoom * naturalWidthOf(div);
        let heightTo = zoom * naturalHeightOf(div);
        if (xScaleFrom) {
            width = xScaleFrom * width;
        }
        if (yScaleFrom) {
            height = yScaleFrom * height;
        }
        if (xScaleTo) {
            widthTo = xScaleTo * widthTo;
        }
        if (yScaleTo) {
            heightTo = yScaleTo * heightTo;
        }
        div.css({
            left: x,
            top: -y, // 切记，鹰角的轮子中y轴向上为正，但HTML中y轴是向下为正
            width: width,
            height: height
        });
        div.animate({
            left: xTo,
            top: -yTo,
            width: widthTo,
            height: heightTo
        }, {
            duration: duration,
            easing: ease,
            queue: false,
            complete: () => {
                logging("图片变换完毕！");
            }
        })
    })
    return true;
}

function image_func({
    image = false,
    fadetime = 0,
    block = false,
    screenadapt = false,
    tiled = false, // 似乎是平铺的含义。出现这个属性的几张图片都是1280*720的满尺寸图片，看不太出区别；这里暂时空着
    ease = "linear", // 补间动画的过渡效果，默认为InOutCubic使用立方贝塞尔曲线式的补间动画；在动画函数中设置easing属性
    x = 0,
    y = 0,
    xFrom, // x和xFrom大概是一个东西
    yFrom,
    xTo, // ???
    yTo,
    width,
    height,
    xScale,
    yScale
} = {}) {
    // 初始化参数
    let div = $("#img");
    logging(xScale, width);
    x = getArgsFrom(x, xFrom, xTo);
    y = getArgsFrom(y, yFrom, yTo);
    xScale = getArgsFrom(xScale, width);
    yScale = getArgsFrom(yScale, height);
    fadetime *= S_2_MS;
    ease = ease === "InOutCubic" ? "easeInOutCubic" : ease;


    animating(block, fadetime, () => {
        div.finish();
        if (image) {
            // 如果有图片需要被加载，则是fadeIn
            logging("淡入图片");
            div.fadeIn({
                duration: fadetime,
                easing: ease,
                queue: false,
                complete: () => {
                    logging("淡入完毕");
                }
            });
        } else if (div.attr("src")) {
            // 如果没有图片需要被加载且有图片已被加载，则是fadeOut
            logging("淡出图片");
            div.stop();
            div.fadeOut({
                duration: fadetime,
                easing: ease,
                queue: false,
                complete: () => {
                    logging("淡出完毕");
                    // 淡出则需要修改为空图片
                    div.attr("src", '');
                }
            });
        } else {
            // 如果都没有，那你是来干哈的
            logging("略过...");
            div.delay(fadetime);
        }
        if (image) { // 先加载图片
            div.attr("src", imgPool["graphics/images/" + image + ".png"].src);
        }
        let zoom;
        if (screenadapt === 'coverall') {
            zoom = FULL_HEIGHT / naturalHeightOf(div) > FULL_WIDTH / (div) ? FULL_HEIGHT / naturalHeightOf(div) : FULL_WIDTH / naturalWidthOf(div);
        } else {
            zoom = 1.0;
        }
        width = zoom * naturalWidthOf(div);
        height = zoom * naturalHeightOf(div);
        if (xScale) {
            width = xScale * width;
        }
        if (yScale) {
            height = yScale * height;
        }
        div.css({
            left: x,
            top: -y, // 切记，鹰角的轮子中y轴向上为正，但HTML中y轴是向下为正
            width: width,
            height: height
        });
    });
    return true;
}

function imagetween({
    image = false,
    block = false,
    screenadapt = false,
    tiled = false,
    ease = "linear",
    x,
    y,
    xFrom,
    yFrom,
    xTo,
    yTo,
    xScale,
    yScale,
    xScaleFrom,
    yScaleFrom,
    xScaleTo,
    yScaleTo,
    duration
} = {}) {
    let div = $("#img");
    xFrom = getArgsFrom(xFrom, x);
    xTo = getArgsFrom(xTo, x);
    yFrom = getArgsFrom(yFrom, y);
    yTo = getArgsFrom(yTo, y);
    xScaleFrom = getArgsFrom(xScaleFrom, xScale);
    xScaleTo = getArgsFrom(xScaleTo, xScale);
    yScaleFrom = getArgsFrom(yScaleFrom, yScale);
    yScaleTo = getArgsFrom(yScaleTo, yScale);
    duration *= S_2_MS;
    ease = ease === "InOutCubic" ? "easeInOutCubic" : ease;


    animating(block, duration, () => {
        div.finish();
        if (image) {
            div.attr("src", imgPool["graphics/image/" + image + ".png"].src);
        }
        let zoom;
        if (screenadapt === 'coverall') {
            zoom = FULL_HEIGHT / naturalHeightOf(div) > FULL_WIDTH / (div) ? FULL_HEIGHT / naturalHeightOf(div) : FULL_WIDTH / naturalWidthOf(div);
        } else {
            zoom = 1.0;
        }
        let width = zoom * naturalWidthOf(div);
        let height = zoom * naturalHeightOf(div);
        let widthTo = zoom * naturalWidthOf(div);
        let heightTo = zoom * naturalHeightOf(div);
        if (xScaleFrom) {
            width = xScaleFrom * width;
        }
        if (yScaleFrom) {
            height = yScaleFrom * height;
        }
        if (xScaleTo) {
            widthTo = xScaleTo * widthTo;
        }
        if (yScaleTo) {
            heightTo = yScaleTo * heightTo;
        }
        div.css({
            left: x,
            top: -y, // 切记，鹰角的轮子中y轴向上为正，但HTML中y轴是向下为正
            width: width,
            height: height
        });
        div.animate({
            left: xTo,
            top: -yTo,
            width: widthTo,
            height: heightTo
        }, {
            duration: duration,
            easing: ease,
            queue: false,
            complete: () => {
                logging("图片变换完毕！");
            }
        })
    })
    return true;
}

function blocker({
    block = false,
    fadetime = 0,
    ease = "linear",
    rfrom,
    gfrom,
    bfrom,
    afrom,
    initr, // 这个应该就是rFrom？也不像，因为rgb的范围是0到255，这里initr的取值都是2 // 不管了
    r,
    g,
    b,
    a
} = {}) {
    // 初始化参数
    let div = $("#block");
    rfrom = getArgsFrom(rfrom * 255, blockerColor.red);
    gfrom = getArgsFrom(gfrom * 255, blockerColor.green);
    bfrom = getArgsFrom(bfrom * 255, blockerColor.blue);
    afrom = getArgsFrom(afrom, blockerColor.alpha);
    r = getArgsFrom(r * 255, blockerColor.red);
    g = getArgsFrom(g * 255, blockerColor.green);
    b = getArgsFrom(b * 255, blockerColor.blue);
    a = getArgsFrom(a, blockerColor.alpha);
    fadetime *= S_2_MS;
    ease = ease === "InOutCubic" ? "easeInOutCubic" : ease;

    animating(block, fadetime, () => {
        div.finish();
        // 用CSS动画完成
        let blockColorFrom = $.Color({
            red: rfrom,
            green: gfrom,
            blue: bfrom
        });
        blockerColor = {
            red: r,
            green: g,
            blue: b
        };
        let targetColor = $.Color(blockerColor);
        div.animate({
            backgroundColor: targetColor,
            opacity: a
        }, {
            duration: fadetime,
            easing: ease,
            queue: false,
            complete: () => {
                logging("画面遮罩完毕！");
            }
        });
        div.css("backgroundColor", blockColorFrom);
        div.css("opacity", afrom);
    });
    return true;
}

function character({ //name取小写
    name = false,
    name2 = false,
    fadetime,
    ease = "linear", // 尽管没有用到但是还是写在这里以防万一
    focus,
    block = false
} = {}) {
    let duration = fadetime ? fadetime * S_2_MS : DEFAULT_FADEOUT_TIME;
    ease = ease === "InOutCubic" ? "easeInOutCubic" : ease;
    let div1 = $("#char1");
    let div2 = $("#char2");
    let sameChar = false;

    let char1 = name ? {
        name: name.toLowerCase().split("#")[0],
        file: imgPool[getCharFileName(name)].src,
        position: avgList[name.toLowerCase().split("#")[0]]['position'],
        size: avgList[name.toLowerCase().split("#")[0]]['size']
    } : false;
    let char2 = name2 ? {
        name: name2.toLowerCase().split("#")[0],
        file: imgPool[getCharFileName(name2)].src,
        position: avgList[name2.toLowerCase().split("#")[0]]['position'],
        size: avgList[name2.toLowerCase().split("#")[0]]['size']
    } : false;


    // 如果人物相同则跳过淡入淡出动画只是改变立绘，这一情形下fadetime和block应当被忽略
    logging(char1.name);
    logging(char2.name);
    if (char1.name === dialogCharacters.char1.name && char2.name === dialogCharacters.char2.name) {
        logging("切换立绘，跳过动画...");
        sameChar = true;
    }

    // 判断淡入淡出所用时间
    let fadeOutTime, fadeInTime;
    if (sameChar) {
        fadeOutTime = 0;
        fadeInTime = 0;
    } else {
        fadeOutTime = DEFAULT_FADEOUT_TIME;
        fadeInTime = duration;
    }

    // 判断淡入还是淡出
    // -1仅淡出，0淡入淡出，1仅淡入
    // fadetime参数仅在取-1时应用于淡出，否则淡出总是0.2s（默认时间）
    let fadeInOrOut;
    if (!name) {
        // 没有立绘1的情况下就是淡出；这一情况下如果没有任何参数那就fadetime=0
        fadeInOrOut = -1;
        logging("仅淡出立绘");
        if (!fadetime) {
            fadeInTime = 0;
        }
    } else if (!dialogCharacters.char1) {
        // 没有原立绘1的情况下就是仅淡入
        fadeInOrOut = 1;
        logging("仅淡入立绘");
    } else {
        // 否则是同时淡出和淡入（切换立绘）
        fadeInOrOut = 0;
        logging("淡出+淡入立绘");
    }

    // 淡出人物
    // fadetime参数仅在取-1时应用于淡出，否则淡出总是0.2s（默认时间）
    if (fadeInOrOut < 0) {
        // 仅淡出
        animating(block, fadeInTime, () => {
            div1.finish();
            div2.finish();
            logging("淡出人物");
            div1.fadeOut({
                duration: fadeInTime, // 这里其实是淡出，但使用了淡入的变量名
                easing: ease,
                queue: false,
                complete: () => {
                    logging("淡出完毕");
                    // 淡出则需要修改为空图片
                    div1.attr("src", '');
                    div1.css({
                        width: 0,
                        height: 0
                    });
                }
            });
            div2.fadeOut({
                duration: fadeInTime,
                easing: ease,
                queue: false,
                complete: () => {
                    logging("淡出完毕");
                    // 淡出则需要修改为空图片
                    div2.attr("src", '');
                    div2.css({
                        width: 0,
                        height: 0
                    });
                }
            });
        });
    } else if (fadeInOrOut > 0) {
        animating(block, fadeInTime, () => {
            div1.finish();
            div2.finish();
            // 仅淡入
            logging("淡入人物");
            if (char2) {
                div1.fadeIn({
                    duration: fadeInTime,
                    easing: ease,
                    queue: false,
                    complete: () => {
                        logging("淡入完毕");
                    }
                });
                div2.fadeIn({
                    duration: fadeInTime,
                    easing: ease,
                    queue: false,
                    complete: () => {
                        logging("淡入完毕");
                    }
                });
                // 双目标的情况下挪动立绘位置
                div1.attr("src", char1.file);
                div1.css({
                    left: char1.position[0] - DOUBLE_CHAR_CORRECTION,
                    top: -char1.position[1] + 360,
                    width: char1.size[0],
                    height: char1.size[1]
                });
                div2.attr("src", char2.file);
                div2.css({
                    left: char2.position[0] + DOUBLE_CHAR_CORRECTION,
                    top: -char2.position[1] + 360,
                    width: char2.size[0],
                    height: char2.size[1]
                });

            } else {
                div1.fadeIn({
                    duration: fadeInTime,
                    easing: ease,
                    queue: false,
                    complete: () => {
                        logging("淡入完毕");
                    }
                });
                // 单目标
                div1.attr("src", char1.file);
                div1.css({
                    left: char1.position[0],
                    top: -char1.position[1] + 360,
                    width: char1.size[0],
                    height: char1.size[1]
                });
            }
            // 只有双目标的情况下会有focus，根据focus的不同对立绘添加css遮罩
            if (focus === 1) {
                div1.css("filter", "brightness(100%)");
                div2.css("filter", "brightness(33%)");
            } else if (focus === 2) {
                div1.css("filter", "brightness(33%)");
                div2.css("filter", "brightness(100%)");
            } else {
                div1.css("filter", "brightness(100%)");
                div2.css("filter", "brightness(100%)");
            }
        });
    } else {
        // 淡出+淡入
        animating(block, fadeOutTime + fadeInTime, () => {
            div1.finish();
            div2.finish();
            logging("淡出人物1");
            div1.fadeOut({
                duration: fadeOutTime,
                easing: ease,
                queue: false,
                complete: () => {
                    logging("淡出1完毕");
                    logging("淡入人物1");
                    div1.fadeIn({
                        duration: fadeInTime,
                        easing: ease,
                        queue: false,
                        complete: () => {
                            logging("淡入1完毕");
                        }
                    });
                    if (focus === 2) {
                        div1.css("filter", "brightness(33%)");
                    } else {
                        div1.css("filter", "brightness(100%)");
                    }
                    div1.attr("src", char1.file);
                    div1.css({
                        left: char1.position[0] - (char2 ? DOUBLE_CHAR_CORRECTION : 0),
                        top: -char1.position[1] + 360,
                        width: char1.size[0],
                        height: char1.size[1]
                    });
                }
            });
            if (char2) {
                logging("淡出人物2");
                // 已经被fadeOut的div不会再花费时间执行fadeOut，这会造成单立绘跳转双立绘时的加载不同步。所以先将div显示出来再淡出
                if (!dialogCharacters.char2) {
                    div2.show();
                }
                div2.fadeOut({
                    duration: fadeOutTime,
                    easing: ease,
                    queue: false,
                    complete: () => {
                        logging("淡出2完毕");
                        logging("淡入人物2");
                        div2.fadeIn({
                            duration: fadeInTime,
                            easing: ease,
                            queue: false,
                            complete: () => {
                                logging("淡入2完毕");
                            }
                        });
                        if (focus === 1) {
                            div2.css("filter", "brightness(33%)");
                        } else {
                            div2.css("filter", "brightness(100%)");
                        }
                        div2.attr("src", char2.file);
                        div2.css({
                            left: char2.position[0] + DOUBLE_CHAR_CORRECTION,
                            top: -char2.position[1] + 360,
                            width: char2.size[0],
                            height: char2.size[1]
                        });
                    }
                });
            } else {
                div2.show(); // 已经被fadeOut的div不会再花费时间执行fadeOut，所以先将div显示出来再淡出
                div2.fadeOut({
                    duration: fadeOutTime,
                    easing: ease,
                    queue: false,
                    complete: () => {
                        logging("淡出2完毕");
                        // 淡出则需要修改为空图片
                        div2.attr("src", '');
                        div2.css({
                            width: 0,
                            height: 0
                        });
                    }
                });
            }
        })

    }
    dialogCharacters.char1 = char1;
    dialogCharacters.char2 = char2;
}

function charactercutin({
    widgetID,
    name,
    style = "cutin",
    fadestyle = "horiz_expand_center",
    fadetime = 0,
    offsetx = 0,
    offsety = 0,
    width = 200,
    block = false
} = {}) {
    fadetime *= S_2_MS;
    let div;
    if (widgetID === 1) {
        div = $("#charci1");
    } else if (widgetID === 2) {
        div = $("#charci2");
    }
    // CutIn的场合
    // 这个函数的大部分参数都没有变化，所以这里没有什么设置可选
    // 注意这里的图片是用原尺寸，没有像Character函数中那样缩小
    // 但是offsetx是不是相应缩小了还不知道，加入待办事项中
    animating(block, fadetime, () => {
        div.finish();
        if (name) {
            div.attr("src", imgPool[getCharFileName(name)].src);
            div.css({
                left: offsetx, // 是否需要乘以CHAR_ZOOMING
                top: -offsety,
                width: 0
            });
            div.show();
            div.animate({
                width: width
            }, {
                duration: fadetime,
                queue: false,
                complete: () => {
                    logging("cutin完毕！");
                }
            });
        } else {
            // 收起的场合...?
            div.animate({
                width: 0
            }, {
                duration: fadetime,
                queue: false,
                complete: () => {
                    logging("cutin已收起...");
                    div.attr("src", "");
                    div.hide();
                }
            });
        }
    });
    return true;
}

function cameraeffect({
    effect,
    fadetime,
    keep,
    initamount,
    amount,
    block = false
} = {}) {
    // 目前effect只有grayscale这一个种类，看起来和CSS的filter滤镜是一致的。那就先直接写进去
    // jQuery不支持对effect属性添加动画，使用step实现
    // loadingdiv在加载完成之后就失去作用且被隐藏，我们对它的width属性进行变换，在每个step中修改playground的相应属性
    // 我也不想这样 是jQurey逼我的
    fadetime *= S_2_MS;
    let div = $("#playground");
    let dummyDiv = $("#loadingdiv");
    if (effect) {
        animating(block, fadetime, () => {
            div.finish();
            dummyDiv.finish();
            if (initamount != undefined) {
                div.css("filter", `${effect}(${initamount})`);
                dummyDiv.css("width", initamount);
            }
            logging(div.css("width"));
            logging("开始添加相机滤镜...");
            dummyDiv.animate({
                width: amount
            }, {
                duration: fadetime,
                queue: false,
                step: () => {
                    logging(div.css('width'));
                    div.css("filter", `${effect}(${parseFloat(dummyDiv.css("width"))})`);
                },
                complete: () => {
                    logging("相机滤镜添加完毕...");
                    div.css("filter", `${effect}(${parseFloat(dummyDiv.css("width"))})`);
                    if (!keep) {
                        // 如果keep则保留，否则回到原本效果
                        div.css("filter", `${effect}(0)`);
                    }
                }
            });
        });
    } else {
        console.log("CameraEffect的种类未知！");
    }
    return true;
}

function camerashake({
    duration,
    xstrength,
    ystrength,
    vibrato, // 不知道用处的参数
    randomness, // 不知道用处的参数
    fadetime,
    fadeout = false, // 不知道用处的参数
    block = false
} = {}) {
    // 妈的 参数都不知道啥意思 咋写嘛
    // 大胆推测是这样的
    // vibrato代表初始角度
    // randomness代表角度的偏移量
    // 然后得到一个角度theta
    // 画一个椭圆，xstrength和ystrength分别为椭圆的半长轴和半短轴
    // 椭圆上角度为theta的点的坐标就是震动的坐标
    // 竟然好像很合理的样子
    // ......
    // ...
    // 测试效果意外地不错
    // 那就这样了
    duration *= S_2_MS;
    fadetime = fadetime ? fadetime * S_2_MS : duration;
    let repeat = parseInt(fadetime / duration);
    let div = $("#playground");
    let shakex;
    let shakey;
    animating(block, fadetime, () => {
        div.finish();
        for (let i = 0; i < repeat; i++) {
            let theta = (vibrato + (Math.random() * randomness * 2 - randomness)) / 360 * 2 * Math.PI;
            // 椭圆参数方程；感谢你，鹰角，让我回想起了美好的高中时光
            shakex = xstrength * Math.cos(theta);
            shakey = ystrength * Math.sin(theta);
            div.animate({
                left: shakex,
                top: -shakey
            }, {
                duration: duration / 2,
                ease: "linear",
                queue: true, // 只有这一个地方的queue设置为true
                complete: () => {
                    logging("shaking...");
                }
            });
            div.animate({
                left: 0,
                top: 0
            }, {
                duration: duration / 2,
                ease: "linear",
                queue: true, // 只有这一个地方的queue设置为true
                complete: () => {
                    logging("shaking...");
                }
            });
        }
    });
    return true;
}

function delay({
    time
} = {}) {
    time *= S_2_MS;
    animating(true, time, () => {
        console.log("Delaying...");
    })
}

function showitem({
    image
} = {}) {
    // item类就只有一个参数，其他都是默认值
    // 看起来showitem的block默认是true，但是hideitem却是false
    // 很迷
    // 妈的 hideitem也设成true得了
    let div = $("#item");
    animating(true, 500, () => {
        div.finish();
        div.attr("src", imgPool[image].src);
        logging("显示物品...");
        div.fadeIn({
            duration: 500,
            queue: false,
            complete: () => {
                logging("显示物品完毕...");
            }
        })
    })
}

function hideitem({
    fadetime = 0,
    block = true
} = {}) {
    // 见上面的注释
    fadetime *= S_2_MS;
    let div = $("#item");
    animating(block, fadetime, () => {
        div.finish();
        logging("收起物品...");
        div.fadeOut({
            duration: fadetime,
            queue: false,
            complete: () => {
                logging("收起完毕...");
                div.attr("src", "");
            }
        })
    })
}

function dialog({
    name,
    text
} = {}) {
    animating(true, 0, () => {
        if (!text) {
            // 清除文本框
            $("#textbox").hide();
            $("#text").text("");
            return true;
        } else {
            // 绘制文本
            $("#textbox").fadeIn({
                duration: 200
            });

            $("#textname").text(name);
            $("#text").text("");
            $("#playground")[0].onclick = breakTextRolling;
            text = [text.replace(/<color=(.*?)>/, '<span style="color:$1">').replace("</color>", "</span>").replace("{@nickname}", decodeURI(doctorName)), ];
            typing = new Typed('#text', {
                strings: text,
                typeSpeed: 20,
                showCursor: false,
                onComplete: () => {
                    logging("Type end..."); // 在这里解锁click函数
                    $("#playground")[0].onclick = clickme;
                    // click函数应当：在前序动画执行中(animationChian.queue存在时)被锁死，前序动画执行完毕，显示文本时提供文本加速效果，文本也显示完毕后执行下一段动画
                },
            });
        }
    });
}

function decision({
    options,
    values
} = {}) {
    function getOptionTop(i, o) {
        if (o === 1) {
            return -60;
        } else if (o === 2) {
            return (i - 0.5) * 60 - 60;
        } else if (o === 3) {
            return (i - 1) * 60 - 60;
        }
        return 0;
    }
    options = options.split(";");
    values = values.split(";");
    let div = $("#selectbox");
    animating(false, 0, () => {
        for (let i in options) {
            logging("添加选项...");
            div.append(`<div class="select" style="top: ${getOptionTop(i, options.length)}px;" onclick="choose(${values[i]})">${options[i]}</div>`);
        }
    });
}

function predicate({} = {}) {}

function choose(value) {
    logging("选择选项...");
    reference = value.toString();
    $(".select").remove();
    clickme();
}

function playmusic({
    intro,
    key,
    crossfade = 0,
    volume = 1.0
} = {}) {
    crossfade *= S_2_MS;
    let div = $("#music");
    let dummyDiv = $("#audioground");
    animating(false, crossfade, () => {
        logging("开始播放音乐...");
        div.attr("src", voiPool[getAudioFileName(intro)].src);
        div.attr("loop", false);
        div[0].play();
        div[0].addEventListener("ended", () => {
            logging("intro结束，开始循环...");
            div.attr("src", voiPool[getAudioFileName(key)].src);
            div[0].play();
            div.attr("loop", true);
        });
        // 同样使用傀儡div控制音量淡入淡出
        dummyDiv.css("height", 0);
        dummyDiv.animate({
            height: volume
        }, {
            duration: crossfade,
            queue: true,
            step: () => {
                div[0].volume = parseFloat(dummyDiv.css("height"));
            },
            complete: () => {
                div[0].volume = volume;
                dummyDiv.css("height", volume);
                logging("音乐淡入完毕...");
            }
        });
    });
    return true;
}

function stopmusic({
    time,
    fadetime
} = {}) {
    let div = $("#music");
    let dummyDiv = $("#audioground");
    time = getArgsFrom(time, fadetime);
    time *= S_2_MS;
    animating(false, time, () => {
        logging("开始停止音乐...");
        dummyDiv.animate({
            height: 0
        }, {
            duration: time,
            queue: false,
            step: () => {
                div[0].volume = parseFloat(dummyDiv.css("height"));
            },
            complete: () => {
                div[0].volume = 0;
                dummyDiv.css("height", 0);
                div[0].pause();
                div.attr("src", "");
                logging("音乐已停止...");
            }
        });
    });
    return true;
}

function playsound({
    key,
    volume = 1.0,
    channel,
    delay = 0,
    fadetime = 0,
    loop = false,
    block = false
} = {}) {
    let div;
    let dummyDiv = $("#audioground");
    delay *= S_2_MS;
    fadetime *= S_2_MS;
    if (channel) {
        $("#audioground").append(`<audio id="${channel}"></audio>`);
        div = $(`#${channel}`);
    } else {
        div = $("#sound");
    }
    animating(false, delay + fadetime, () => {
        logging("音效播放延迟");
        dummyDiv.animate({
            width: 0
        }, {
            duration: delay,
            queue: true
        });
        logging("开始播放音效...");
        div.attr("src", voiPool[getAudioFileName(key)].src);
        div.attr("loop", loop);
        div[0].volume = 0;
        div[0].play();
        dummyDiv.animate({
            width: volume
        }, {
            duration: fadetime,
            queue: true,
            step: () => {
                div[0].volume = parseFloat(dummyDiv.css("width"));
            },
            complete: () => {
                div[0].volume = volume;
                dummyDiv.css("width", volume);
                logging("音效淡入完毕...");
            }
        });
    });
}

function stopsound({
    channel,
    time,
    fadetime
} = {}) {
    // stopsound虽然也有key选项但实际没有意义
    let div;
    let dummyDiv = $("#audioground");
    if (channel) {
        $("#audioground").append(`<audio id="${channel}"></audio>`);
        div = $(`#${channel}`);
    } else {
        div = $("#sound");
    }
    time = getArgsFrom(time, fadetime);
    time *= S_2_MS;
    animating(false, time, () => {
        logging("开始停止音乐...");
        dummyDiv.animate({
            width: 0
        }, {
            duration: time,
            queue: false,
            step: () => {
                div[0].volume = parseFloat(dummyDiv.css("width"));
            },
            complete: () => {
                div[0].volume = 0;
                dummyDiv.css("width", 0);
                div[0].pause();
                div.attr("src", "");
                logging("音乐已停止...");
            }
        });
    });
    return true;
}



class Characters {
    constructor() {
        this.char1 = false;
        this.char2 = false;
    }
}

class Text {
    constructor(storyText) {
            this.text = storyText.split('\n');
        }
        * getLine() {
            let line;
            for (line of this.text) {
                logging(line);
                yield line;
            }
        }
}


// 全局变量
let txt;
let loadedRes = 0;
let resAmount;
let resLoaded = false;
let storyVariables;
let avgList;
let typing;
let animateChain;
let blockerColor = {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 1
};
let dialogCharacters = new Characters();
let getline;
let reference = '1';
let predicateJumping = false;

// 常量
const CODING_URL = "https://heliumjt.coding.net/p/heliumjt/d/arknights_avg_data_audio/git/raw/master/";
const CODING_GRAPHICS_URL = "https://heliumjt.coding.net/p/heliumjt/d/arknights_avg_data_graphics/git/raw/master/";
const GITHUB_URL = "";
const GITHUB_GRAPHICS_URL = '';
const LOCAL_URL = "http://127.0.0.1:5500/sarpadian_empire/sarpadian_empire/";
const S_2_MS = 1000;
const FULL_WIDTH = 1280;
const FULL_HEIGHT = 720;
const DOUBLE_CHAR_CORRECTION = 200;
const CHAR_ZOOMING = 1.0;
const DEFAULT_FADEOUT_TIME = 100;

//***********************************************//

// 获取URL的传参
let storyFile = getQueryVariable("story");
let assetsResFrom = getQueryVariable("res");
let doctorName = getQueryVariable("doctorname");
let storyName = decodeURI(getQueryVariable("storyname"));

$('title').html(storyName);

// 初始化资源和文本链接
let usingDir;
let usingGraphicsDir;
switch (assetsResFrom) {
    case "coding":
        usingDir = CODING_URL;
        usingGraphicsDir = CODING_GRAPHICS_URL;
        break;
    case "github":
        usingDir = GITHUB_URL;
        usingGraphicsDir = GITHUB_GRAPHICS_URL;
        break;
    case "local":
        usingDir = LOCAL_URL;
        usingGraphicsDir = LOCAL_URL;
        break;
    default:
        throw new Error("错误：不正确的素材源设置！");
}

let txtDir = LOCAL_URL + "data/stories/";
let scriptDir = LOCAL_URL + "data/scripts/";

let imgPool = {};
let voiPool = {};

// 读剧情文件
fetch(txtDir + storyFile + '.txt')
    .then(response => { // response是fetch方法定义的一个对象，通常在fetch的回调中获得
        return response.text(); // 这里传的结果作为下一个then函数中参数函数的参数（即text），但是注意response是一个流，因此只能被读取一次；
        // response.text()读取response的body，返回一个promise对象，并解析为文本格式；
    })
    .then(text => {
        // 前述的promise.then返回text作为箭头函数的参数，它此时已经是被解析的string了；
        txt = new Text(text);
        return fetch(scriptDir + 'story_variables.json');
        // 这里返回的是fetch函数的返回值，它也是promise
    })
    .then(response => {
        // promise.then返回response作为箭头函数的参数；
        return response.json();
        // 这里response.json返回promise
    })
    .then(json => {
        storyVariables = json;
        return fetch(scriptDir + 'avg_list.json');
    })
    .then(response => {
        // promise.then返回response作为箭头函数的参数；
        return response.json();
        // 这里response.json返回promise
    })
    .then(json => {
        avgList = json;
        // promise.then再返回json
        // 如果这个函数返回的值不是promise那就不能继续链式调用了？
        let readList = getResFileNameFromText(txt.text);
        //logging(readList);

        // 资源加载完成时调用
        function resHasLoaded(fileName) {
            loadedRes += 1;
            $("#loadingdiv").text(`资源加载中 ${loadedRes}/${resAmount}\n加载文件：${fileName}`);
            if (loadedRes >= resAmount && $("#loadingdiv").css('display') != 'none') {
                //$("#loadingdiv").css('display', 'none');
                logging("初始化完毕...");
                $("#loadingdiv").text("初始化完毕，点击任意位置开始回放剧情");
                //$(".picture").show();
                resLoaded = true;
            }
        }

        // 读取图片和声音资源     
        for (let i of readList.img) {
            let thisImg = new Image();
            imgPool[i] = thisImg;
            let fileName = i;
            try {
                imgPool[i].src = usingGraphicsDir + fileName;
            } catch (e) {
                logging(`警告：资源文件 ${fileName} 没有成功加载！`)
            }
            imgPool[i].onload = function () {
                logging(`加载资源：${fileName}；`);
                // 计时器减一
                resHasLoaded(fileName);
            };
        }
        for (let i of readList.voi) {
            let thisAudio = new Audio();
            voiPool[i] = thisAudio;
            let fileName = i;
            try {
                voiPool[i].src = usingDir + fileName;
            } catch (e) {
                logging(`警告：资源文件 ${fileName} 没有成功加载！`)
            }
            voiPool[i].oncanplaythrough = function () {
                logging(`加载资源：${fileName}；`);
                // 计时器减一
                resHasLoaded(fileName);
            };
        }
    })
    .then(() => {
        logging("读取剧情文件");
        getline = txt.getLine();
        // 2020.10.28进度
        // 下一步：读取资源文件
    })

// 读剧情文本并生成动画

function clickme() {
    let foo;
    let line;

    // 锁住点击事件
    $("#playground")[0].onclick = locked;

    // 读剧情文本
    while (1) {
        line = getline.next().value;
        if (predicateJumping) {
            if (RegExp(/references=\"(.*?)\"/).exec(line) && RegExp(/references=\"(.*?)\"/).exec(line)[1].indexOf(reference) >= 0) {
                // 分歧一致
                predicateJumping = false;
                continue;
            } else if (line.substring(0, 9).toLowerCase() != '[decision') {
                // 否则只放选项过去，其他的都拦住
                continue;
            }
        }
        if (!line) {
            logging("剧情结束...");
            return 0;
        }
        logging_text(line);
        //try {
        if (!line || line[0] === '/') {
            // 空行或是注释行
            continue;
        } else if (line[0] != '[') {
            // 纯文本行
            dialog({
                text: line
            });
            return true;
        } else if (line.substring(0, 5) === '[name') {
            // 带名字的文本行
            dialog({
                name: RegExp(/name\=\"(.*?)\"/i).exec(line)[1],
                text: line.substring(line.indexOf(']') + 1)
            });
            return true;
        } else if (RegExp(/references=\"(.*?)\"/).exec(line)) {
            // 分歧判断行
            if (RegExp(/references=\"(.*?)\"/).exec(line)[1].indexOf(reference) < 0) {
                // 分歧不一致，进入跳段模式
                predicateJumping = true;
            }
        } else {
            foo = RegExp(/\[(.*?)(?:\((.*?)\))?\]/i).exec(line);
            switch (foo[1].toLowerCase()) {
                case "image":
                    logging_text(`image_func(${readArgs(foo[2])})`);
                    image_func(JSON.parse(readArgs(foo[2])));
                    break;
                case "decision":
                    logging_text(`${foo[1].toLowerCase()}(${readArgs(foo[2])});`);
                    eval(`${foo[1].toLowerCase()}(${readArgs(foo[2])});`);
                    return true;
                default:
                    logging_text(`${foo[1].toLowerCase()}(${readArgs(foo[2])});`);
                    eval(`${foo[1].toLowerCase()}(${readArgs(foo[2])});`);
            }
        }
    }
    //catch (e) {
    //    logging(`以下语句执行时出错：\n${line}`);
    //}
}

function beginStory() {
    $("#loadingdiv").fadeOut({
        duration: 1000,
        complete: () => {
            $("#playground")[0].onclick = clickme;
            clickme();
        }
    });
}

function locked() {
    logging("Locked...");
}