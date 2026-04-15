
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
	console.log(req.body.board);
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
	]
	//Snake randomized movement just cuz, mostly for testing
	possibleMoveArr = possibleMoveArr.map(value => value * (Math.random() * 0.9 + 0.1));

	//check collision with wals
	if(yourself.head.y + 1 === board.width){
		possibleMoveArr[0] = 0;
	}
	if(yourself.head.x + 1 === board.width){
		possibleMoveArr[1] = 0;
	}
	if(yourself.head.y - 1 === -1){
		possibleMoveArr[2] = 0;
	}
	if(yourself.head.x -1 === -1){
		possibleMoveArr[3] = 0;
	}

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
	console.log(move);
})


server.post("/end", (req, res) => {
	res.status(200).send();
})

const host = "0.0.0.0";
const port = process.env.PORT || 8000;

server.listen(port, host, () => {
	console.log(`Running Battlesnake at http://${host}:${port}...`);
});

