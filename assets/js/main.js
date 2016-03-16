const GAME = new Phaser.Game(1280, 720, Phaser.AUTO, '', {preload: preload, create: create, update: update});

var fish;
var food = [];
var group;
var cursors;
var currentSpeed = 0;
var counter = 1;
var socket;

function preload() {
    GAME.load.image('background', 'assets/images/bg/aquarium.jpg');
    GAME.load.image('food', 'assets/images/food/food.png');
    GAME.load.image('fish1', 'assets/images/fishes/fish1.png');

    socket = io("http://10.6.43.1:5000/socket.io");
    socket.on('canal test', function (msg) {
        var input = msg.split(";");
        console.log(input);
    });

}


function create() {
    GAME.physics.startSystem(Phaser.Physics.ARCADE);
    GAME.add.image(0, 0, 'background');

    //add the fucking god damn fish
    fish = GAME.add.sprite(GAME.world.centerX, GAME.world.centerY, "fish1");
    GAME.physics.enable(fish);

    fish.anchor.set(0.5);

    fish.body.collideWorldBounds = true;
    fish.body.immovable = false;

    // Groupe pour le manger
    group = GAME.add.physicsGroup();

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


}


function collisionHandler(fish, food) {
    console.log("Vous avez mangé : " + counter + " nourriture");
    counter++;
    food.kill();
}

function processHandler(fish, food) {
    return true;
}


function addFood() {
    for (i = 0; i < 20; i++) {
        var c = group.create(GAME.world.randomX, GAME.world.randomY, "food");
        c.scale.setTo(0.5, 0.5);
        c.body.mass = -100;
    }
}

function handleFish(input) {
    if (input[1] == 1.0) {
        console.log("on avance");
    }
}


document.querySelector("#addFood").addEventListener("click", addFood);