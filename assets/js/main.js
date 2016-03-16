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
var food;
var group;
var cursors;
var currentSpeed = 0;
var counter = 1;
var socket;
var line;

function preload() {
    GAME.load.image('background', 'assets/images/bg/aquarium.jpg');
    GAME.load.image('food', 'assets/images/food/food.png');
    GAME.load.image('fish1', 'assets/images/fishes/fish1.png');

    //socket = io("http://10.6.43.1:5000/socket.io");
    //socket.on('canal test', function (msg) {
    //    var input = msg.split(";");
    //    console.log(input);
    //});

}


function create() {
    GAME.physics.startSystem(Phaser.Physics.ARCADE);
    //GAME.add.image(0, 0, 'background');

    map = GAME.add.tilemap();
    layer = map.createBlankLayer('Layer 1', 40, 30, 32, 32);
    layer.debug = true;

    //add the fucking god damn fish
    fish = GAME.add.sprite(GAME.world.centerX, GAME.world.centerY, "fish1");
    GAME.physics.enable(fish);

    fish.anchor.set(0.5);

    fish.body.collideWorldBounds = true;
    fish.body.immovable = false;

    // Groupe pour la nourriture
    group = GAME.add.physicsGroup();

    // Add the god damn food
    addFood();


    // trash
    bitmap = GAME.add.bitmapData(this.game.width, this.game.height);
    bitmap.context.fillStyle = 'rgb(255, 255, 255)';
    bitmap.context.strokeStyle = 'rgb(255, 255, 255)';
    GAME.add.image(0, 0, bitmap);
    cursors = GAME.input.keyboard.createCursorKeys();
}


function update() {
    GAME.physics.arcade.collide(fish, group, collisionHandler, processHandler, this);

    if (cursors.left.isDown) {
        fish.angle -= 4;
    }
    else if (cursors.right.isDown) {
        fish.angle += 4;
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
    }


    // Clear the line before redraw
    bitmap.context.clearRect(0, 0, this.game.width, this.game.height);

    for (i = 0; i < group.children.length; i++) {
        var ray = new Phaser.Line(fish.x, fish.y, group.children[i].world.x, group.children[i].world.y);

        bitmap.context.beginPath();
        bitmap.context.moveTo(fish.x, fish.y);
        bitmap.context.lineTo(group.children[i].world.x + 8, group.children[i].world.y + 8);
        bitmap.context.stroke();
    }
    ;

    bitmap.dirty = true;

}

function render() {

}


function collisionHandler(fish, food) {
    food.kill();
    group.remove(food);
}

function processHandler(fish, food) {
    return true;
}


function addFood() {
    for (i = 0; i < 20; i++) {
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