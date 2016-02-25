console.log = function () {};

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function testCollisionRect(rect1, rect2) {
	return rect1.x <= rect2.x + rect2.width
	&& rect2.x <= rect1.x + rect1.width
	&& rect1.y <= rect2.y + rect2.height
	&& rect2.y <= rect1.y + rect1.height;
}

function changeNicknames(event) {
	players[0].name = document.getElementById('player1').value;
	players[1].name = document.getElementById('player2').value;
	return false;
}

window.onload = function () {

	var canvas = document.getElementById('canvas'),
		ctx = canvas.getContext('2d'),
		WIDTH = 700,
		HEIGHT = 500,
		BORDER = 20,
		GAMEOVER = false,
		entities = [],				// all draw methods to call them once
		loopInterval = false,
		winner = 0,
		loser = 0;
		
	// loading images
	bg_image = new Image();
	bg_image.src = 'img/bg-space.jpg';
	ball_image = new Image();
	ball_image.src = 'img/ball.png';
	heart_image = new Image();
	heart_image.src = 'img/heart.png';

	canvas.width = WIDTH;
	canvas.height = HEIGHT;	

	
	
	// -----------------------------------------------------------
	// Background class
	function Background(style) {
		this.style = style;
		this.update = function () {
			// console.log('updating background...');	
		}
		this.draw = function () {		
    		ctx.drawImage(bg_image, 0, 0, WIDTH, HEIGHT);  			
		}
	}	

	var bg = new Background('black');
	// -----------------------------------------------------------

	// -----------------------------------------------------------	
	// Ball class
	function Ball(style, x, y, width, height, spdX, spdY) {

		this.style = style;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.spdX = spdX;
		this.spdY = spdY;

		/**
		 * update 
		 * movment and solving out of bounds
		 * @return {void}
		 */
		this.update = function () {

			this.x += this.spdX;
			this.y += this.spdY;

			if(this.x >= WIDTH - BORDER || this.x <= 0) {
				this.spdX = -this.spdX;
			}
			if(this.y >= HEIGHT - BORDER || this.y <= 0) {
				this.spdY = -this.spdY;		
			}

			if(testCollisionRect(ball, players[0]) || testCollisionRect(ball, players[1])) {
				this.spdX = -this.spdX;
				console.log('colision...');
			}

		}

		/**
		 * draw
		 * @return {[type]} [description]
		 */
		this.draw = function () {
			ctx.drawImage(ball_image,this.x, this.y, this.width, this.height);  	
		}

	}

	var ball = new Ball('white', WIDTH/2, HEIGHT/2, 15, 15, 10, 10);
	// -----------------------------------------------------------

	// -----------------------------------------------------------	
	// Player class
	function Player(name, style, side, key_up, key_down) {

		this.name = name;
		this.style = style;
		this.width = 10;
		this.height = 100;
		this.side = side;
		this.x = (side === 'left') ? 10 : WIDTH - 20;
		this.y = HEIGHT / 2 - (this.height / 2); // centralized
		this.key_up = key_up;
		this.key_down = key_down;
		this.lives = 3;
		this.score = 0;

		this.update = function () {
		}

		this.draw = function () {
			ctx.fillStyle = this.style;
			ctx.font = '16px Arial';
			ctx.fillRect(this.x, this.y, this.width, this.height);

			ctx.fillStyle = style;
			if(this.side === 'left') {				
				ctx.fillText(this.name, 100, 50);	
				ctx.fillText('Score: ' + this.score, 100, 75);
				pos = 0;
				for (var i = 0; i < this.lives; i++) {
					ctx.drawImage(heart_image, 95 + pos, 85, 30, 30);  	
					pos += 30;
				}
			}
			else {
				ctx.fillText(this.name, WIDTH - 200, 50);
				ctx.fillText('Score: ' + this.score, WIDTH - 200, 75);
				pos = 0;
				for (var i = 0; i < this.lives; i++) {
					ctx.drawImage(heart_image, WIDTH - (145 + pos),  85, 30, 30);  	
					pos += 30;
				}
			}

		}
	}

	players = [ 
		new Player('Player1', 'yellow', 'left', 87, 83),
		new Player('Player2', 'yellow', 'right', 38, 40)
	];
	// -----------------------------------------------------------	

	// -----------------------------------------------------------
	// keyup
	document.addEventListener('keyup', function(event) {
		if(!loopInterval || GAMEOVER) return;
		players.forEach(function(value, index) {
			if(value.key_up === event.which) {
				console.log(players[index]);
				if(players[index].y >= 0) {
					players[index].y -=  50;
					players[index].update();
					players[index].draw();					
				}
			}
		});
	}); 

	// keydown
	document.addEventListener('keydown', function(event) {
		if(!loopInterval || GAMEOVER) return;
		players.forEach(function(value, index) {
			if(value.key_down === event.which) {
				if(players[index].y <= HEIGHT - 150) {
					console.log(players[index]);
					players[index].y +=  50;
					players[index].update();
					players[index].draw();
				}
			}
		});
	}); 

	// space = pause
	canvas.addEventListener('click', function(event) {

		// space
		if(GAMEOVER) {
			ball.x = WIDTH / 2;
			ball.y = HEIGHT / 2;				
			loopInterval = setInterval(gameLoop, 40);		
			GAMEOVER = false;
			return;
		}
		// pause
		if(loopInterval) {
			ctx.save();
			ctx.font = '20px Arial'; 
			ctx.fillStyle = 'white';
			ctx.fillText('PAUSE', WIDTH / 2 - 30, HEIGHT / 2);
			ctx.restore();
			clearInterval(loopInterval);	
			loopInterval = false;		
		}
		else {				
			loopInterval = setInterval(gameLoop, 40);		
		}			
	});

	// prevent mouse right click
	window.oncontextmenu = function (event) {
		// event.preventDefault();
	}
	// -----------------------------------------------------------	

	// -----------------------------------------------------------
	// game loop
	function gameLoop() {

		// bg
		bg.draw();

		// updating entities
		ball.update();
		ball.draw();

		// gameover?
		if(ball.x < players[0].x || ball.x > players[1].x - 10) {
			winner = (ball.x > WIDTH / 2) ? 0 : 1;	
			loser = (ball.x < WIDTH / 2) ? 0 : 1;	
			players[loser].lives--;

			if(!players[loser].lives) {
				ctx.save();
				ctx.font = '20px Arial';	
				ctx.fillStyle = 'white';
				ctx.fillText(players[winner].name+ ' is the winner! :)', WIDTH / 2 - 70, HEIGHT / 2);
				ctx.restore();
				players[0].lives = 3
				players[1].lives = 3
				players[winner].score++;
				GAMEOVER = true;
				clearInterval(loopInterval);
			}


			ball.x = WIDTH / 2;
			ball.y = HEIGHT / 2;				
		}

		// players
		for (var i = 0; i < players.length; i++) {
			players[i].update();
			players[i].draw();
		}		

	}
	// -----------------------------------------------------------

	// running
	loopInterval = setInterval(gameLoop, 40);
}
