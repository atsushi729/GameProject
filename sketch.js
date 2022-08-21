/*
- Copy your game project code into this file
- for the p5.Sound library look here https://p5js.org/reference/#/libraries/p5.sound
- for finding cool sounds perhaps look here
https://freesound.org/
*/


var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var cloudScrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var trees_x;
var trees_y;
var clouds;
var mountains;
var canyons;
var collectables;

var game_score;
var flagpole;
var lives;
var hearts;

var jumpSound;
var getItemSound;
var fallSound;
var contactWithEnemy;
var goal;

let platforms;

// ---------------------
// preload sound effect
// ---------------------
function preload()
{   
    // junp sound
    soundFormats('mp3','wav');

    // load your sounds
    jumpSound = loadSound('assets/jump.wav');
    // get item sounds
    getItemSound = loadSound('assets/get_item.wav');
    // fall sounds
    fallSound = loadSound('assets/fall.wav');
    // contact with enemy sounds
    contactWithEnemySound = loadSound('assets/contact_with_enemy.wav');
    // goal sounds
    goalSound = loadSound('assets/goal.wav');
    
	// set above sounds
    jumpSound.setVolume(0.1);
    getItemSound.setVolume(0.1);
    fallSound.setVolume(0.1);
    contactWithEnemySound.setVolume(0.1);
    goalSound.setVolume(0.1);
}

// ---------------------
// Draw functions
// ---------------------
function setup()
{
	createCanvas(1024, 576);
    
    floorPos_y = height * 3 / 4;
	lives = 3;
	startGame();
}

// ---------------------
// Draw functions
// ---------------------
function draw() {
	background(135, 206, 250); // fill the sky blue
	noStroke();
	fill(0, 155, 0);
	rect(0, floorPos_y, width, height / 4); // draw some green ground
	
	// Implement scrolling for clouds
	push();
	translate(cloudScrollPos, 0); // clouds scrolling effect
	
	// Draw clouds.
	drawClouds();
	pop();
	
	// Implement scrolling for other objects
	push();
	translate(scrollPos, 0); // base scrolling effect

	// Draw mountains
	drawMountains();

	// Draw trees.
	drawTrees();

	// Draw canyons.
	for (var i = 0; i < canyons.length; i++) {
		drawCanyon(canyons[i]);
		checkCanyon(canyons[i]);
	}

	// Draw collectable items.
	for (var i = 0; i < collectables.length; i++) {
		if (collectables[i].isFound == false) {
			drawCollectable(collectables[i]);
			checkCollectable(collectables[i]);
		}
	}

	// draw platform
	for (var i = 0; i < platforms.length; i++) {
		drawPlatform(platforms[i]);
	}
	
	// Draw flag
	renderFlagpole();
	
	// End scrolling
	pop();
	
	// Draw character's score
	fill(255);
	noStroke();
	textSize(15);
	text("Game score : " + game_score, 20, 20);
	
	// Draw game character.
	drawGameChar();
	
	// Draw lives
	for (var i = 0; i < lives;i++)
	{
		drawLives(hearts[i]);
	}
	
	// Check player's lives
	checkPlayerDie();
	
	if (lives < 1)
	{
		fill(255, 0, 255);
		textSize(32);
		text("Game over. Press space to continue.", width / 4, height / 2);
		return;
	}
	
	if (flagpole.isReached)
	{
        goalSound.play();
		textSize(32);
		text("Level complete!!. Press space to continue.", width / 4, height / 2);
		return;
	}

	// Logic to make the game character move or the background scroll.
	if (isLeft) {
		if (gameChar_x > width * 0.2) {
			gameChar_x -= 5;
		}
		else {
			scrollPos += 5;
			cloudScrollPos += 2;
		}
	}

	if (isRight) {
		if (gameChar_x < width * 0.8) {
			gameChar_x += 5;
		}
		else {
			scrollPos -= 5; // negative for moving against the background
			cloudScrollPos -= 2;
		}
	}

	// Logic to make the game character rise and fall.
	// add falling code
	if (gameChar_y < floorPos_y) {

		var isContact = false;
		for (let i = 0; i < platforms.length; i++) {
			if (checkContact(gameChar_world_x, gameChar_y, platforms[i])) {
			  isContact = true;
			  isFalling = false;
			  gameChar_y = platforms[i].pos_y;
			  break;
		  	}
		}

		if(!isContact){
			isFalling = true;
			gameChar_y += 3;
		} 
	} else {
		isFalling = false;
	}
	
	// Check wether character has goal or not
	if (flagpole.isReached == false)
	{
		checkFlagpole();
	}

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------
function keyPressed() {
	if (keyCode == 37) {
		console.log("left arrow");
		isLeft = true;
	}

	if (keyCode == 39) {
		console.log("right arrow");
		isRight = true;
	}

	if (!isFalling) { 
		console.log("flying");
		if (keyCode == 32) {
			console.log("flying");
			gameChar_y -= 130;
			jumpSound.play();
		}
	}
}

function keyReleased() {
	if (keyCode == 37) {
		console.log("left arrow");
		isLeft = false;
	}
	else if (keyCode == 39) {
		console.log("right arrow");
		isRight = false;
	}
}

// ------------------------------
// Game character render function
// ------------------------------
// Function to draw the game character.
function drawGameChar() {
	if (isLeft && isFalling) {
        // jumping-left
		//general 
		strokeWeight(1);
		stroke(color(0, 0, 0));

		// head
		fill(0, 0, 0);
		triangle(gameChar_x, gameChar_y - 65, gameChar_x + 3, gameChar_y - 62, gameChar_x - 3, gameChar_y - 62);
		fill(255, 239, 213);
		ellipse(gameChar_x, gameChar_y - 50, 23, 23);

		//eyes
		ellipse(gameChar_x - 8, gameChar_y - 52, 6, 6);
		line(gameChar_x, gameChar_y - 45, gameChar_x - 9, gameChar_y - 45);

		// body
		fill(255, 255, 0);
		ellipse(gameChar_x, gameChar_y - 24, 22, 30);

		// legs
		strokeWeight(5);
		strokeJoin(MITER);
		beginShape();
		vertex(gameChar_x + 5, gameChar_y - 20);
		vertex(gameChar_x - 3, gameChar_y - 10);
		vertex(gameChar_x + 5, gameChar_y - 0);
		endShape();
		beginShape();
		vertex(gameChar_x - 5, gameChar_y - 20);
		vertex(gameChar_x - 13, gameChar_y - 10);
		vertex(gameChar_x - 5, gameChar_y - 0);
		endShape();

		//arms
		strokeWeight(5);
		strokeJoin(MITER);
		beginShape();
		vertex(gameChar_x + 20, gameChar_y - 23);
		vertex(gameChar_x + 10, gameChar_y - 33);
		endShape();
		beginShape();
		vertex(gameChar_x - 10, gameChar_y - 33);
		vertex(gameChar_x, gameChar_y - 23);
		endShape();

		// set default
		strokeWeight(1);
	}
	else if (isRight && isFalling) { // jumping-right
		//general 
		strokeWeight(1);
		stroke(color(0, 0, 0));

		// head
		fill(0, 0, 0);
		triangle(gameChar_x, gameChar_y - 65, gameChar_x + 3, gameChar_y - 62, gameChar_x - 3, gameChar_y - 62);
		fill(255, 239, 213);
		ellipse(gameChar_x, gameChar_y - 50, 23, 23);

		//eyes
		ellipse(gameChar_x + 8, gameChar_y - 52, 6, 6);
		line(gameChar_x, gameChar_y - 45, gameChar_x + 9, gameChar_y - 45)

		// body
		fill(255, 255, 0);
		ellipse(gameChar_x, gameChar_y - 24, 22, 30);

		// legs
		strokeWeight(5);
		strokeJoin(MITER);
		beginShape();
		vertex(gameChar_x + 5, gameChar_y - 20);
		vertex(gameChar_x + 13, gameChar_y - 10);
		vertex(gameChar_x + 5, gameChar_y - 0);
		endShape();
		beginShape();
		vertex(gameChar_x - 5, gameChar_y - 20);
		vertex(gameChar_x + 3, gameChar_y - 10);
		vertex(gameChar_x - 5, gameChar_y - 0);
		endShape();

		//arms
		strokeWeight(5);
		strokeJoin(MITER);
		beginShape();
		vertex(gameChar_x, gameChar_y - 23);
		vertex(gameChar_x + 10, gameChar_y - 33);
		endShape();
		beginShape();
		vertex(gameChar_x - 10, gameChar_y - 33);
		vertex(gameChar_x - 20, gameChar_y - 23);
		endShape();

		// set default
		strokeWeight(1);
	}
	else if (isLeft) { // walking left
		//general 
		strokeWeight(1);
		stroke(color(0, 0, 0));

		// head
		fill(0, 0, 0);
		triangle(gameChar_x, gameChar_y - 65, gameChar_x + 3, gameChar_y - 62, gameChar_x - 3, gameChar_y - 62);
		fill(255, 239, 213);
		ellipse(gameChar_x, gameChar_y - 50, 23, 23);

		//eyes
		ellipse(gameChar_x - 8, gameChar_y - 52, 6, 6);
		line(gameChar_x, gameChar_y - 45, gameChar_x - 9, gameChar_y - 45);

		// body
		fill(255, 255, 0);
		ellipse(gameChar_x, gameChar_y - 24, 22, 30);

		// legs
		fill(255, 228, 181);
		ellipse(gameChar_x - 7, gameChar_y - 7, 6, 18);
		ellipse(gameChar_x + 7, gameChar_y - 7, 6, 18);

		//arms
		strokeWeight(5);
		strokeJoin(MITER);
		beginShape();
		vertex(gameChar_x + 10, gameChar_y - 33);
		vertex(gameChar_x, gameChar_y - 33);
		endShape();
		beginShape();
		vertex(gameChar_x - 10, gameChar_y - 33);
		vertex(gameChar_x - 20, gameChar_y - 33);
		endShape();

		// set default
		strokeWeight(1);
	}
	else if (isRight) {	// walking right
		//general 
		strokeWeight(1);
		stroke(color(0, 0, 0));

		// head
		fill(0, 0, 0);
		triangle(gameChar_x, gameChar_y - 65, gameChar_x + 3, gameChar_y - 62, gameChar_x - 3, gameChar_y - 62);
		fill(255, 239, 213);
		ellipse(gameChar_x, gameChar_y - 50, 23, 23);

		//eyes
		ellipse(gameChar_x + 8, gameChar_y - 52, 6, 6);
		line(gameChar_x, gameChar_y - 45, gameChar_x + 9, gameChar_y - 45);

		// body
		fill(255, 255, 0);
		ellipse(gameChar_x, gameChar_y - 24, 22, 30);

		// legs
		fill(255, 228, 181);
		ellipse(gameChar_x - 7, gameChar_y - 7, 6, 18);
		ellipse(gameChar_x + 7, gameChar_y - 7, 6, 18);

		//arms
		strokeWeight(5);
		strokeJoin(MITER);
		beginShape();
		vertex(gameChar_x + 20, gameChar_y - 33);
		vertex(gameChar_x + 10, gameChar_y - 33);
		endShape();
		beginShape();
		vertex(gameChar_x - 10, gameChar_y - 33);
		vertex(gameChar_x, gameChar_y - 33);
		endShape();

		// set default
		strokeWeight(1);
	}
	else if (isFalling || isPlummeting) {	// jumping facing forwards
		//general 
		strokeWeight(1);
		stroke(color(0, 0, 0));

		// head
		fill(0, 0, 0);
		triangle(gameChar_x, gameChar_y - 65, gameChar_x + 3, gameChar_y - 62, gameChar_x - 3, gameChar_y - 62);
		fill(255, 239, 213);
		ellipse(gameChar_x, gameChar_y - 50, 23, 23);

		//eyes
		ellipse(gameChar_x + 5, gameChar_y - 52, 6, 6);
		ellipse(gameChar_x - 5, gameChar_y - 52, 6, 6);
		line(gameChar_x + 5, gameChar_y - 45, gameChar_x - 5, gameChar_y - 45)

		// body
		fill(255, 255, 0);
		ellipse(gameChar_x, gameChar_y - 24, 22, 27);

		// legs
		fill(255, 228, 181);
		ellipse(gameChar_x - 7, gameChar_y - 7, 6, 10);
		ellipse(gameChar_x + 7, gameChar_y - 7, 6, 10);

		//arms
		strokeWeight(5);
		strokeJoin(MITER);
		beginShape();
		vertex(gameChar_x + 10, gameChar_y - 33);
		vertex(gameChar_x + 20, gameChar_y - 23);
		endShape();

		beginShape();
		vertex(gameChar_x - 10, gameChar_y - 33);
		vertex(gameChar_x - 20, gameChar_y - 23);
		endShape();

		// set default
		strokeWeight(1);
	}
	else { // standing front facing
		//general 
		strokeWeight(1);
		stroke(color(0, 0, 0));

		// head
		fill(0, 0, 0);
		triangle(gameChar_x, gameChar_y - 65, gameChar_x + 3, gameChar_y - 62, gameChar_x - 3, gameChar_y - 62);
		fill(255, 239, 213);
		ellipse(gameChar_x, gameChar_y - 50, 23, 23);

		//eyes
		ellipse(gameChar_x + 5, gameChar_y - 52, 6, 6);
		ellipse(gameChar_x - 5, gameChar_y - 52, 6, 6);
		line(gameChar_x + 5, gameChar_y - 45, gameChar_x - 5, gameChar_y - 45)

		// body
		fill(255, 255, 0);
		ellipse(gameChar_x, gameChar_y - 24, 22, 30);

		// legs
		fill(255, 228, 181);
		ellipse(gameChar_x - 7, gameChar_y - 7, 6, 18);
		ellipse(gameChar_x + 7, gameChar_y - 7, 6, 18);

		//arms
		strokeWeight(5);
		strokeJoin(MITER);
		beginShape();
		vertex(gameChar_x + 10, gameChar_y - 33);
		vertex(gameChar_x + 20, gameChar_y - 33);
		endShape();
		beginShape();
		vertex(gameChar_x - 10, gameChar_y - 33);
		vertex(gameChar_x - 20, gameChar_y - 33);
		endShape();

		// set default
		strokeWeight(1);
	}
}

// ---------------------------
// Background render functions
// ---------------------------
// Function to draw cloud objects.
function drawClouds() {
	for (var cloud of clouds) {
		fill(255, 255, 255);
		ellipse(cloud.pos_x, cloud.pos_y, 130, 110);
		ellipse(cloud.pos_x - 60, cloud.pos_y + 10, 100, 70);
		ellipse(cloud.pos_x + 60, cloud.pos_y + 10, 100, 70);
	}
}

// Function to draw mountains objects.
function drawMountains() {
	for (var mountain of mountains) {
		fill(100, 100, 100);
		triangle(mountain.pos_x, mountain.pos_y, mountain.pos_x - 150, mountain.pos_y + 232, mountain.pos_x + 150, mountain.pos_y + 232);
		fill(255, 255, 255);
		triangle(mountain.pos_x - 52, mountain.pos_y + 80, mountain.pos_x, mountain.pos_y, mountain.pos_x + 52, mountain.pos_y + 80);
		fill(100, 100, 100);
		triangle(mountain.pos_x - 90, mountain.pos_y + 200, mountain.pos_x - 20, mountain.pos_y + 60, mountain.pos_x + 50, mountain.pos_y + 100);
		triangle(mountain.pos_x + 50, mountain.pos_y + 100, mountain.pos_x + 10, mountain.pos_y + 40, mountain.pos_x - 10, mountain.pos_y + 100);
		stroke(0);
		strokeWeight(1);
		line(mountain.pos_x - 80, mountain.pos_y + 200, mountain.pos_x - 20, mountain.pos_y + 100);
		// illustrate snow 
		stroke(255);
		strokeWeight(10);
		point(mountain.pos_x - 20, mountain.pos_y + 80);
		point(mountain.pos_x + 10, mountain.pos_y + 80);
		point(mountain.pos_x - 30, mountain.pos_y + 70);
		point(mountain.pos_x + 20, mountain.pos_y + 70);
		point(mountain.pos_x + 13, mountain.pos_y + 90);
		point(mountain.pos_x - 30, mountain.pos_y + 90);
		strokeWeight(0);
		stroke(0);
	}
}

// Function to draw trees objects.
function drawTrees() {
	for (var tree_x of trees_x) {
		fill(139, 69, 19);
		rect(tree_x + 30, trees_y + 40, 30, 52);
		fill(0, 100, 0);
		triangle(tree_x, trees_y + 40, tree_x + 90, trees_y + 40, tree_x + 45, trees_y - 10);
		fill(34, 139, 34);
		triangle(tree_x + 10, trees_y, tree_x + 80, trees_y, tree_x + 45, trees_y - 50);
	}
}


// ---------------------------------
// Canyon render and check functions
// ---------------------------------
// Function to draw canyon objects.
function drawCanyon(t_canyon) {
	fill(160, 82, 45);
	rect(t_canyon.pos_x, t_canyon.pos_y, 100, 200);
	fill(100, 155, 255);
	rect(t_canyon.pos_x + 10, t_canyon.pos_y, 80, 200);
	// illustrate wind
	stroke(255);
	beginShape();
	strokeWeight(1);
	vertex(t_canyon.pos_x + 30, t_canyon.pos_y + 10);
	vertex(t_canyon.pos_x + 70, t_canyon.pos_y + 30);
	vertex(t_canyon.pos_x + 30, t_canyon.pos_y + 50);
	vertex(t_canyon.pos_x + 70, t_canyon.pos_y + 70);
	vertex(t_canyon.pos_x + 30, t_canyon.pos_y + 90);
	vertex(t_canyon.pos_x + 70, t_canyon.pos_y + 110);
	endShape();
	noStroke();
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon) {
	if (t_canyon.pos_x < gameChar_world_x && gameChar_world_x < t_canyon.pos_x + 80 && gameChar_y >= t_canyon.pos_y)
	{
		isPlummeting = true;
	}
	
	if (isPlummeting)
	{
		gameChar_y += 2;
        fallSound.play();
	}
}

// ----------------------------------
// Flag render and check functions
// ----------------------------------
// Function to draw and render flags.
function renderFlagpole()
{
	push();
	strokeWeight(5);
	stroke(180);
	line(flagpole.pos_x, floorPos_y, flagpole.pos_x, floorPos_y - 250);
	fill(255, 0, 255);
	noStroke();
	
	if (flagpole.isReached)
	{
		rect(flagpole.pos_x, floorPos_y - 250, 50, 50);
	} 
	else
	{
		rect(flagpole.pos_x, floorPos_y - 50, 50, 50);
	}
	pop();
}

// Function to check wether or not character has goal.
function checkFlagpole()
{
	var d = abs(gameChar_world_x - flagpole.pos_x);
	
	if (d < 15)
	{
		flagpole.isReached = true;
	}
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------
// Function to draw collectable objects.
function drawCollectable(t_collectable) {
	fill(0, 255, 0);
	ellipse(t_collectable.pos_x, t_collectable.pos_y, t_collectable.size + 20, t_collectable.size + 20);
	fill(0, 0, 255);
	ellipse(t_collectable.pos_x, t_collectable.pos_y, t_collectable.size, t_collectable.size);
	fill(255, 0, 0);
	ellipse(t_collectable.pos_x, t_collectable.pos_y, t_collectable.size - 10, t_collectable.size - 10);
	fill(255, 255, 255);
	triangle(
		t_collectable.pos_x, t_collectable.pos_y - 10,
		t_collectable.pos_x + 7, t_collectable.pos_y + 5,
		t_collectable.pos_x - 7, t_collectable.pos_y + 5);
	stroke(255);
}

// Function to check character has collected an item.
function checkCollectable(t_collectable) {
	if (dist(gameChar_world_x, gameChar_y, t_collectable.pos_x, t_collectable.pos_y + 25) < 20) {
		t_collectable.isFound = true;
		game_score += 1;
        getItemSound.play();
	}
}

// ----------------------------------
// Lives render and check functions
// ----------------------------------
// Function to draw lives.
function drawLives(t_heart)
{
	fill(255, 0, 0);
	beginShape();
	vertex(t_heart.pos_x, t_heart.pos_y);
	bezierVertex(t_heart.pos_x - t_heart.size / 2, t_heart.pos_y - t_heart.size / 2, t_heart.pos_x - t_heart.size, t_heart.pos_y + t_heart.size / 3, t_heart.pos_x, t_heart.pos_y + t_heart.size);
	bezierVertex(t_heart.pos_x + t_heart.size, t_heart.pos_y + t_heart.size / 3, t_heart.pos_x + t_heart.size / 2, t_heart.pos_y - t_heart.size / 2, t_heart.pos_x, t_heart.pos_y);
	endShape(CLOSE);
}

// Function to check character's lives.
function checkPlayerDie()
{
	if (gameChar_y > floorPos_y + 70)
	{
		lives -= 1;
		
		if (lives > 0)
		{
			startGame();
		}
	}
}

// function to draw platforms
function drawPlatform(t_platform)
{
	stroke(0);
	fill(255, 255, 0);
	rect(t_platform.pos_x, t_platform.pos_y, t_platform.width, t_platform.height);
}

function checkContact(gc_x, gc_y, t_platform) {
	if (gc_x > t_platform.pos_x && gc_x < t_platform.pos_x + t_platform.width) {
	  const d = t_platform.pos_y - gc_y;

	  if (d < 5 && d >= 0) {
		return true;
	  }
	}

	return false;
}

function startGame()
{
	gameChar_x = width / 2;
	gameChar_y = floorPos_y;
	
	// Variable to control the background scrolling.
	scrollPos = 0;
	cloudScrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// ---------------------
	// Initialise arrays of scenery objects.
	// ---------------------
	// trees
	trees_x = [-400, -200, 100, 300, 600, 700, 750, 1100, 1800];
	trees_y = height / 2 + 52;

	//clouds
	clouds = [
		{ pos_x: -100, pos_y: 150 },
		{ pos_x:  200, pos_y: 200 },
		{ pos_x:  600, pos_y: 100 },
		{ pos_x:  800, pos_y: 200 },
		{ pos_x: 1200, pos_y:  90 },
		{ pos_x: 1400, pos_y: 200 },
		{ pos_x: 1800, pos_y: 100 },
	];

	// mountain
	mountains = [
		{ pos_x: -200, pos_y: 200 },
		{ pos_x:  600, pos_y: 200 },
		{ pos_x: 1000, pos_y: 200 },
		{ pos_x: 1200, pos_y: 200 },
		{ pos_x: 2000, pos_y: 200 },
	];

	//canyons
	canyons = [
		{ pos_x:  900, pos_y: floorPos_y },
		{ pos_x: 1500, pos_y: floorPos_y },
		{ pos_x: 1700, pos_y: floorPos_y },
	];

	//collectable
	collectables = [
		{ pos_x: -200, pos_y: height / 2 + 125, size: 20, isFound: false },
		{ pos_x:  390, pos_y: height / 2 + 125, size: 20, isFound: false },
		{ pos_x:  820, pos_y: height / 2 + 125, size: 20, isFound: false },
		{ pos_x: 1020, pos_y: height / 2 + 125, size: 20, isFound: false },
		{ pos_x: 1220, pos_y: height / 2 + 125, size: 20, isFound: false },
		{ pos_x: 1820, pos_y: height / 2 + 125, size: 20, isFound: false },
	];
	
	game_score = 0;
	
	flagpole = {
		isReached: false,
		pos_x: 2000,
	};
		
	hearts = [
		{ pos_x: 30, pos_y: 40, size: 20 },
		{ pos_x: 60, pos_y: 40, size: 20 },
		{ pos_x: 90, pos_y: 40, size: 20 },
	];

	platforms = [
		{ pos_x: 300, pos_y: floorPos_y - 50,  width: 100, height: 20},
		{ pos_x: 350, pos_y: floorPos_y - 100, width: 50, height: 20},
		{ pos_x: 400, pos_y: floorPos_y - 150, width: 50, height: 20},
	]
}
