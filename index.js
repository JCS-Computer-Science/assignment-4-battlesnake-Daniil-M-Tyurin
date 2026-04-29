
import express from "express";


const server = express();
server.use(express.json());
const config = {
	apiversion: "1",
	author: "Daniil_Tyurin", // TODO: Your Battlesnake Username
	color: "#000000", // TODO: Choose color
	head: "default", // TODO: Choose head, see https://play.battlesnake.com/customizations/ for options unlocked in your account
	tail: "default", // TODO: Choose tail, see https://play.battlesnake.com/customizations/ for options unlocked in your account
};

server.get("/", (req, res) => {
	//console.log(config);
	res.status(200).send(config);
})


server.post("/start", (req, res) => {
	//console.log(req.body.board);
	res.status(200).send();
	
})


server.post("/move", (req, res) => {

	//New code based on a heat map 

	let board = req.body.board
	let snakesArr = board.snakes
	let yourself = req.body.you
	let snakesOthers = snakesArr.filter(snake => snake.id != yourself.id);
	//Never eat soggy worms indexing (zero corresponds to up going clockwise);
	let possibleMoveArr = [
		1, 1, 1, 1
	];

	//Snake randomized movement just cuz, mostly for testing
	possibleMoveArr = possibleMoveArr.map(value => value * (Math.random() * 0.9 + 0.5));

	//Create a rudimentary flood fill function

	//Create a weighting that increases the desireability of food
	let distFoodArr = [];
	let foodArr = board.food;
	foodArr.forEach(food => {
		let distX = (food.x - yourself.head.x) ** 2
		let distY = (food.y - yourself.head.y) ** 2
		let dist = Math.sqrt(distX + distY);
		distFoodArr.push(dist)
	})
	let minFoodIndex = distFoodArr.indexOf(Math.min(...distFoodArr));
	let xFood = foodArr[minFoodIndex].x
	let yFood = foodArr[minFoodIndex].y

	//Testing on differing food weightings based on length and hunger
	if(yourself.length < 20){
		if (yourself.head.y < yFood){
			possibleMoveArr[0] = possibleMoveArr[0] * 10
		}
		if (yourself.head.y > yFood){
			possibleMoveArr[2] = possibleMoveArr[2] * 10
		}

		if (yourself.head.x < xFood){
			possibleMoveArr[1] = possibleMoveArr[1] * 10
		}
		if (yourself.head.x > xFood){
			possibleMoveArr[3] = possibleMoveArr[3] * 10
		}
	} else if (yourself.health < 40){
		if (yourself.head.x < xFood){
			possibleMoveArr[1] = possibleMoveArr[1] * 7
		}
		if (yourself.head.x > xFood){
			possibleMoveArr[3] = possibleMoveArr[3] * 7
		}
		if (yourself.head.y < yFood){
			possibleMoveArr[0] = possibleMoveArr[0] * 7
		}
		if (yourself.head.y > yFood){
			possibleMoveArr[2] = possibleMoveArr[2] * 7
		}
	} else {
		if (yourself.head.x < xFood){
			possibleMoveArr[1] = possibleMoveArr[1] * .5
		}
		if (yourself.head.x > xFood){
			possibleMoveArr[3] = possibleMoveArr[3] * .5
		}
		if (yourself.head.y < yFood){
			possibleMoveArr[0] = possibleMoveArr[0] * .5
		}
		if (yourself.head.y > yFood){
			possibleMoveArr[2] = possibleMoveArr[2] * .5
		}
	}
	
	//Check current collision with head
	snakesOthers.forEach(snake => {
		let head = snake.head;
		if ((head.x === yourself.head.x && (head.y === yourself.head.y + 1))){
			possibleMoveArr[0] = 0;
		}
		if (head.y === yourself.head.y && (head.x === yourself.head.x + 1) ){
			possibleMoveArr[1] = 0;
		}
		if (head.x === yourself.head.x && (head.y === yourself.head.y - 1)){
			possibleMoveArr[2] = 0;
		}
		if (head.y === yourself.head.y && (head.x === yourself.head.x - 1)){
			possibleMoveArr[3] = 0;
		}

		if (yourself.length >= snake.length + 1){
			if((head.x === yourself.head.x && (head.y - 1 === yourself.head.y + 1)) || (head.y === yourself.head.y + 1 && (head.x + 1 === yourself.head.x)) || (head.y === yourself.head.y + 1 && (head.x - 1 === yourself.head.x))){
				possibleMoveArr[0] = possibleMoveArr[0] * 50
			}
			if((head.y - 1 === yourself.head.y && (yourself.head.x + 1 === head.x)) || (yourself.head.x + 1 === head.x - 1 && (yourself.head.y === head.y)) || (yourself.head.y === head.y + 1 && (yourself.head.x + 1 === head.x))){
				possibleMoveArr[1] = possibleMoveArr[1] * 50
			}
			if((yourself.head.x === head.x + 1 && (yourself.head.y - 1 === head.y)) || (yourself.head.x === head.x && (yourself.head.y - 1 === head.y + 1)) || (yourself.head.x === head.x - 1 && (yourself.head.y - 1 === head.y))){
				possibleMoveArr[2] = possibleMoveArr[2] * 50
			}
			if((yourself.head.x - 1 === head.x && (yourself.head.y === head.y - 1)) || (yourself.head.x - 1 === head.x + 1 && (yourself.head.y === head.y)) || (yourself.head.y === head.y + 1 && (yourself.head.x - 1 === head.x))){
				possibleMoveArr[3] = possibleMoveArr[3] * 50
			}
		} else {
			if((head.x === yourself.head.x && (head.y - 1 === yourself.head.y + 1)) || (head.y === yourself.head.y + 1 && (head.x + 1 === yourself.head.x)) || (head.y === yourself.head.y + 1 && (head.x - 1 === yourself.head.x))){
				possibleMoveArr[0] = possibleMoveArr[0] * .005
			}
			if((head.y - 1 === yourself.head.y && (yourself.head.x + 1 === head.x)) || (yourself.head.x + 1 === head.x - 1 && (yourself.head.y === head.y)) || (yourself.head.y === head.y + 1 && (yourself.head.x + 1 === head.x))){
				possibleMoveArr[1] = possibleMoveArr[1] * .005
			}
			if((yourself.head.x === head.x + 1 && (yourself.head.y - 1 === head.y)) || (yourself.head.x === head.x && (yourself.head.y - 1 === head.y + 1)) || (yourself.head.x === head.x - 1 && (yourself.head.y - 1 === head.y))){
				possibleMoveArr[2] = possibleMoveArr[2] * .005
			}
			if((yourself.head.x - 1 === head.x && (yourself.head.y === head.y - 1)) || (yourself.head.x - 1 === head.x + 1 && (yourself.head.y === head.y)) || (yourself.head.y === head.y + 1 && (yourself.head.x - 1 === head.x))){
				possibleMoveArr[3] = possibleMoveArr[3] * .005
			}

		}


	});
	//hazard collision deterent
	if (board.hazards.length > 0 || board.hazards.length != null){
		board.hazards.forEach(hazard => {
			if(yourself.head.y + 1 === hazard.y && yourself.head.x === hazard.x){
				possibleMoveArr[0] = possibleMoveArr[0] * 0.001;
			}
			if(yourself.head.x + 1 === hazard.x && yourself.head.y === hazard.y){
				possibleMoveArr[1] = possibleMoveArr[1] * 0.001;
			}
			if(yourself.head.y - 1 === hazard.y && yourself.head.x === hazard.x){
				possibleMoveArr[2] = possibleMoveArr[2] * 0.001;
			}
			if(yourself.head.x -1 === hazard.x && yourself.head.y === hazard.y){
				possibleMoveArr[3] = possibleMoveArr[3] * 0.001;
			}
		});
	}
	
	
	//check collision with wals
	if(yourself.head.y + 1 >= board.height){
		possibleMoveArr[0] = 0;
	}
	if(yourself.head.x + 1 >= board.width){
		possibleMoveArr[1] = 0;
	}
	if(yourself.head.y - 1 < 0){
		possibleMoveArr[2] = 0;
	}
	if(yourself.head.x -1 < 0){
		possibleMoveArr[3] = 0;
	}
	//deter movement close to walls
	if(yourself.head.y + 1 >= board.height - 1){
		possibleMoveArr[0] = possibleMoveArr[0] * .3;
	}
	if(yourself.head.x + 1 >= board.width - 1){
		possibleMoveArr[1] = possibleMoveArr[1] * .3;
	}

	if(yourself.head.y + 1 >= board.height - 2){
		possibleMoveArr[0] = possibleMoveArr[0] * .8;
	}
	if(yourself.head.x + 1 >= board.width - 2){
		possibleMoveArr[1] = possibleMoveArr[1] * .8;
	}

	if(yourself.head.y - 1 < 2){
		possibleMoveArr[2] = possibleMoveArr[2] * .8;
	}
	if(yourself.head.x -1 < 2){
		possibleMoveArr[3] = possibleMoveArr[3] * .8;
	}

	if(yourself.head.y - 1 < 1){
		possibleMoveArr[2] = possibleMoveArr[2] * .3;
	}
	if(yourself.head.x -1 < 1){
		possibleMoveArr[3] = possibleMoveArr[3] * .3;
	}

	//Check collision with others
	snakesOthers.forEach(snake => {
		let body = snake.body;
		snake.body.pop();
		if (body.some(elemBody => elemBody.x === yourself.head.x && elemBody.y === yourself.head.y + 1)){
			possibleMoveArr[0] = 0;
		}
		if (body.some(elemBody => elemBody.y === yourself.head.y && elemBody.x === yourself.head.x + 1)){
			possibleMoveArr[1] = 0;
		}
		if (body.some(elemBody => elemBody.x === yourself.head.x && elemBody.y === yourself.head.y - 1)){
			possibleMoveArr[2] = 0;
		}
		if (body.some(elemBody => elemBody.y === yourself.head.y && elemBody.x === yourself.head.x - 1)){
			possibleMoveArr[3] = 0;
		}
	});

	//PATHFIND OTHER SNAKES (EVIIIIIL FUNCTIONNNN) HAHAHAH
	snakesOthers.forEach(snake => {
		if (yourself.length > snake.length + 1){
			if (yourself.head.y < snake.head.y){
				possibleMoveArr[0] = possibleMoveArr[0] * 8.5
			}
			if (yourself.head.y > snake.head.y){
				possibleMoveArr[2] = possibleMoveArr[2] * 8.5
			}

			if (yourself.head.x < snake.head.x){
				possibleMoveArr[1] = possibleMoveArr[1] * 8.5
			}
			if (yourself.head.x > snake.head.x){
				possibleMoveArr[3] = possibleMoveArr[3] * 8.5
			}
		}
	})

	//Check if collide with self
	yourself.body.pop();
	if (yourself.body.some(bodyElem => bodyElem.y === yourself.head.y + 1 && bodyElem.x === yourself.head.x)){
		possibleMoveArr[0] = 0;
	}
	if (yourself.body.some(bodyElem => bodyElem.x === yourself.head.x + 1 && bodyElem.y === yourself.head.y)){
		possibleMoveArr[1] = 0;
	}
	if (yourself.body.some(bodyElem => bodyElem.y === yourself.head.y - 1 && bodyElem.x === yourself.head.x)){
		possibleMoveArr[2] = 0;
	}
	if (yourself.body.some(bodyElem => bodyElem.x === yourself.head.x - 1 && bodyElem.y === yourself.head.y)){
		possibleMoveArr[3] = 0;
	}

	//Checks for two tunnel look ahead weighting of only one to be lowered

	let directions = [
		{x: yourself.head.x, y: yourself.head.y + 1},
		{x: yourself.head.x + 1, y: yourself.head.y},
		{x: yourself.head.x, y: yourself.head.y - 1},
		{x: yourself.head.x - 1, y: yourself.head.y}
	];
	// flood fill insert? Dont know how well it works
	//console.log(possibleMoveArr);


	function lookAhead(start, snakesArr, board){
		let visit = [];
		let count = 0;
		let needed = [start];
		//console.log(needed.length)
		while(needed.length > 0){
			let playing = needed.shift();
			//console.log(playing)
			if(playing.x < 0 || playing.x >= board.width || playing.y < 0 || playing.y >= board.height){
				continue;
			}
			if(visit.some(visited => visited.x === playing.x && visited.y === playing.y)){
				continue;
			}
			let isEdge = (playing.x === start.x && playing.y === start.y);
			if(!isEdge && snakesArr.some(snake => snake.body.some(body => body.x === playing.x && body.y === playing.y))){
				continue;
			}
			visit.push(playing);
			count = count + 1;
			needed.push({x: playing.x, y: playing.y + 1});
			needed.push({x: playing.x + 1, y: playing.y});
			needed.push({x: playing.x, y: playing.y - 1});
			needed.push({x: playing.x - 1, y: playing.y});
		}
		//console.log(count)
		return count;
	}







	directions.forEach((direct, i) => {
		if (possibleMoveArr[i] === 0){
			return;
		}
		let copySnakeArr = snakesArr.map(snake =>{
			return{
				id:snake.id,
				body: snake.body.slice(),
			}
		});
		let me = copySnakeArr.find(snake => snake.id === yourself.id);
		me.body.unshift({x: direct.x, y: direct.y});
		me.body.pop();
		copySnakeArr.forEach(snake => {
			snake.body.pop();
		});
		let spaceValue = lookAhead(direct, copySnakeArr, board);
		//console.log(spaceValue)

		if (spaceValue < yourself.length){
			possibleMoveArr[i] = possibleMoveArr[i] * 0.000001;
			return;
		}
		possibleMoveArr[i] = possibleMoveArr[i] * spaceValue;
		//console.log("spaceValue:", spaceValue);
	});






		// if (possibleMoveArr[i] === 0){
		// 	return;
		// }
		// let available = 0;
		// if(direct.y + 1 < board.height && !snakesArr.some(snake => snake.body.some(body => body.x === direct.x && body.y === direct.y + 1))){
		// 	available = available + 1;
		// }

		// if(direct.x + 1 < board.width && !snakesArr.some(snake => snake.body.some(body => body.x === direct.x + 1&& body.y === direct.y))){
		// 	available = available + 1;
		// }

		// if(direct.y - 1 >= 0 && !snakesArr.some(snake => snake.body.some(body => body.x === direct.x && body.y === direct.y - 1))){
		// 	available = available + 1;
		// }

		// if(direct.x - 1 >= 0 && !snakesArr.some(snake => snake.body.some(body => body.x === direct.x - 1 && body.y === direct.y))){
		// 	available = available + 1;
		// }

		// if(available === 0){
		// 	possibleMoveArr[i] = 0;
		// } else if (available === 1) {
		// 	possibleMoveArr[i] = possibleMoveArr[i] * 0.01
		// } else if (available === 2) {
		// 	possibleMoveArr[i] = possibleMoveArr[i] * 0.02
		// }





	
	//choose movement
	let chosenMove;
	let moveIndex = possibleMoveArr.indexOf(Math.max(...possibleMoveArr));
	if (moveIndex === 0){
		chosenMove = "up";
	}
	if (moveIndex === 1){
		chosenMove = "right"
	}
	if (moveIndex === 2){
		chosenMove = "down"
	}
	if (moveIndex === 3){
		chosenMove = "left"
	}
	//console.log(board);
	console.log(possibleMoveArr);
	let move = {
		"move": chosenMove
	}
	res.status(200).send(move);
	//console.log(move);
});


server.post("/end", (req, res) => {
	res.status(200).send();
})

const host = "0.0.0.0";
const port = process.env.PORT || 8000;

server.listen(port, host, () => {
	console.log(`Running Battlesnake at http://${host}:${port}...`);
});

