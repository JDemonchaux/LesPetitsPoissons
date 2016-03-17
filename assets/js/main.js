const GAME = new Phaser.Game(1280, 720, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
});


var map;
var layer;
var bitmap;
var fish;
var lineOfSight;
var food;
var group;
var cursors;
var currentSpeed = 0;
var socket;
var line;

function connect() {
    socket = io("http://192.168.0.11:5000/socket.io");
    socket.emit("canal a", "1");
    socket.on('canal a', function (msg) {
        var input = msg.split(";");
        input[0] = parseInt(input[0]);
        input[1] = parseInt(input[1]);
        input[2] = parseInt(input[2]);

        cursors.up.isDown = input[0] == 1;
        cursors.left.isDown = input[1] == 1;
        cursors.right.isDown = input[2] == 1;

        console.log(input);

    });

    socket.on('disconnect', function () {
        cursors.up.isDown = false;
        cursors.left.isDown = false;
        cursors.right.isDown = false;
    })
}

function preload() {
    GAME.load.image('background', 'assets/images/bg/aquarium.jpg');
    GAME.load.image('food', 'assets/images/food/food.png');
    GAME.load.image('fish1', 'assets/images/fishes/fish1.png');
    GAME.load.image('lineOfSight', 'assets/images/fishes/lavue.png');


}


function create() {
    GAME.physics.startSystem(Phaser.Physics.ARCADE);
    GAME.add.image(0, 0, 'background');

    map = GAME.add.tilemap();
    layer = map.createBlankLayer('Layer 1', 40, 30, 32, 32);
    layer.debug = true;

    GAME.stage.disableVisibilityChange = true;

    //add the fucking god damn fish
    var x = GAME.world.centerX;
    var y = GAME.world.centerY;
    fish = GAME.add.sprite(x, y, "fish1");
    lineOfSight = GAME.add.sprite(x, y, "lineOfSight");
    GAME.physics.enable(fish);
    GAME.physics.enable(lineOfSight);


    fish.anchor.setTo(0.5, 0.5);
    lineOfSight.anchor.setTo(0, 0.5);

    fish.body.collideWorldBounds = true;
    fish.body.immovable = false;

    // Groupe pour la nourriture
    group = GAME.add.physicsGroup();

    // Add the god damn food
    addFood();

    cursors = GAME.input.keyboard.createCursorKeys();

    // Brain the fish
    connect();
    socket.emit("canal score", "0");


    GAME.time.events.loop(1000, addFood, this);
}


function update() {
    GAME.physics.arcade.collide(fish, group, fishCollisionHandler, processHandler, this);
    //GAME.physics.arcade.collide(lineOfSight, group, lineCollisionHandler, processHandler, this);

    var input = "0";
    for (var i = 0; i < group.children.length; i++) {
        var boundsLine = lineOfSight.getBounds();
        var boundsFood = group.children[i].getBounds();
        var bool = Phaser.Rectangle.intersects(boundsLine, boundsFood);
        if (bool) {
            input = "1";
            break;
        }
    }

    socket.emit("canal a", input);

    if (cursors.left.isDown) {
        fish.angle -= 4;
        lineOfSight.angle -= 4;
    }
    else if (cursors.right.isDown) {
        fish.angle += 4;
        lineOfSight.angle += 4;
    }

    if (cursors.up.isDown) {
        currentSpeed = 300;
    }
    else {
        if (currentSpeed > 0) {
            currentSpeed -= 4;
        }
    }

    if (currentSpeed > 0) {
        GAME.physics.arcade.velocityFromRotation(fish.rotation, currentSpeed, fish.body.velocity);
        GAME.physics.arcade.velocityFromRotation(lineOfSight.rotation, currentSpeed, lineOfSight.body.velocity);
        lineOfSight.x = fish.x;
        lineOfSight.y = fish.y;
    }


    // Clear the line before redraw
    //bitmap.context.clearRect(0, 0, this.game.width, this.game.height);
    //
    //for (i = 0; i < group.children.length; i++) {
    //    var ray = new Phaser.Line(fish.x, fish.y, group.children[i].world.x, group.children[i].world.y);
    //
    //    bitmap.context.beginPath();
    //    bitmap.context.moveTo(fish.x, fish.y);
    //    bitmap.context.lineTo(group.children[i].world.x + 8, group.children[i].world.y + 8);
    //    bitmap.context.stroke();
    //}
    //;
    //
    //bitmap.dirty = true;

}

function render() {

}


function fishCollisionHandler(fish, food) {
    food.kill();
    group.remove(food);
    socket.emit("canal score", "1");
    return true;
}

function lineCollisionHandler(line, food) {
    return true;
}

function foodCollisionHandler(line, food) {
    return true;
}

function processHandler(fish, food) {
    return true;
}


function addFood() {
    for (i = 0; i < 1; i++) {
        var x = GAME.world.randomX;
        var y = GAME.world.randomY;

        var c = group.create(x, y, "food");
        c.scale.setTo(0.5, 0.5);
        //c.body.mass = -100;
    }
}


function handleFish(input) {
    if (input[1] == 1.0) {
        console.log("on avance");
    }
}


document.querySelector("#addFood").addEventListener("click", addFood);