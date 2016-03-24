const GAME = new Phaser.Game(1280, 720, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

var socket, foods, fishes;
var currentSpeed = 300;
var cursors;
var foodMaterial = [];
var fishesMaterial = [];

function connect() {
    socket = io("http://192.168.0.14:5000/socket.io");
    socket.emit("canal a", "1");
    socket.on('canal a', function (msg) {
        var input = msg.split(";");
        input[0] = parseInt(input[0]);
        input[1] = parseInt(input[1]);
        input[2] = parseInt(input[2]);

    });

    socket.on('disconnect', function () {
    });
}

function preload() {
    GAME.load.image('background', 'assets/images/bg/aquarium.jpg');
    GAME.load.image('food', 'assets/images/food/food.png');
    GAME.load.image('fish1', 'assets/images/fishes/fish1.png');
    GAME.load.image('lineOfSight', 'assets/images/fishes/lapetitevue.png');


}


function create() {
    GAME.physics.startSystem(Phaser.Physics.P2JS);
    GAME.physics.p2.restitution = 0.9;
    GAME.add.image(0, 0, 'background');
    var worldMaterial = GAME.physics.p2.createMaterial('worldMaterial');
    console.log(GAME.physics.p2.defaultContactMaterial);
    GAME.stage.disableVisibilityChange = true;
    GAME.physics.p2.inertia = false;
    // Add the food
    foods = GAME.add.physicsGroup(Phaser.Physics.P2JS);
    addFood(20);

    // Add the fishes
    fishes = GAME.add.group();
    for (var i = 0; i < 1; i++) {
        var x = GAME.world.randomX;
        var y = GAME.world.randomY;
        var fish = fishes.create(x, y, "fish1");

        // fishesMaterial.push(GAME.physics.p2.createMaterial('spriteMaterial', fish.body));


        GAME.physics.p2.enable(fish);
        fish.body.immovable = false;

        // fish.body.inertia = -1;
        // fish.body.mass = 1;
        // fish.body.friction = 10;
        // fish.body.restitution = 0;
        //
        // fish.body.setZeroVelocity();
        // fish.body.setZeroForce();

        fish.body.onBeginContact.add(collideFish, this);
    }


    cursors = GAME.input.keyboard.createCursorKeys();

    // Brain the fish
    connect();
    socket.emit("canal score", "0");


    GAME.time.events.loop(5000, addFood, this);

}

function collideFish(body, a, b, c, d) {
    if (body) {
        body.sprite.kill();
    }
}

function update() {
    for (var i = 0; i < fishes.children.length; i++) {
        if (cursors.left.isDown) {
            fishes.children[i].body.angle -= 4;
        }
        else if (cursors.right.isDown) {
            fishes.children[i].body.angle += 4;
        }

        if (cursors.up.isDown) {
            // fishes.children[i].body.moveForward(300);
            fishes.children[i].body.thrust(currentSpeed);
        }
        else if (cursors.down.isDown) {
            // fishes.children[i].body.reverse(currentSpeed);
            // if (currentSpeed > 0) {
            //     currentSpeed -= 4;
            // }
        }
        // GAME.physics.arcade.velocityFromRotation(fishes.children[i].rotation, currentSpeed, fishes.children[i].body.angularVelocity);

    }
}


function render() {
    for (var j = 0; j < fishes.children.length; j++) {
        //GAME.debug.body(fishes.children[j].lineOfSight);
        GAME.debug.body(fishes.children[j]);
        //GAME.debug.spriteInfo(fishes.children[j].lineOfSight, 32, 32);
    }

    for (var i = 0; i < foods.children.length; i++) {
        //GAME.debug.body(foods.children[i]);
    }
}


function fishCollisionHandler(fish, food) {
    food.kill();
    foods.remove(food);
    socket.emit("canal score", "1");
    return true;
}

function lineCollisionHandler(line, food) {
    return true;
}

function foodCollisionHandler(line, food) {
    return true;
}

function detectWallCollision(fish) {
    return true;
}

function processHandler(fish, food) {
    return true;
}

function addFood(nbFood) {
    for (i = 0; i < nbFood; i++) {
        var x = GAME.world.randomX;
        var y = GAME.world.randomY;

        var c = foods.create(x, y, "food");
        GAME.physics.p2.enable(c);
        c.scale.setTo(0.5, 0.5);
        // c.body.kinematic = true;
        c.body.restitution = 0;
        var f = GAME.physics.p2.createMaterial('spriteMaterial', c.body);
        foodMaterial.push(f);
    }
}
document.querySelector("#addFood").addEventListener("click", addFood(document.querySelector("#nbFood")));