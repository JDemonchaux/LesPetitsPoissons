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
var nbFish = 20;
var fishes;
var lineOfSight;
var food;
var foodGroup;
var cursors;
var currentSpeed = 0;
var socket;
var line;
var output = [];

function connect() {
    socket = io("http://192.168.0.14:5000/socket.io");
    socket.emit("canal a", "1");
    socket.on('canal a', function (msg) {
        var input = msg.split(";");
        input[0] = parseInt(input[0]);
        input[1] = parseInt(input[1]);
        input[2] = parseInt(input[2]);

        cursors.up.isDown = input[0] == 1;
        cursors.left.isDown = input[1] == 1;
        cursors.right.isDown = input[2] == 1;

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
    GAME.load.image('lineOfSight', 'assets/images/fishes/lapetitevue.png');


}


function create() {
    GAME.physics.startSystem(Phaser.Physics.ARCADE);
    GAME.add.image(0, 0, 'background');

    map = GAME.add.tilemap();
    layer = map.createBlankLayer('Layer 1', 40, 30, 32, 32);
    layer.debug = true;

    GAME.stage.disableVisibilityChange = true;

    fishes = GAME.add.physicsGroup();
    for (var i = 0; i < nbFish; i++) {
        var x = GAME.world.randomX;
        var y = GAME.world.randomY;
        fish = fishes.create(x, y, "fish1");
        lineOfSight = GAME.add.sprite(x, y, "lineOfSight");
        GAME.physics.arcade.enable(fish);
        GAME.physics.arcade.enable(lineOfSight);
        fish.body.immovable = false;
        lineOfSight.body.immovable = false;
        fish.lineOfSight = lineOfSight;
    }
    ////add the fucking god damn fish
    //
    //    var x = GAME.world.centerX;
    //    var y = GAME.world.centerY;
    //    //fish = GAME.add.sprite(x, y, "fish1");
    //    fish = fishes.create(x, y, "fish1");
    //    lineOfSight = GAME.add.sprite(x, y, "lineOfSight");
    //    GAME.physics.arcade.enable(fish);
    //    GAME.physics.arcade.enable(lineOfSight);
    //
    //    //fish.body.collideWorldBounds = true;
    //    fish.body.immovable = false;
    //    fish.lineOfSight = lineOfSight;
    //    // Detect the wall collision
    //    //lineOfSight.checkWorldBounds = true;
    //    //lineOfSight.events.onOutOfBounds.add(detectWallCollision, this);


    // Groupe pour la nourriture
    foodGroup = GAME.add.physicsGroup();

    // Add the god damn food
    addFood();

    cursors = GAME.input.keyboard.createCursorKeys();

    // Brain the fish
    connect();
    socket.emit("canal score", "0");


    GAME.time.events.loop(5000, addFood, this);

}


function update() {
    GAME.physics.arcade.collide(fish, foodGroup, fishCollisionHandler, processHandler, this);
    //GAME.physics.arcade.collide(lineOfSight, foodGroup, lineCollisionHandler, processHandler, this);


    for (var i = 0; i < foodGroup.children.length; i++) {
        for (var j = 0; j < fishes.children.length; j++) {
            var boundsLine = fishes.children[j].lineOfSight.getBounds();
            var boundsFood = foodGroup.children[i].getBounds();
            var bool = Phaser.Rectangle.intersects(boundsLine, boundsFood);
            //console.log(bool);
            if (bool) {
                output[0] = "1";
                break;
            } else {
                output[0] = "0";
            }

            socket.emit("canal a", buildOuput(output));
        }

    }


    for (var k = 0; k < fishes.children.length; k++) {
        if (cursors.left.isDown) {
            fishes.children[k].angle -= 4;
            fishes.children[k].lineOfSight.angle -= 4;
        }
        else if (cursors.right.isDown) {
            fishes.children[k].angle += 4;
            fishes.children[k].lineOfSight.angle += 4;
        }

        if (cursors.up.isDown) {
            currentSpeed = 300;
        }
        else {
            if (currentSpeed > 0) {
                currentSpeed -= 4;
            }
        }

        if (fishes.children[k].x >= GAME.world._width) {
            fishes.children[k].x = 0;
            fishes.children[k].y = GAME.world._height - fishes.children[k].y;
        } else if (fishes.children[k].x <= 0) {
            fishes.children[k].x = GAME.world._width;
            fishes.children[k].y = GAME.world.height - fishes.children[k].y;
        } else if (fishes.children[k].y >= GAME.world._height) {
            fishes.children[k].y = 0;
            fishes.children[k].x = GAME.world._width - fishes.children[k].x;
        } else if (fishes.children[k].y <= 0) {
            fishes.children[k].y = GAME.world._height;
            fishes.children[k].x = GAME.world._width - fishes.children[k].x;
        }

        if (currentSpeed > 0) {
            GAME.physics.arcade.velocityFromRotation(fishes.children[k].rotation, currentSpeed, fishes.children[k].body.velocity);
            GAME.physics.arcade.velocityFromRotation(fishes.children[k].lineOfSight.rotation, currentSpeed, fishes.children[k].lineOfSight.body.velocity);
            fishes.children[k].lineOfSight.x = fishes.children[k].x;
            fishes.children[k].lineOfSight.y = fishes.children[k].y;
        }


    }


    // Clear the line before redraw
    //bitmap.context.clearRect(0, 0, this.game.width, this.game.height);
    //
    //for (i = 0; i < foodGroup.children.length; i++) {
    //    var ray = new Phaser.Line(fish.x, fish.y, foodGroup.children[i].world.x, foodGroup.children[i].world.y);
    //
    //    bitmap.context.beginPath();
    //    bitmap.context.moveTo(fish.x, fish.y);
    //    bitmap.context.lineTo(foodGroup.children[i].world.x + 8, foodGroup.children[i].world.y + 8);
    //    bitmap.context.stroke();
    //}
    //;
    //
    //bitmap.dirty = true;

}

function render() {
    for (var j = 0; j < fishes.children.length; j++) {
        //GAME.debug.body(fishes.children[j].lineOfSight);
        GAME.debug.body(fishes.children[j]);
        //GAME.debug.spriteInfo(fishes.children[j].lineOfSight, 32, 32);
    }

    for (var i = 0; i < foodGroup.children.length; i++) {
        GAME.debug.body(foodGroup.children[i]);
    }
}


function fishCollisionHandler(fish, food) {
    food.kill();
    foodGroup.remove(food);
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


function addFood() {
    for (i = 0; i < 1; i++) {
        var x = GAME.world.randomX;
        var y = GAME.world.randomY;

        var c = foodGroup.create(x, y, "food");
        c.scale.setTo(0.5, 0.5);
        //c.body.mass = -100;
    }
}

function buildOuput(output) {
    var out = output[0];
    for (var i = 1; i < output.length; i++) {
        out = out + ";" + output[i];
    }
    //console.log(out);
    return out;
}

document.querySelector("#addFood").addEventListener("click", addFood);