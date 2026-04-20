
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
	if (yourself.head.y < yFood){
		possibleMoveArr[0] = possibleMoveArr[0] * 5
	}
	if (yourself.head.y > yFood){
		possibleMoveArr[2] = possibleMoveArr[2] * 5
	}

	if (yourself.head.x < xFood){
		possibleMoveArr[1] = possibleMoveArr[1] * 5
	}
	if (yourself.head.x > xFood){
		possibleMoveArr[3] = possibleMoveArr[3] * 5
	}
	//Check current collision with head
	snakesOthers.forEach(snake => {
		let head = snake.head;
		if ((head.x === yourself.head.x && (head.y === yourself.head.y + 1)) || (head.x === yourself.head.x && (head.y - 1 === yourself.head.y + 1)) || (head.y === yourself.head.y + 1 && (head.x + 1 === yourself.head.x)) || (head.y === yourself.head.y + 1 && (head.x - 1 === yourself.head.x))){
			possibleMoveArr[0] = 0;
		}
		if (head.y === yourself.head.y && (head.x === yourself.head.x + 1) || (head.y - 1 === yourself.head.y && (yourself.head.x + 1 === head.x)) || (yourself.head.x + 1 === head.x - 1 && (yourself.head.y === head.y)) || (yourself.head.y === head.y + 1 && (yourself.head.x + 1 === head.x)) ){
			possibleMoveArr[1] = 0;
		}
		if (head.x === yourself.head.x && (head.y === yourself.head.y - 1) || (yourself.head.x === head.x + 1 && (yourself.head.y - 1 === head.y)) || (yourself.head.x === head.x && (yourself.head.y - 1 === head.y + 1)) || (yourself.head.x === head.x - 1 && (yourself.head.y - 1 === head.y))){
			possibleMoveArr[2] = 0;
		}
		if (head.y === yourself.head.y && (head.x === yourself.head.x - 1) || (yourself.head.x - 1 === head.x && (yourself.head.y === head.y - 1)) || (yourself.head.x - 1 === head.x + 1 && (yourself.head.y === head.y)) || (yourself.head.y === head.y + 1 && (yourself.head.x - 1 === head.x))){
			possibleMoveArr[3] = 0;
		}


	});

	
	//Check future collisions witg geads
	
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
		possibleMoveArr[0] = possibleMoveArr[0] * .01;
	}
	if(yourself.head.x + 1 >= board.width - 1){
		possibleMoveArr[1] = possibleMoveArr[1] * .01;
	}

	if(yourself.head.y + 1 >= board.height - 2){
		possibleMoveArr[0] = possibleMoveArr[0] * .3;
	}
	if(yourself.head.x + 1 >= board.width - 2){
		possibleMoveArr[1] = possibleMoveArr[1] * .3;
	}

	if(yourself.head.y - 1 < 2){
		possibleMoveArr[2] = possibleMoveArr[2] * .3;
	}
	if(yourself.head.x -1 < 2){
		possibleMoveArr[3] = possibleMoveArr[3] * .3;
	}

	if(yourself.head.y - 1 < 1){
		possibleMoveArr[2] = possibleMoveArr[2] * .01;
	}
	if(yourself.head.x -1 < 1){
		possibleMoveArr[3] = possibleMoveArr[3] * .01;
	}

	//Check collision with others
	snakesOthers.forEach(snake => {
		let body = snake.body;
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
	})

	//Check if collide with self
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
	console.log(board);
	let move = {
		"move": chosenMove
	}
	res.status(200).send(move);
	//console.log(move);
})


server.post("/end", (req, res) => {
	res.status(200).send();
})

const host = "0.0.0.0";
const port = process.env.PORT || 8000;

server.listen(port, host, () => {
	console.log(`Running Battlesnake at http://${host}:${port}...`);
});

