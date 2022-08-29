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

var trees;
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

var platforms;
var enemies;

var isGameOver;
var isGoal;

var emit;
var emitContainer;

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
	// fill the sky blue
	background(135, 206, 250); 
	noStroke();

	// draw some green ground
	fill(0, 155, 0);
	rect(0, floorPos_y, width, height / 4); 
	fill(139, 69, 19);
	rect(0, floorPos_y + 20, width, height);

	// Implement scrolling for clouds (clouds scrolling effect)
	push();
	translate(cloudScrollPos, 0); 

	// Draw clouds.
	for (var i = 0; i < clouds.length; i++)
	{
		clouds[i].draw();
	}
	pop();
	
	// Implement scrolling for other objects (base scrolling effect)
	push();
	translate(scrollPos, 0); 

	// Draw mountains
	for (var i = 0; i < mountains.length; i++)
	{
		mountains[i].draw();
	}

	// Draw trees.
	for (var i = 0; i < trees.length; i++)
	{
		trees[i].draw();
	}

	// Draw canyons.
	for (var i = 0; i < canyons.length; i++)
	{
		canyons[i].draw();
		canyons[i].checkCanyon();
	}

	// Draw collectable items.
	for (var i = 0; i < collectables.length; i++) {
		if (collectables[i].isFound == false)
		{
			collectables[i].draw();
			collectables[i].checkCollectable();
		}
	}

	// draw platform
	for (var i = 0; i < platforms.length; i++)
	{
		platforms[i].draw();
	}

	// Draw flag
	renderFlagpole();

	// Draw particle
	for (var i = 0; i < emitContainer.length; i++)
    {
      noStroke();
      emitContainer[i].updateParticles();
    }

	// draw enemies
	for (var i = 0; i < enemies.length; i++)
	{
		enemies[i].draw();

		var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);

		if (isContact)
		{
			if (lives > 0)
			{
				lives -= 1;
				startGame();
				break;
			} 
		}
	}

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
		hearts[i].draw();
	}
	
	// Check player's lives
	checkPlayerDie();

	// Logic to express player has game over
	if (lives < 1)
	{
		// Draw game over background
		fill(220, 20, 60, 170);
		rect(0, 0, width, height);

		// Draw game over text
		textStyle(ITALIC);
		fill(25, 25, 112);
		textSize(60);
		text("Game over!", width / 4 + 140, height / 2);

		fill(255);
		textSize(30);
		text("Press space to continue.", width / 4 + 120, height / 2 + 100);

		isGameOver = true;
		return;
	}
	
	// Logic to express player has goal
	if (flagpole.isReached)
	{
		// Draw goal background
		fill(25, 25, 112, 200);
		rect(0, 0, width, height);

		// Draw goal text
		textStyle(ITALIC);
		fill(255, 255, 0);
		textSize(40);
		text(" Level complete!! You get " + game_score + " points", width / 4 - 50, height / 2);

		fill(255);
		textSize(30);
		text("Press space to continue.", width / 4 + 130, height / 2 + 100);

		isGoal = true;
		return;
	}

	// Logic to make the game character move or the background scroll.
	if (isLeft) {
		if (gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
			cloudScrollPos += 2;
		}
	}

	if (isRight) {
		if (gameChar_x < width * 0.8)
		{
			gameChar_x += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
			cloudScrollPos -= 2;
		}
	}

	// Logic to make the game character rise and fall.
	// add falling code
	if (gameChar_y < floorPos_y)
	{
		var isContact = false;
		for (var i = 0; i < platforms.length; i++)
		{
			if (platforms[i].checkContact(gameChar_world_x, gameChar_y))
			{
			  isContact = true;
			  isFalling = false;
			  gameChar_y = platforms[i].y;
			  break;
		  	}
		}

		if(!isContact)
		{
			isFalling = true;
			gameChar_y += 3;
		} 
	} 
	else
	{
		isFalling = false;
	}
	
	// Check wether character has goal or not
	if (flagpole.isReached == false)
	{
		checkFlagpole();
	}

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	console.log(gameChar_world_x);
}


// ---------------------
// Key control functions
// ---------------------
function keyPressed() {
	if (keyCode == 37)
	{
		console.log("left arrow");
		isLeft = true;
	}

	if (keyCode == 39)
	{
		console.log("right arrow");
		isRight = true;
	}

	if (!isFalling)
	{ 
		if (keyCode == 32)
		{
			console.log("flying");
			gameChar_y -= 130;
			jumpSound.play();
		}
	}

	if (keyCode == 32 && isGameOver || isGoal)
	{
		setup();
	}
}

function keyReleased() {
	if (keyCode == 37)
	{
		console.log("left arrow");
		isLeft = false;
	}
	else if (keyCode == 39)
	{
		console.log("right arrow");
		isRight = false;
	}
}

// ------------------------------
// Game character render function
// ------------------------------
// Function to draw the game character.
function drawGameChar() {
	if (isLeft && isFalling)
	{
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
	else if (isRight && isFalling)
	{   // jumping-right
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
	else if (isLeft)
	{   // walking left
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
	else if (isRight)
	{	// walking right
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
	else if (isFalling || isPlummeting)
	{	// jumping facing forwards
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
	else
	{ // standing front facing
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

function Tree(x, y)
{
	this.x = x;
	this.y = y;
	
	// Function to draw trees objects
	this.draw = function()
	{
		// Draw trunk
		fill(139, 69, 19);
		rect(this.x + 30, this.y + 40, 30, 52);
		
		// Draw trunk shadow
		fill(0, 80);
		rect(this.x + 30, this.y + 40, 5, 52);
		rect(this.x + 34, this.y + 40, 26, 3);
		
		// Draw leaf
		fill(0, 100, 0);
		triangle(this.x, this.y + 40, this.x + 90, this.y + 40, this.x + 45, this.y - 10);
		fill(34, 139, 34);
		triangle(this.x + 10, this.y, this.x + 80, this.y, this.x + 45, this.y - 50);
		
		//Draw leaf shadow
		fill(0, 80);
		triangle(this.x, this.y + 40, this.x + 90, this.y + 40, this.x + 45, this.y - 10);
		fill(0, 80);
		triangle(this.x + 10, this.y, this.x + 80, this.y, this.x + 45, this.y - 50);
		
		// Draw leaf(Overwrite)
		fill(0, 100, 0);
		triangle(this.x + 10, this.y + 35, this.x + 85, this.y + 35, this.x + 50, this.y - 10);
		fill(34, 139, 34);
		triangle(this.x + 20, this.y - 5, this.x + 80, this.y - 5, this.x + 45, this.y - 50);
	}
	
}

function Cloud(x, y) 
{
	this.x = x;
	this.y = y;

	// Function to draw cloud objects.
	this.draw = function()
	{
		// Draw clouds shadow
		fill(105, 105, 105, 120);
		ellipse(this.x - 65, this.y + 15, 100,  70);
		ellipse(this.x,      this.y + 15, 130, 110);
		ellipse(this.x + 50, this.y + 15, 100,  70);

		//Draw main clouds
		fill(255, 255, 255);
		ellipse(this.x - 60, this.y + 10, 100, 70);
		ellipse(this.x,      this.y + 10, 130, 110);
		ellipse(this.x + 60, this.y + 10, 100, 70);
	}
}

function Mountain(x, y)
{
	this.x = x;
	this.y = y;

	// Function to draw mountains objects
	this.draw = function()
	{
		// Dran main mountain
		fill(100, 100, 100);
		triangle(this.x, this.y, this.x - 150, this.y + 232, this.x + 150, this.y + 232);
		fill(255, 255, 255);
		triangle(this.x - 52, this.y + 80, this.x, this.y, this.x + 52, this.y + 80);
		fill(100, 100, 100);
		triangle(this.x - 90, this.y + 200, this.x - 20, this.y + 60, this.x + 50, this.y + 100);
		triangle(this.x + 50, this.y + 100, this.x + 10, this.y + 40, this.x - 10, this.y + 100);
		stroke(0);
	
		// illustrate snow 
		stroke(255);
		strokeWeight(10);
		point(this.x - 20, this.y + 80);
		point(this.x + 10, this.y + 80);
		point(this.x - 30, this.y + 70);
		point(this.x + 20, this.y + 70);
		point(this.x + 13, this.y + 90);
		point(this.x - 30, this.y + 90);
		strokeWeight(0);
		stroke(0);
	
		// Draw mountain's shadow
		fill(0, 80);
		triangle(this.x, this.y, this.x - 150, this.y + 232, this.x - 50, this.y + 232);
	}
}

function Canyon(x, y, width)
{
	this.x = x;
	this.y = y;
	this.width = width;

	// Function to draw canyon objects.
	this.draw = function()
	{
		// dran main canyon
		fill(160, 82, 45);
		rect(this.x, this.y, 100, 200);
		fill(100, 155, 255);
		rect(this.x + 10, this.y, this.width, 200);

		// illustrate wind
		stroke(255);
		beginShape();
		strokeWeight(1);
		vertex(this.x + 30, this.y + 10);
		vertex(this.x + 70, this.y + 30);
		vertex(this.x + 30, this.y + 50);
		vertex(this.x + 70, this.y + 70);
		vertex(this.x + 30, this.y + 90);
		vertex(this.x + 70, this.y + 110);
		endShape();
		noStroke();
	}

	// Function to check character is over a canyon.
	this.checkCanyon = function()
	{
		if (this.x < gameChar_world_x && gameChar_world_x < this.x + 80 && gameChar_y >= this.y)
		{
			isPlummeting = true;
		}
		
		if (isPlummeting)
		{
			gameChar_y += 2;
			fallSound.play();
		}
	}
}


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
		triangle(flagpole.pos_x, floorPos_y - 250, flagpole.pos_x - 50, floorPos_y - 250, flagpole.pos_x, floorPos_y - 200);
	} 
	else
	{
		triangle(flagpole.pos_x, floorPos_y - 40, flagpole.pos_x + 50, floorPos_y - 40, flagpole.pos_x, floorPos_y);
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


function Collectable(x, y, size, isFound)
{
	this.x = x;
	this.y = y;
	this.size = size;
	this.isFound = isFound;

	// Function to draw collectable.
	this.draw = function()
	{
		fill(0, 255, 0);
		ellipse(this.x, this.y, this.size + 20, this.size + 20);
		fill(0, 0, 255);
		ellipse(this.x, this.y, this.size, this.size);
		fill(255, 0, 0);
		ellipse(this.x, this.y, this.size - 10, this.size - 10);
		fill(255, 255, 255);
		triangle(
			this.x, this.y - 10,
			this.x + 7, this.y + 5,
			this.x - 7, this.y + 5);
		stroke(255);
	}

	// Function to check character has collected an item.	
	this.checkCollectable = function()
	{
		if (dist(gameChar_world_x, gameChar_y, this.x, this.y + 25) < 20)
		{
			this.isFound = true;
			game_score += 1;
			getItemSound.play();
		}
	}
}

function Live(x, y, size)
{
	this.x = x;
	this.y = y;
	this.size = size;

	// Function to draw lives.
	this.draw = function()
	{
		fill(255, 0, 0);
		beginShape();
		vertex(this.x, this.y);
		bezierVertex(this.x - this.size / 2, this.y - this.size / 2, this.x - this.size, this.y + this.size / 3, this.x, this.y + this.size);
		bezierVertex(this.x + this.size, this.y + this.size / 3, this.x + this.size / 2, this.y - this.size / 2, this.x, this.y);
		endShape(CLOSE);
	}
}

// Function to check character's lives.
function checkPlayerDie()
{
	if (gameChar_y > floorPos_y + 70)
	{
		lives -= 1;
		startGame();
		return;
	}
}

function Platform(x, y, width, height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	// Function to draw platforms
	this.draw = function()
	{
		// Main platform
		noStroke();
		fill(130, 69, 39);
		rect(this.x, this.y, this.width, this.height, 3);
		fill(0, 80);
		rect(this.x + this.width * 0.2, this.y + 5, 10, 10);
		rect(this.x + this.width * 0.6, this.y + 5, 10, 10);
		
		// Platform shadow
		fill(0, 0, 0, 50);
		rect(this.x, this.y, 5, this.height, 1);
		rect(this.x + this.width - 5, this.y, 5, this.height, 1);
		rect(this.x + 5, this.y + this.height - 5, this.width - 10, 5, 1);
		rect(this.x + 5, this.y, this.width - 10, 5, 1);
	}

	// Function to check contact with platform
	this.checkContact = function(gc_x, gc_y) 
	{
		if (gc_x > this.x && gc_x < this.x + this.width)
		{
			const d = this.y - gc_y;
			if (d < 5 && d >= 0)
			{
				return true;
			}
		}
	}
	return false;
}


function Enemy(x, y, range, color)
{
	this.x = x;
	this.y = y;
	this.range = range;
	this.color = color;

	this.currentX = x;
	this.inc = 1;

	// Update enemy's position
	this.update = function()
	{
		this.currentX += this.inc;

		if (this.currentX >= this.x + this.range)
		{
			this.inc = - 1;
		}
		else if (this.currentX < this.x)
		{
			this.inc = 1;
		}
	}

	// Draw enemy
	this.draw = function()
	{
		this.update();
		fill(color[0], color[1], color[2]);
		ellipse(this.currentX, this.y, 30);
		fill(0);
		ellipse(this.currentX - 5, this.y, 5);
		ellipse(this.currentX + 5, this.y, 5);
	}

	// Function to cheeck to contact with enemy
	this.checkContact = function(gc_x, gc_y)
	{
		var d = dist(gc_x, gc_y, this.currentX, this.y);
		
		if(d < 20)
		{
			return true;
		}

		return false;
	}
}

function Particle(x, y, xSpeed, ySpeed, size, color)
{
  this.x = x;
  this.y = y;
  this.xSpeed = xSpeed;
  this.ySpeed = ySpeed;
  this.size = size;
  this.color = color;
  this.age = 0;
  
  // Function to draw particle
  this.drawParticle = function()
  {
    fill(this.color);
    ellipse(this.x, this.y, this.size);
  }
  
  // Function to update particle
  this.updateParticle = function()
  {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.age++;
  }
}

function Emitter(x, y, xSpeed, ySpeed, size, color)
{
  this.x = x;
  this.y = y;
  this.xSpeed = xSpeed;
  this.ySpeed = ySpeed;
  this.size = size;
  this.color = color;
  
  this.startParticle = 0;
  this.lifetime = 0;
  
  this.particles = [];
  
  // Function to set particle
  this.addParticles = function()
  {
      var p = new Particle
      (
        random(this.x - 10, this.x + 10), 
        random(this.y - 10, this.y + 10), 
        random(this.xSpeed - 1, this.xSpeed + 1), 
        random(this.ySpeed - random(1, 5), this.ySpeed + 1), 
        random(this.size - 4, this.size + 4), 
        this.color
      );
    
    return p;
  }
  
  // Function to initialze partile
  this.startEmitter = function(startParticle, lifetime)
  {
    this.startParticle = startParticle;
    this.lifetime = lifetime;
    
    // start emmitter with initial particles
    for(var i =0; i < startParticle; i++)
    {
      this.particles.push(this.addParticles());
    }
  }
  
  // Function to update particle
  this.updateParticles = function()
  {
    var deadParticles = 0
    for (var i = this.particles.length - 1; i >= 0; i--)
    {
      this.particles[i].drawParticle();
      this.particles[i].updateParticle();
      if (this.particles[i].age > random(0, this.lifetime))
      {
        this.particles.splice(i, 1);
        deadParticles++;
      }
    }
    
    if (deadParticles > 0)
      {
        for(var i = 0; i < deadParticles; i++)
          {
            this.particles.push(this.addParticles());
          }
      }
  }
  
}


// Initialise game Information
function startGame()
{
	gameChar_x = width / 2;
	gameChar_y = floorPos_y;
	
	// Variable to control the background scrolling.
	scrollPos = 0;
	cloudScrollPos = 0;
	game_score = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isGoal = false;
	isRight = false;
	isFalling = false;
	isGameOver = false;
	isPlummeting = false;

	// ---------------------
	// Initialise arrays of scenery objects.
	// ---------------------
	flagpole = {
		isReached: false,
		pos_x: 2500,
	};

	// trees
	trees = [];
	trees.push(new Tree(-400, height / 2 + 52));
	trees.push(new Tree(-200, height / 2 + 52));
	trees.push(new Tree( 100, height / 2 + 52));
	trees.push(new Tree( 300, height / 2 + 52));
	trees.push(new Tree( 600, height / 2 + 52));
	trees.push(new Tree( 700, height / 2 + 52));
	trees.push(new Tree( 750, height / 2 + 52));
	trees.push(new Tree(1100, height / 2 + 52));
	trees.push(new Tree(1800, height / 2 + 52));

	//clouds
	clouds = [];
	clouds.push(new Cloud(-100, 150));
	clouds.push(new Cloud( 200, 200));
	clouds.push(new Cloud( 600, 100));
	clouds.push(new Cloud(1200, 200));
	clouds.push(new Cloud(1400, 90));
	clouds.push(new Cloud(1800, 200));
	clouds.push(new Cloud(1900, 150));

	// mountain
	mountains = [];
	mountains.push(new Mountain(-200, 200));
	mountains.push(new Mountain( 600, 200));
	mountains.push(new Mountain(1000, 200));
	mountains.push(new Mountain(1200, 200));
	mountains.push(new Mountain(2100, 200));
	mountains.push(new Mountain(2200, 200));

	//canyons
	canyons = [];
	canyons.push(new Canyon(-500, floorPos_y, 80));
	canyons.push(new Canyon( 900, floorPos_y, 80));
	canyons.push(new Canyon(1500, floorPos_y, 80));
	canyons.push(new Canyon(1700, floorPos_y, 80));

	//collectable
	collectables = [];
	collectables.push(new Collectable(-200, floorPos_y - 20,  20, false));
	collectables.push(new Collectable( 390, floorPos_y - 20,  20, false));
	collectables.push(new Collectable( 640, floorPos_y - 220, 20, false));
	collectables.push(new Collectable( 800, floorPos_y - 20,  20, false));
	collectables.push(new Collectable( 955, floorPos_y - 150, 20, false));
	collectables.push(new Collectable(1220, floorPos_y - 20,  20, false));
	collectables.push(new Collectable(1820, floorPos_y - 20,  20, false));

	hearts = [];
	hearts.push(new Live(30, 40, 20));
	hearts.push(new Live(60, 40, 20));
	hearts.push(new Live(90, 40, 20));

	platforms = [];
	platforms.push(new Platform(250,  floorPos_y - 50,  100, 20));
	platforms.push(new Platform(350,  floorPos_y - 100, 100, 20));
	platforms.push(new Platform(400,  floorPos_y - 150, 100, 20));
	platforms.push(new Platform(580,  floorPos_y - 200, 100, 20));
	platforms.push(new Platform(800,  floorPos_y - 80,  50,  20));
	platforms.push(new Platform(932,  floorPos_y - 130, 50,  20));
	platforms.push(new Platform(1030, floorPos_y - 80,  100, 20));
	platforms.push(new Platform(1330, floorPos_y - 80,  100, 20));

	enemies = [];
	enemies.push(new Enemy(100,  floorPos_y - 15, 100, [255, 200, 100]));
	enemies.push(new Enemy(800,  floorPos_y - 15, 100, [100, 200,  10]));
	enemies.push(new Enemy(1400, floorPos_y - 15, 100, [200, 200,  10]));

	emitContainer = [];  
	emitContainer.push(new Emitter(955,  height, 0, -1, 10, color(224, 255, 255, 80)));
	emitContainer.push(new Emitter(1550, height, 0, -1, 10, color(224, 255, 255, 80)));
	emitContainer.push(new Emitter(1750, height, 0, -1, 10, color(224, 255, 255, 80)));
	for (var i = 0; i < emitContainer.length; i++)
	{
		emitContainer[i].startEmitter(500, 100);
	}
}



/**
 * 
 * 
 * todo
 *  - update game charator              | 
 *  - refactor the code to constractor  | done
 *  - resarch how to restart            | done
 *  - add shadow tree                   | done
 *  - add shadow mountain               | done
 *  - update background (add effect)    | 
 *  - update object position            | 
 */
