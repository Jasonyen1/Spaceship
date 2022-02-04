// canvas
setFullscreen(); // set max width
setSize(getWidth(), getHeight() * 9/7); // set max height

var WIDTH = getWidth();
var HEIGHT = getHeight();
var AREA = WIDTH * HEIGHT;
var MIDX = WIDTH / 2;
var MIDY = HEIGHT / 2;

// spaceship
var spaceship;
var SPACESHIP_COLOR = new Color(250, 150, 0); // orange color

var body;
var BODY_WIDTH = 20;
var BODY_HEIGHT = 40;
var BODY_COLOR = new Color(100, 100, 100);

var top;
var TOP_WIDTH = 10;
var TOP_HEIGHT = 20;

var wings;
var WING_WIDTH = 50;
var WING_HEIGHT = 12;
var WING_COLOR = new Color(80, 80, 80);

var leftTip;
var rightTip;
var TIP_WIDTH = 5;
var TIP_HEIGHT = 30;
var TIP_COLOR = new Color(60, 60, 60);

var leftTipTop;
var rightTipTop;
var TIP_TOP_WIDTH = 2;
var TIP_TOP_COLOR;

var front;
var FRONT_WIDTH = 5;
var FRONT_HEIGHT = 10;

var thruster;
var leftThruster;
var rightThruster;
var THRUSTER_WIDTH = 10;
var THRUSTER_HEIGHT = 8;

// shield
var shield;
var shieldBroken;
var shieldBorderWidth;
var SHIELD_RADIUS = 40;
var SHIELD_COLOR = new Color(40, 40, 60);
var SHIELD_BORDER_COLOR = new Color(100, 100, 200);

// laser
var laser;
var LASER_WIDTH = 10;
var LASER_COLOR = new Color(230, 70, 20);
var laserId;

var mouseDown;

// laser meter
var laserMeterOutline;
var laserMeter;
var METER_WIDTH = 200;
var METER_HEIGHT = 10;
var OUTLINE_BORDER = 10;
var OUTLINE_COLOR = new Color(140, 140, 150);

var laserMeterEmpty;

// power-ups
var POWER_UP_RADIUS = 25;
var POWER_UP_SPEED = 8;

var lastNum = -1;

// double points
var indicator;

// full laser
var fullLaserActivated = false;

// invincibility
var forceField;
var FORCE_FIELD_COLOR = new Color(40, 80, 40);
var FORCE_FIELD_RADIUS = 80;

// laser storm
var numLines = 0;

// electricity
var electricityOn = false;
var ELECTRICITY_RANGE = 150;
var ELECTRICITY_COLOR = new Color(80, 160, 255);

// score
var score;
var scoreBoard;
var FONT = "60pt Arial";
var DISTANCE_FROM_TOP = 20;
var displayedScore; // for final scoreboard
var multiplier = 1;

// start
var countDownNum;
var countDownText;
var fontSize = 1;

// end
var gameIsOver = false;
var reset = false;

// timers
var ASTEROID_TIME = 100000000 / AREA;
var POWER_UP_TIME = 10000;
var RECHARGE_TIME = 50;

function start() {
    gameIsOver = false;

    setBackground();

    shieldBroken = false;
    shieldBorderWidth = 6;
    buildSpaceship();
    mouseMoveMethod(moveSpaceship);
    setTimer(createTrail, 50);

    countDownNum = 3;
    buildCountDown();
    setTimer(countDown, 1000);
}

function startGame() {
    reset = false;

    score = 0;
    displayedScore = 0;
    setUI();

    laserMeterEmpty = false;
    mouseDown = false;
    mouseDownMethod(activateLaser);
    mouseDragMethod(activateLaser);
    mouseUpMethod(function() {
        deactivateLaser();
        mouseDown = false;
    });

    setTimer(buildAsteroid, ASTEROID_TIME);
    setTimer(randomPowerUp, POWER_UP_TIME);
    setTimer(rechargeLaser, RECHARGE_TIME);
    setTimer(frontMeter, 200); // keep laser meter in front of other objects
    setTimer(updateScore, 200);

    keyDownMethod(endGame); // press space key to end game
}

function setBackground() {
    setBackgroundColor(new Color(40, 40, 40));
    var numStars = AREA / 10000;
    for (var i = 0; i < numStars; i++) {
        var star = drawStar();
        setTimer(moveStar, 20, star);
    }
}

function drawStar() {
    var radius = Randomizer.nextInt(1, 2);
    var x = Randomizer.nextInt(radius, WIDTH - radius);
    var y = Randomizer.nextInt(radius, HEIGHT - radius);
    var star = new Circle(radius);
    star.setPosition(x, y);
    star.setColor(Color.white);
    add(star);
    return star;
}

function moveStar(star) {
    star.move(0, 1);
    if (star.getY() > HEIGHT) {
        var radius = star.getRadius();
        star.setPosition(Randomizer.nextInt(radius, WIDTH - radius), -radius);
    }
}

function buildCountDown() {
    countDownText = new Text("", "1pt Arial");
    countDownText.setPosition(MIDX - countDownText.getWidth() / 2, MIDY);
    countDownText.setColor(Color.white);
    add(countDownText);
}

function countDown() {
    countDownText.setText(countDownNum);
    countDownText.setFont("1pt Arial");
    countDownText.setPosition(MIDX - countDownText.getWidth() / 2, MIDY);
    countDownNum--;
    if (countDownNum == -1) {
        stopTimer(countDown);
        remove(countDownText);
        startGame();
    }
    setTimer(enlargeText, 1);
}

function enlargeText() {
    countDownText.setFont(fontSize + "pt Arial");
    countDownText.setPosition(MIDX - countDownText.getWidth() / 2, MIDY);
    fontSize += 10;
    if (fontSize > 120) {
        fontSize = 1;
        stopTimer(enlargeText);
    }
}

function setUI() {
    scoreBoard = new Text(score, FONT);
    scoreBoard.setPosition(MIDX - scoreBoard.getWidth() / 2,
        scoreBoard.getHeight() + DISTANCE_FROM_TOP);
    scoreBoard.setColor(Color.white);
    add(scoreBoard);

    laserMeterOutline = new Rectangle(METER_WIDTH, METER_HEIGHT);
    laserMeterOutline.setBorderColor(OUTLINE_COLOR);
    laserMeterOutline.setBorderWidth(OUTLINE_BORDER);
    laserMeterOutline.setPosition(MIDX - METER_WIDTH / 2,
        HEIGHT - METER_HEIGHT * 3);
    add(laserMeterOutline);

    buildMeter(METER_WIDTH);
}

function buildMeter(width) {
    if (gameIsOver) {
        return;
    }
    laserMeter = new Rectangle(width, METER_HEIGHT);
    laserMeter.setColor(Color.red);
    laserMeter.setPosition(laserMeterOutline.getX(), laserMeterOutline.getY());
    add(laserMeter);
}

function buildSpaceship() {
    laser = new Line(0, 0, 0, 0);
    laser.setLineWidth(LASER_WIDTH);
    laser.setColor(LASER_COLOR);
    add(laser);

    shield = circle(SHIELD_RADIUS, MIDX, MIDY - 4, SHIELD_COLOR);
    shield.setBorderColor(SHIELD_BORDER_COLOR);
    shield.setBorderWidth(shieldBorderWidth);
    add(shield);

    forceField = circle(FORCE_FIELD_RADIUS, MIDX, MIDY - 4, FORCE_FIELD_COLOR);

    thruster = rectangle(THRUSTER_WIDTH, THRUSTER_HEIGHT, MIDX - THRUSTER_WIDTH
        / 2, MIDY + BODY_HEIGHT / 2.75, SPACESHIP_COLOR);

    leftThruster = rectangle(THRUSTER_WIDTH, THRUSTER_HEIGHT, MIDX - WING_WIDTH
        / 2.25, MIDY + BODY_HEIGHT / 5, SPACESHIP_COLOR);

    rightThruster = rectangle(THRUSTER_WIDTH, THRUSTER_HEIGHT, MIDX + WING_WIDTH
        / 2.25 - THRUSTER_WIDTH, MIDY + BODY_HEIGHT / 5, SPACESHIP_COLOR);

    wings = rectangle(WING_WIDTH, WING_HEIGHT, MIDX - WING_WIDTH / 2, MIDY, WING_COLOR);

    body = oval(BODY_WIDTH, BODY_HEIGHT, MIDX, MIDY, BODY_COLOR);

    top = oval(TOP_WIDTH, TOP_HEIGHT, MIDX, MIDY - TOP_WIDTH + 1, SPACESHIP_COLOR);

    leftTip = rectangle(TIP_WIDTH, TIP_HEIGHT, MIDX - WING_WIDTH / 2.5,
        - TIP_HEIGHT, TIP_COLOR);

    rightTip = rectangle(TIP_WIDTH, TIP_HEIGHT, MIDX + WING_WIDTH / 2.5
        - TIP_WIDTH, MIDY - TIP_HEIGHT, TIP_COLOR);

    spaceship = []; // holds all parts of the spaceship
    spaceship.push(thruster);
    spaceship.push(leftThruster);
    spaceship.push(rightThruster);
    spaceship.push(wings);
    spaceship.push(body);
    spaceship.push(top);
    spaceship.push(leftTip);
    spaceship.push(rightTip);
}

function circle(radius, x, y, color) {
    var cir = new Circle(radius);
    cir.setPosition(x, y);
    cir.setColor(color);
    return cir;
}

function rectangle(width, height, x, y, color) {
    var rect = new Rectangle(width, height);
    rect.setPosition(x, y);
    rect.setColor(color);
    add(rect);
    return rect;
}

function oval(width, height, x, y, color) {
    var oval = new Oval(width, height);
    oval.setPosition(x, y);
    oval.setColor(color);
    add(oval);
    return oval;
}

function moveSpaceship(e) {
    var x = e.getX();
    var y = e.getY();

    shield.setPosition(x, y - 4);
    forceField.setPosition(x, y - 4);
    thruster.setPosition(x - THRUSTER_WIDTH / 2, y + BODY_HEIGHT / 2.75);
    leftThruster.setPosition(x - WING_WIDTH / 2.25, y + BODY_HEIGHT / 5);
    rightThruster.setPosition(x + WING_WIDTH / 2.25 - THRUSTER_WIDTH, y + BODY_HEIGHT / 5);
    wings.setPosition(x - WING_WIDTH / 2, y);
    body.setPosition(x, y);
    top.setPosition(x, y - TOP_WIDTH + 1);
    leftTip.setPosition(x - WING_WIDTH / 2.5, y - TIP_HEIGHT);
    rightTip.setPosition(x + WING_WIDTH / 2.5 - TIP_WIDTH, y - TIP_HEIGHT);
}

function activateLaser(e) {
    mouseDown = true;

    if (laserMeter.getWidth() == 0 || reset) {
        deactivateLaser(); // in case laser is currently on
        return;
    }

    var x = e.getX();
    var y = e.getY();

    laser.setPosition(x, 0);
    laser.setEndpoint(x, y);

    clearInterval(laserId); // stops the last timer
    laserId = setInterval(function() { // sets a new timer
        clearPath(x, y); // removes objects in the laser's path
        if (!fullLaserActivated) {
            depleteLaser();
        }
    }, 5);
}

function deactivateLaser() {
    laser.setEndpoint(laser.getX(), laser.getY()); // hides laser
    clearInterval(laserId);
}

function clearPath(x, shipY) {
    if (gameIsOver) {
        return;
    }

    for (var y = shipY; y > 0; y -= 20) {
        removeAsteroids(x, y);
    }
}

function removeAsteroids(x, y) {
    var elem = getElementAt(x, y);
    // checks if element is an asteroid or debris
    if (elem != null && notSpaceship(elem) && notPowerUp(elem.getColor()) &&
        notUI(elem) && elem.getType() != "Line" && elem.getType() != "Text") {
        if (elem.getRadius() >= 20) { // checks if element is an asteroid
            elem.setType("Rectangle");
            // ^ changes asteroid to type rectangle signaling its move
            // function to stop its timer
            breakAnimation(x, y);
            score += 5 * multiplier;
        }
        remove(elem); // removes element from the canvas
    }
}

function notSpaceship(elem) {
    for (var i = 0; i < spaceship.length; i++) {
        if (elem == spaceship[i]) {
            return false;
        }
    }
    return elem != shield && elem != laser && elem != forceField;
}

function notUI(elem) {
    return elem != scoreBoard && elem != laserMeterOutline && elem != laserMeter;
}

function notPowerUp(color) {
    return color != Color.red && color != Color.green && color != Color.blue &&
           color != Color.yellow && color != Color.orange &&
           color != Color.purple && color != ELECTRICITY_COLOR;
}

function rechargeLaser() {
    if (laserMeter.getWidth() == METER_WIDTH || mouseDown) {
        return; // meter is full or mouse is down
    }
    remove(laserMeter);
    buildMeter(laserMeter.getWidth() + 1); // create new meter with more energy
}

function depleteLaser() {
    remove(laserMeter);
    buildMeter(laserMeter.getWidth() - 1); // create new meter with less energy
    activateLaser();
}

function frontMeter() {
    // re-add laser meter to keep it in front of other objects
    remove(laserMeterOutline);
    remove(laserMeter);
    if (gameIsOver) {
        return;
    }
    add(laserMeterOutline);
    add(laserMeter);
}

function buildAsteroid() {
    var radius = Randomizer.nextInt(20, 60); // random size
    var asteroid = new Circle(radius);
    asteroid.setColor(new Color(Randomizer.nextInt(160, 180),
        Randomizer.nextInt(160, 180), Randomizer.nextInt(180, 200)));
    asteroid.setPosition(Randomizer.nextInt(0, WIDTH), -radius);
    add(asteroid);

    var dy = asteroidSpeed(radius); // calculate speed based on size
    // set timer to move asteroid, passes the asteroid object and timer's id
    var asteroidId = setInterval(function() {
        moveAsteroid(asteroid, dy, radius, asteroidId);
    }, 1);
}

function asteroidSpeed(size) {
    if (size < 30) {
        return 3;
    } else if (size < 40) {
        return 2;
    }
    return 1;
}

function moveAsteroid(asteroid, dy, radius, id) {
    if (asteroid.getType() == "Rectangle") {
        clearInterval(id); // stops timer if asteroid is type rectangle
    }

    asteroid.move(0, dy);

    if (reset) { // don't check for collisions if game is being reset
        return;
    }

    var x = asteroid.getX();
    var y = asteroid.getY();
    if (checkCollision(x, y + radius) || checkCollision(x, y - radius) ||
        checkCollision(x + radius, y) || checkCollision(x - radius, y) ||
        asteroid.getY() > HEIGHT + radius)
    {
        breakAnimation(x, y);
        clearInterval(id);
        remove(asteroid);
    }
}

function checkCollision(x, y) {
    var elem = getElementAt(x, y);
    if (electricityOn && inRange(x, y)) {
        drawLightning(x, y);
        score += 5 * multiplier;
        return true;
    } else if (elem == null) {
        return false;
    } else if (elem == forceField) {
        score += 5 * multiplier;
        return true;
    } else if (elem == shield) {
        updateShield();
        return true;
    } else if (shieldBroken) {
        for (var i = 0; i < spaceship.length; i++) {
            if (elem == spaceship[i]) {
                gameOver();
                return true;
            }
        }
    } else if (elem.getType() == "Line" && elem != laser) {
        score += 5 * multiplier;
        return true;
    }
    return false;
}

function updateShield() {
    if (shieldBorderWidth == 2) {
        remove(shield);
        shieldBroken = true;
    } else {
        shieldBorderWidth -= 2;
        shield.setBorderWidth(shieldBorderWidth);
    }
}

function expandExplosion(explosion, speed, maxRadius, id) {
    explosion.setRadius(explosion.getRadius() + speed);
    if (explosion.getRadius() >= maxRadius) {
        clearInterval(id);
        remove(explosion);
    }
}

function breakAnimation(x, y) {
    for (var i = 0; i < 10; i++) {
        drawDebris(x, y);
    }
}

function drawDebris(x, y) {
    var debris = new Circle(Randomizer.nextInt(5, 15));
    debris.setPosition(x, y);
    debris.setColor(new Color(Randomizer.nextInt(180, 220),
        Randomizer.nextInt(100, 150), Randomizer.nextInt(50, 100)));
    add(debris);

    var dx = Randomizer.nextInt(4, 8);
    var dy = Randomizer.nextInt(4, 8);
    if (Randomizer.nextBoolean()) {
        dx *= -1;
    }
    if (Randomizer.nextBoolean()) {
        dy *= -1;
    }

    var timesMoved = 0;
    var id = setInterval(function() {
        debris.move(dx, dy);
        if (outOfBounds(debris.getX(), debris.getY())) {
            clearInterval(id);
            remove(debris);
        } else {
            timesMoved++;
            if (timesMoved % 30 == 0 && timesMoved <= 90) {
                dx /= 1.5;
                dy /= 1.5;
            }
        }
    }, 10);
}

function outOfBounds(x, y) {
    return x < 0 || x > WIDTH || y < 0 || y > HEIGHT;
}

function randomPowerUp() {
    var powerUp = new Circle(POWER_UP_RADIUS);
    powerUp.setPosition(
        Randomizer.nextInt(POWER_UP_RADIUS, WIDTH - POWER_UP_RADIUS),
        -POWER_UP_RADIUS);

    var num = Randomizer.nextInt(0, 6);
    if (num == lastNum) {
        num++;
        if (num == 7) {
            num = 0;
        }
    }
    lastNum = num;
    if (num == 0) {
        powerUp.setColor(Color.yellow); // extra points
    } else if (num == 1) {
        powerUp.setColor(Color.orange); // double points earned
    } else if (num == 2) {
        powerUp.setColor(Color.purple); // unlimited laser
    } else if (num == 3) {
        powerUp.setColor(Color.green); // invincibility
    } else if (num == 4) {
        powerUp.setColor(Color.blue); // restore shield
    } else if (num == 5) {
        powerUp.setColor(Color.red); // laser storm
    } else if (num == 6) {
        powerUp.setColor(ELECTRICITY_COLOR); // electricity
    }

    add(powerUp);
    var powerUpId = setInterval(function() {
        movePowerUp(powerUp, powerUpId);
    }, POWER_UP_SPEED);
}

function movePowerUp(powerUp, id) {
    powerUp.move(0, 1);

    var x = powerUp.getX();
    var y = powerUp.getY();
    var radius = powerUp.getRadius();
    if (checkCollection(x, y + radius) || checkCollection(x, y - radius) ||
        checkCollection(x + radius, y) || checkCollection(x - radius, y))
    {
        activatePower(powerUp);
    } else if (powerUp.getY() - POWER_UP_RADIUS < HEIGHT) {
        return;
    }
    clearInterval(id);
    remove(powerUp);
}

function checkCollection(x, y) {
    var elem = getElementAt(x, y);
    for (var i = 0; i < spaceship.length; i++) {
        if (elem == spaceship[i]) {
            return true;
        }
    }
    return false;
}

function activatePower(powerUp) {
    var color = powerUp.getColor();
    if (color == Color.yellow) {
        extraPoints();
    } else if (color == Color.orange) {
        doublePoints();
    } else if (color == Color.purple) {
        fullLaser();
    } else if (color == Color.green) {
        invincibility();
    } else if (color == Color.blue) {
        restoreShield();
    } else if (color == Color.red) {
        laserStorm();
    } else if (color == ELECTRICITY_COLOR) {
        electricity();
    }
    if (color != Color.blue) {
        updateSpaceshipColor(color);
    }
}

function updateSpaceshipColor(color) {
    top.setColor(color);
    thruster.setColor(color);
    leftThruster.setColor(color);
    rightThruster.setColor(color);
}

function extraPoints() {
    indicator = new Text("+150", "30pt Arial");
    indicator.setColor(Color.yellow);
    indicator.setPosition(scoreBoard.getX() + scoreBoard.getWidth() + 25,
                          scoreBoard.getHeight() + DISTANCE_FROM_TOP / 2);
    add(indicator);

    scoreBoard.setColor(Color.yellow);
    score += 150;
    setTimer(revertColor, 400);
}

function revertColor() {
    updateSpaceshipColor(SPACESHIP_COLOR);

    remove(indicator);

    scoreBoard.setColor(Color.white);
    stopTimer(revertColor);
}

function doublePoints() {
    indicator = new Text("x2", "30pt Arial");
    indicator.setColor(Color.orange);
    indicator.setPosition(scoreBoard.getX() + scoreBoard.getWidth() + 25,
                          scoreBoard.getHeight() + DISTANCE_FROM_TOP / 2);
    add(indicator);

    scoreBoard.setColor(Color.orange);
    multiplier++;
    setTimer(reduceMultiplier, 8000);
}

function reduceMultiplier() {
    updateSpaceshipColor(SPACESHIP_COLOR);

    remove(indicator);

    scoreBoard.setColor(Color.white);
    multiplier--;
    stopTimer(reduceMultiplier);
}

function fullLaser() {
    mouseDown = false;
    fullLaserActivated = true;
    remove(laserMeter);
    buildMeter(METER_WIDTH);
    laser.setColor(Color.purple);
    laserMeter.setColor(Color.purple);
    setTimer(turnOffLaser, 5000);
}

function turnOffLaser() {
    updateSpaceshipColor(SPACESHIP_COLOR);
    fullLaserActivated = false;
    laser.setColor(Color.red);
    stopTimer(turnOffLaser);
}

function invincibility() {
    add(forceField);
    frontSpaceship();
    setTimer(invincibilityOff, 3000);
}

function invincibilityOff() {
    updateSpaceshipColor(SPACESHIP_COLOR);
    remove(forceField);
    stopTimer(invincibilityOff);
}

function restoreShield() {
    if (shieldBroken) {
        add(shield);
        frontSpaceship();
    } else {
        shieldBorderWidth += 2;
        shield.setBorderWidth(shieldBorderWidth);
    }
}

function laserStorm() {
    setTimer(drawLine, 250);
}

function drawLine() {
    var side = Randomizer.nextInt(0, 3);
    var dx = 12;
    var dy = 12;
    if (side == 0) { // top
        var x = Randomizer.nextInt(0, WIDTH);
        var y = 0;
        if (Randomizer.nextBoolean()) {
            dx *= -1;
        }
        dy *= 1;
    } else if (side == 1) { // right
        var x = WIDTH;
        var y = Randomizer.nextInt(0, HEIGHT);
        dx *= -1;
        if (Randomizer.nextBoolean()) {
            dy *= -1;
        }
    } else if (side == 2) { // bottom
        var x = Randomizer.nextInt(0, WIDTH);
        var y = HEIGHT;
        if (Randomizer.nextBoolean()) {
            dx *= -1;
        }
        dy *= -1;
    } else { // left
        var x = 0;
        var y = Randomizer.nextInt(0, HEIGHT);
        dx *= 1;
        if (Randomizer.nextBoolean()) {
            dy *= -1;
        }
    }

    var line = new Line(x, y, x, y)
    line.setColor(Color.red);
    line.setLineWidth(15);
    add(line);

    var lineId = setInterval(function() {
        moveLine(line, dx, dy, lineId);
    }, 1);

    numLines++;
    if (numLines == 28) {
        updateSpaceshipColor(SPACESHIP_COLOR);
        stopTimer(drawLine);
        numLines = 0;
    }
}

function moveLine(line, dx, dy, id) {
    var endX = line.getEndX() + dx;
    var endY = line.getEndY() + dy;

    removeAsteroids(endX, endY);

    line.setEndpoint(endX, endY);
    if (outOfBounds(endX, endY)) {
        var clearId = setInterval(function() {
            removeLine(line, dx, dy, clearId);
        }, 200);
        clearInterval(id);
    }
}

function removeLine(line, dx, dy, id) {
    dx /= 2;
    dy /= 2;
    var x = line.getEndX() - dx;
    var y = line.getEndY() - dy;
    while (!outOfBounds(x, y)) {
        removeAsteroids(x, y);
        x -= dx;
        y -= dy;
    }

    remove(line);
    clearInterval(id);
}

function electricity() {
    electricityOn = true;
    setTimer(electricityOff, 4000);
}

function inRange(x, y) {
    return Math.abs(body.getX() - x) < ELECTRICITY_RANGE &&
           Math.abs(body.getY() - y) < ELECTRICITY_RANGE;
}

function drawLightning(x, y) {
    var spaceshipX = body.getX();
    var spaceshipY = body.getY();
    var x2 = spaceshipX;
    var y2 = spaceshipY;
    var numPieces = Randomizer.nextInt(8, 12);
    var xIncrement = (x - spaceshipX) / numPieces;
    var yIncrement = (y - spaceshipY) / numPieces;

    var changeX = true;
    if (y < spaceshipY + HEIGHT / 5 &&
        y > spaceshipY - HEIGHT / 5 &&
        (x > spaceshipX + WIDTH / 10 ||
        x < spaceshipX - WIDTH / 10)) {
        changeX = false;
    }

    var lightning = [];

    for (var i = 0; i < numPieces; i++) {
        var x1 = x2;
        var y1 = y2;
        if (changeX) {
            x2 = Randomizer.nextInt(spaceshipX + xIncrement * i + 30,
                                    spaceshipX + xIncrement * i - 30);
            y2 += yIncrement;
        } else {
            x2 += xIncrement;
            y2 = Randomizer.nextInt(spaceshipY + yIncrement * i + 30,
                                    spaceshipY + yIncrement * i - 30);
        }

        lightning.push(drawPiece(x1, y1, x2, y2));
    }

    frontSpaceship();
    lightning.push(drawPiece(x2, y2, x, y));

    var lightningId = setInterval(function() {
        removeLightning(lightning, lightningId);
    }, 100);
}

function drawPiece(x1, y1, x2, y2) {
    var line = new Line(x1, y1, x2, y2);
    line.setColor(ELECTRICITY_COLOR);
    line.setLineWidth(5);
    add(line);
    return line;
}

function removeLightning(lightning, id) {
    for (var i = 0; i < lightning.length; i++) {
        remove(lightning[i]);
    }
    clearInterval(id);
}

function electricityOff() {
    updateSpaceshipColor(SPACESHIP_COLOR);
    electricityOn = false;
    stopTimer(electricityOff);
}

function frontSpaceship() {
    for (var i = 0; i < spaceship.length; i++) {
        remove(spaceship[i]);
        add(spaceship[i]);
    }
}

function createTrail() {
    var trail = new Circle(Randomizer.nextInt(3, 5));
    trail.setColor(new Color(Randomizer.nextInt(200, 240),
                             Randomizer.nextInt(100, 120),
                             Randomizer.nextInt(50, 100)));
    var x = body.getX();
    trail.setPosition(Randomizer.nextInt(x - 20, x + 20), body.getY() + 25);
    add(trail);
    var trailId = setInterval(function() {
        moveTrail(trail, trailId);
    }, 1);
}

function moveTrail(trail, id) {
    trail.move(0, 4);
    if (trail.getY() >= HEIGHT) {
        clearInterval(id);
        remove(trail);
    }
}

function updateScore() {
    score += 1 * multiplier;
    scoreBoard.setText(score);
    scoreBoard.setPosition(MIDX - scoreBoard.getWidth() / 2, scoreBoard.getHeight() + 20);
    remove(scoreBoard);
    add(scoreBoard);
}

function gameOver() {
    gameIsOver = true;
    destroyShip();
    displayText();
    mouseClickMethod(restart);
    remove(indicator);
    remove(laser);
    stopTimer(frontMeter);
    stopTimer(rechargeLaser);
    remove(laserMeter);
    remove(laserMeterOutline);
    stopTimer(createTrail);
    stopTimer(updateScore);
    remove(scoreBoard);
    stopTimer(randomPowerUp);
}

function destroyShip() {
    for (var i = 0; i < spaceship.length; i++) {
        remove(spaceship[i]);
    }
    var explosion = new Circle(5);
    explosion.setColor(Color.orange);
    explosion.setPosition(body.getX(), body.getY());
    add(explosion);
    var explosionId = setInterval(function() {
        expandExplosion(explosion, 4, 150, explosionId);
    }, 1);
}

function displayText() {
    var text = new Text("Game Over", "60pt Arial");
    text.setPosition(MIDX - text.getWidth() / 2, MIDY - text.getHeight() / 2);
    text.setColor(Color.white);
    add(text);

    var scoreText = new Text(displayedScore, "40pt Arial");
    scoreText.setPosition(MIDX - scoreText.getWidth() / 2,
                          MIDY + text.getHeight() / 2);
    scoreText.setColor(Color.white);
    add(scoreText);
    setTimer(increaseScore, 20, scoreText);

    var restartText = new Text("Click to restart", "20pt Arial");
    restartText.setPosition(MIDX - restartText.getWidth() / 2,
                            HEIGHT - restartText.getHeight());
    restartText.setColor(Color.white);
    add(restartText);
}

function increaseScore(text) {
    displayedScore += Math.ceil(score / 100);
    if (displayedScore < score) {
        text.setText(displayedScore);
    } else {
        text.setText(score);
        stopTimer(increaseScore);
    }
    text.setPosition(MIDX - text.getWidth() / 2, MIDY + text.getHeight() / 2);
}

function restart() {
    if (gameIsOver) {
        reset = true;
        removeAll();
        stopTimer(buildAsteroid);
        start();
    }
}

function endGame(e) {
    if (e.keyCode == Keyboard.SPACE) {
        gameOver();
        removeAll();
        stopTimer(buildAsteroid);
    }
}

// disable context menu on right click
oncontextmenu = function() {
    return false;
};
