var sw = 20,//一个方块的宽
    sh = 20,//一个方块的高
    tr = 30,//行
    td = 30;//列
var snake = null,//蛇的实例
    food = null,//食物的实例
    game = null;//游戏的实例

//方块构造函数，创造蛇身体 食物等等
function Square (x, y, classname) {
    //this.这些都是自己定义的属性
    this.x = x * sw;
    this.y = y * sh;
    this.class = classname;

    //viewContent是自己定义的属性,创建方块
    this.viewContent = document.createElement('div');//方块对应的DOM元素
    this.viewContent.className = this.class;
    //指定所添加方块的父级
    this.parent = document.getElementById('snakeWrap');
}
//给原型添加方法,这样所有new出来的实例都可以用
Square.prototype.creat = function () {//创建方块DOM,并添加
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';
    this.parent.appendChild(this.viewContent);
};

Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent);
};
//初始化蛇
function Snake(){
    this.head = null;//存蛇头的信息
    this.tail = null;//存蛇尾的信息
    this.pos = [];//二维数组，存储蛇身上的每一个方块的位置
    this.directionNum = {//对象，存储蛇走的方向
        left : {
            x : -1,
            y : 0,
            rotate : 180
        },
        right : {
            x : 1,
            y : 0,
            rotate : 0
        },
        up : {
            x : 0,
            y : -1,
            rotate : -90
        },
        down : {
            x : 0,
            y : 1,
            rotate : 90
        }
    }
}
//对蛇进行初始化
Snake.prototype.init = function () {
    //创建蛇头
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.creat();
    this.head = snakeHead; //更新蛇头的信息
    this.pos.push([2, 0]);//把蛇头的位置存起来

    //创建蛇的身体1
    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.creat();
    this.pos.push([1, 0]);//把蛇身1的位置存起来
    //创建蛇的身体2
    var snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.creat();
    this.tail = snakeBody2;//把蛇尾的信息存起来
    this.pos.push([0, 0]);//把蛇头的位置存起来
    //建立链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;
    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;
    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //给蛇添加一条属性，用来表示蛇的初始方向
    this.direction = this.directionNum.right;
};
//获取蛇头下一个位置对应的元素，根据元素做不同的事情
Snake.prototype.getNextPos = function () {
    var nextPos = [//蛇头要走的下一个点的坐标
        this.head.x/sw + this.direction.x,
        this.head.y/sh + this.direction.y
    ]
    //下个点是自己 gameover
    var selfCollied = false;
    this.pos.forEach(function(value){
        if(value[0] == nextPos[0] && value[1] == nextPos[1]){
            selfCollied = true;
        }
    });
    if(selfCollied){
        this.strategies.die.call(this);
        return;
    }

    //下个点是qiang
    if(nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td -1 || nextPos[1] > tr-1){
        this.strategies.die.call(this);
        return;
    }

    //下个点是food
    // this.strategies.eat.call(this);
    if(food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]){
        this.strategies.eat.call(this);
        return;
    }

    //下个点是空 可以走
    this.strategies.move.call(this);

};

//处理碰撞后要做的事情
Snake.prototype.strategies = {
    move : function(format){//这个参数用来决定要不要删除最后一个方块，有食物就不删，没有就删。
        //在旧蛇头的位置创建新身体
        var newBody = new Square(this.head.x/sw, this.head.y/sh,'snakeBody');
        //更新链表的关系
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;
        this.head.remove();//把旧蛇头删除
        newBody.creat();

        //创建一个新的蛇头
        var newHead = new Square(this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y, 'snakeHead');
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.viewContent.style.transform = 'rotate('+this.direction.rotate+'deg)';
        newHead.creat();

        //坐标分析
        this.pos.splice(0, 0, [this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y]);
        this.head = newHead;

        if(!format) {//如果format的值为false,表示需要删除
            this.tail.remove();
            this.tail = this.tail.last;
            this.pos.pop();
        }
    },
    eat : function(){
        this.strategies.move.call(this, true);
        createFood();
        game.score++;
    },
    die : function(){
        game.over();
    }
}



snake = new Snake();

//创建食物
function createFood() {
    var x = null;
    var y = null;

    var include = true; //循环跳出的条件，true表示食物的坐标在蛇身上，需要继续循环
    while(include){
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));
        snake.pos.forEach(function(value){
            if(x!= value[0] && y != value[1]){
                include = false;
            }
        });
    }

    //生成食物
    food = new Square(x, y, 'snakeFood');
    food.pos = [x, y];//存储一下生成食物的坐标，用于和蛇头要走的下一个点作对比

    var foodDom = document.querySelector('.snakeFood');
    if(foodDom){
        foodDom.style.left = x * sw +'px';
        foodDom.style.top = y * sh +'px';
    }else{
        food.creat();
    }
}

//创建游戏逻辑
function Game(){
    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function () {
    snake.init();
    createFood();
    document.onkeydown = function(ev) {
        if(ev.which == 37 && snake.direction != snake.directionNum.right){//按下左键时，蛇不能正在往右走
            snake.direction = snake.directionNum.left;
        }else if(ev.which == 38 && snake.direction != snake.directionNum.down){
            snake.direction = snake.directionNum.up;
        }else if(ev.which == 39 && snake.direction != snake.directionNum.left){
            snake.direction = snake.directionNum.right;
        }else if(ev.which == 40 && snake.direction != snake.directionNum.up){
            snake.direction = snake.directionNum.down;
        }
    }

    this.start();
}
Game.prototype.start = function () {
    this.timer = setInterval(function(){
        snake.getNextPos();
    }, 200);
}

Game.prototype.pause = function(){
    clearInterval(this.timer);
}

Game.prototype.over = function() {
    clearInterval(this.timer);
    alert('你的得分为：'+ this.score);

    var snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';
    snake = new Snake();
    game = new Game();
    var startBtnSwrap = document.querySelector('.btnStart');
    startBtnSwrap.style.display = 'block';
}

game = new Game();
var startBtn = document.querySelector('.btnStart button');
startBtn.onclick = function(){
    startBtn.parentNode.style.display = 'none';
    game.init();
};

//暂停元素
var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.btnPause button');
snakeWrap.onclick = function(){
    game.pause();

    pauseBtn.parentNode.style.display = 'block';
}

pauseBtn.onclick = function(){
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}

