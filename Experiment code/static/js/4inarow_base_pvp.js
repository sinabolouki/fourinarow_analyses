var b,bp,wp,user_color,m
var tiles = [];
var preloadedImages = [];
var game_status = "ready"
//game_status = "ready";
//move_index = 0;
//last_move = 99;
var M=9,N=4
var win_color = "#22ddaa",
	square_color = "#999999",
	highlight_color = "#bbbbbb";
var data_log =[]
var level = 0;
var category = 0;
var maxLevel = 199;
var nCategories = 20;
var lastresult = "win";
var _num_games = 35;
var dismissed_click_prompt = false;
var gameStartTime = Date.now();

function goFullscreen() {
	if (typeof demo !== "undefined") return;
	let element = document.body;
	let requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

	if (requestMethod) { // Native full screen.
		requestMethod.call(element);
	} else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
		var wscript = new ActiveXObject("WScript.Shell");
		if (wscript !== null) {
			wscript.SendKeys("{F11}");
		}
	}
}

function create_board() {
	bp = new Array(M*N).fill(0)
	wp = new Array(M*N).fill(0)
	$(".canvas").empty();
	for (var i=0; i<N; i++) {
		for(var j=0; j<M; j++) {
			$(".canvas").append($("<div>", {"class" : "tile", "id": "tile_" + (i*M + j).toString()}))
		}
		$(".canvas").append("<br>");
	}
}

function add_piece(i, color) {
	if(color == 0) {//BLACK
		$("#tile_" + i.toString()).append(
			$("<div>",{"class" : "blackPiece"})
		).removeClass("tile").addClass("usedTile").off('mouseenter').off('mouseleave').css("backgroundColor", square_color);
		bp[i] = 1;
	} else {
		$("#tile_" + i.toString()).append(
			$("<div>",{"class" : "whitePiece"})
		).removeClass("tile").addClass("usedTile").off('mouseenter').off('mouseleave').css("backgroundColor", square_color);
		wp[i] = 1;
	}
}

function remove_piece(i){
	$("#tile_" + i.toString()).empty().removeClass("usedTile").addClass("tile").off().css("backgroundColor", square_color);
	bp[i]=0
	wp[i]=0
}


function show_last_move(i, color) {
	if(color == 0) {//BLACK
		$(".blackShadow").remove();
		$("#tile_" + i.toString()).append($("<div>" , {"class" : "blackShadow"}))
	} else {
		$(".whiteShadow").remove();
		$("#tile_" + i.toString()).append($("<div>" , {"class" : "whiteShadow"}))
	}
}

function check_win(pieces){
	fourinarows = [[ 0,  9, 18, 27],
				   [ 1, 10, 19, 28],
				   [ 2, 11, 20, 29],
				   [ 3, 12, 21, 30],
				   [ 4, 13, 22, 31],
				   [ 5, 14, 23, 32],
				   [ 6, 15, 24, 33],
				   [ 7, 16, 25, 34],
				   [ 8, 17, 26, 35],
				   [ 0, 10, 20, 30],
				   [ 1, 11, 21, 31],
				   [ 2, 12, 22, 32],
				   [ 3, 13, 23, 33],
				   [ 4, 14, 24, 34],
				   [ 5, 15, 25, 35],
				   [ 3, 11, 19, 27],
				   [ 4, 12, 20, 28],
				   [ 5, 13, 21, 29],
				   [ 6, 14, 22, 30],
				   [ 7, 15, 23, 31],
				   [ 8, 16, 24, 32],
				   [ 0,  1,  2,  3],
				   [ 1,  2,  3,  4],
				   [ 2,  3,  4,  5],
				   [ 3,  4,  5,  6],
				   [ 4,  5,  6,  7],
				   [ 5,  6,  7,  8],
				   [ 9, 10, 11, 12],
				   [10, 11, 12, 13],
				   [11, 12, 13, 14],
				   [12, 13, 14, 15],
				   [13, 14, 15, 16],
				   [14, 15, 16, 17],
				   [18, 19, 20, 21],
				   [19, 20, 21, 22],
				   [20, 21, 22, 23],
				   [21, 22, 23, 24],
				   [22, 23, 24, 25],
				   [23, 24, 25, 26],
				   [27, 28, 29, 30],
				   [28, 29, 30, 31],
				   [29, 30, 31, 32],
				   [30, 31, 32, 33],
				   [31, 32, 33, 34],
				   [32, 33, 34, 35]]
	
	for(var i=0;i<fourinarows.length;i++){
		var n = 0;
		for(var j=0;j<N;j++){
			n+=pieces[fourinarows[i][j]]
		}
		if(n==N)
			return fourinarows[i]
	}
	return []
}

function check_draw(bp, wp){
	for(var i=0; i<M*N; i++)
		if(bp[i]==0 && wp[i]==0)
			return false;
	return true;
}

function show_win(color, pieces) {
	for(i=0; i<pieces.length; i++){
		if(color==0)
			$("#tile_" + pieces[i] + " .blackPiece").animate({"backgroundColor": win_color}, 250)
		else
			$("#tile_" + pieces[i] + " .whitePiece").animate({"backgroundColor": win_color}, 250)
	}
}

function user_move(game_info) {
	log_data({"event_type": "your turn", "event_info" : {"bp" : bp.join(""), "wp": wp.join("")}})
	$('.headertext h1').text('Your turn. You play ' + (user_color == 0 ? 'black' : 'white') + ".");
	$('.canvas, .tile').css('cursor', 'pointer');
	$('.usedTile, .usedTile div').css('cursor', 'default');
	$('.tile').off().on('mouseenter', function(e){ 
		$(e.target).animate({"background-color":highlight_color}, 50)
	}).on('mouseleave', function(e){ 
		$(e.target).animate({"background-color": square_color}, 50)
	});
	$('.tile').off('click').on('click', function(e){
		$('.tile').off('mouseenter').off('mouseleave').off('click');
		$('.canvas, .canvas div').css('cursor', 'default');
		tile_ind = parseInt(e.target.id.replace("tile_", ""));
		log_data({"event_type": "user move", "event_info" : {"tile" : tile_ind, "user_color" : (user_color == 0 ? 'black' : 'white'),  "bp" : bp.join(""), "wp": wp.join("")}})
		add_piece(tile_ind,user_color);
		show_last_move(tile_ind, user_color);
		$(".clickprompt").hide();
		dismissed_click_prompt = true;
		winning_pieces = check_win(user_color == 0 ? bp : wp)
		if(winning_pieces.length==N){
			show_win(user_color,winning_pieces)
			log_data({"event_type": "user win", "event_info" : {"bp" : bp.join(""), "wp": wp.join(""), "winning_pieces" : winning_pieces}})
			$('.headertext h1').text('Game over, you win').css('color', '#000000');
			end_game(game_info,'win')
		}
		else if (check_draw(bp, wp)){
			log_data({"event_type": "draw", "event_info" : {"bp" : bp.join(""), "wp": wp.join("")}})
			$('.headertext h1').text('Game over, draw').css('color', '#000000');
			end_game(game_info,'draw')
		}
		else {
			user_color=(user_color + 1) % 2
			user_move(game_info)
		}
	});
}

function make_opponent_move(game_info) {
	log_data({"event_type": "waiting for opponent", "event_info" : {"bp" : bp.join(""), "wp": wp.join("")}})
	$('.headertext h1').text('Waiting for opponent').css('color', '#333333');
	setTimeout(function(){
		opponent_color = (user_color+1)%2
		seed = Date.now()
		tile_ind = makemove(seed,bp.join(""),wp.join(""),opponent_color,level);
		setTimeout(function(){
			log_data({"event_type": "opponent move", "event_info" : {"tile" : tile_ind, "user_color" : (user_color == 0 ? 'black' : 'white'), "bp" : bp.join(""), "wp": wp.join(""), "level" : level}})
			add_piece(tile_ind,opponent_color);
			show_last_move(tile_ind, opponent_color);
			winning_pieces = check_win(opponent_color == 0 ? bp : wp)
			if(winning_pieces.length==N){
				log_data({"event_type": "opponent win", "event_info" : {"bp" : bp.join(""), "wp": wp.join(""), "winning_pieces" : winning_pieces}})
				show_win(opponent_color,winning_pieces)
				$('.headertext h1').text('Game over, you lose').css('color', '#000000');
				end_game(game_info, 'opponent win')
			}
			else if (check_draw(bp, wp)){
				log_data({"event_type": "draw", "event_info" : {"bp" : bp.join(""), "wp": wp.join("")}})
				$('.headertext h1').text('Game over, draw').css('color', '#000000');
				end_game(game_info, 'draw')
			}
			else {
				user_move(game_info)
			}
		},1000);
	},0)
}

function start_game(game_info) {
	if (!game_info.num) {
		game_info.num = 0;
		gameStartTime = Date.now();
		if (game_info.startCategory) category = game_info.startCategory;
	}
	$('#instructions').hide();
	$('.overlayed').hide();
	$('.gamecount').text(`${game_info.practice ? "Practice" : "Game"} ${game_info.num + 1} of ${game_info.amount}`);
	if (!dismissed_click_prompt) $('.clickprompt').show();
	if (game_info.num == 0 && game_info.startLevel > 0) {
		level = game_info.startLevel;
	} else {
		level = pick_level(category);
	}
	log_data({"event_type": "start game", "event_info": {
		"game_num": game_info.num,
		"game_total": game_info.amount,
		"is_practice": game_info.practice,
		"category": category,
		"level": level
	}});
	create_board()
	user_move(game_info)
	// if(user_color==0)
	// 	user_move(game_info)
	// else
	// 	make_opponent_move(game_info)
}

function pick_level(category) {
	let ratio = (category - 1 + Math.random()) / nCategories;
	return Math.floor(ratio * maxLevel);
}

function adjust_level(result, category, log_data){
	old_level = level;
	if (result == 'win') {
		if (lastresult == 'win') {
			category = Math.min(category + 1, nCategories);
		}
	}
	if (result == 'opponent win') {
		category = Math.max(category - 1, 1);
	}
	lastresult = result;
	log_data({"event_type": "adjust level", "event_info" : {"category" : category, "maxCategory": nCategories}});
	return category;
}

function end_game(game_info, result) {
	let current_minutes = (Date.now() - gameStartTime) / 60000;
	log_data({"event_type": "end game", "event_info": {
		"game_num": game_info.num,
		"is_practice": game_info.practice,
		"max_minutes": game_info.max_minutes,
		"current_minutes": Math.round(current_minutes),
		"result": result,
		"level": level
	}});
	category = adjust_level(result, category, log_data);
	if (current_minutes >= game_info.max_minutes) {
		// If the game is taking too long then treat the current one as if it were the last
		log_data({"event_type": "game timeout", "event_info": {
			"current_minutes": current_minutes
		}});
		game_info.num = game_info.amount;
	}
	$("#nextgamebutton").show().css({"display" :"inline"}).off("click").on("click",function(){
		$("#nextgamebutton").hide()
		user_color = (user_color+1)%2
		$(".canvas").empty();
		if (instructions[current_instruction_nr].games > 0) {
			instructions[current_instruction_nr].games--;
		}
		game_info.num++;
		if (game_info.num < game_info.amount)
			start_game(game_info)
		else{
			$('.headertext h1').text('');
			current_instruction_nr++;
			perform_instruction();
		}
	})
}

function showButtons(showAnswerButtons) {
	if (showAnswerButtons) {
		$('#previousbutton').hide();
		$('#nextbutton').hide();
		$('#blackbutton').show();
		$('#noonebutton').show();
		$('#whitebutton').show();
	} else {
		// Previous button is not visible for the first instruction, during a quiz or after a game or quiz
		if (current_instruction_nr <= 0 ||
			instructions[current_instruction_nr].answer ||
			instructions[current_instruction_nr - 1].answer ||
			instructions[current_instruction_nr - 1].game_info
		) {
			$('#previousbutton').hide();
		} else {
			$('#previousbutton').show();
		}
		$('#nextbutton').show();
		$('#blackbutton').hide();
		$('#noonebutton').hide();
		$('#whitebutton').hide();
	}
}

function answer(given) {
	goFullscreen();
	let feedback = "Correct! Click next to continue.";
	let correct = true;
	let expected = instructions[current_instruction_nr].answer;
	if (given != expected) {
		feedback = "The correct answer was " + expected + ". Look at the image again and click next to continue.";
		correct = false;
	}
	log_data({"event_type": "quiz answer", "event_info" : {
		image: instructions[current_instruction_nr].image,
		given: given, expected: expected, correct: correct
	}});
	$('#instructions p').remove();
	$('#instructions h4').after("<p>" + feedback + "</p>");
	showButtons(false);
}

function change_instruction(delta) {
	goFullscreen();
	current_instruction_nr += delta;
	if (current_instruction_nr < 0) current_instruction_nr = 0;
	perform_instruction();
}

function perform_instruction() {
	// Finish the game when we run out of instructions
	if (current_instruction_nr >= instructions.length) {
		$('#instructions').hide();
		$('.overlayed').hide();
		finish_experiment();
		return;
	}
	log_data({"event_type": "show instructions", "event_info" : {"screen_number": current_instruction_nr}})
	// If the instruction is to play games then skip showing instructions
	if (instructions[current_instruction_nr].game_info) {
		start_game(instructions[current_instruction_nr].game_info);
		return;
	}
	$('.overlayed').show();
	$('#instructions').show();
	$('#instructions p').remove();
	$('#instructions h4').after("<p>" + (instructions[current_instruction_nr].text || "") + "</p>");
	if(instructions[current_instruction_nr].image) {
		// Set the image to nothing first to prevent any previous image from showing as the current one loads
		$('#instructions img').show().attr("src", "").attr("src",get_image_path(instructions[current_instruction_nr].image));
	} else {
		$('#instructions img').hide()
	}
	showButtons(instructions[current_instruction_nr].answer);
	
	// The text on the next button can depend on the instruction after the current one.
	nextText = instructions[current_instruction_nr].nextButton || "Next";
	if (current_instruction_nr + 1 < instructions.length) {
		if (instructions[current_instruction_nr + 1].nextButton &&
			instructions[current_instruction_nr + 1].games != 0)
		{
			nextText = instructions[current_instruction_nr + 1].nextButton;
		}
	}
	$('#nextbutton').text(nextText);
}

function initialize_task() {
	current_instruction_nr = 0;
	user_color = 0
	instructions = [{
		text: "You will be playing a few games called 4-in-a-row against the computer. Press next to make the experiment fullscreen and see the next instruction."
	}, {
		text: "In this game, you and the computer place black or white pieces on a game board",
		image: "black-about-to-win.png"
	}, {
		text: "If you get 4 pieces in a row, you win!",
		image: "black-won.png"
	}, {
		text: "You can connect your 4 pieces in any direction, left to right, up down, or tilted, they all count",
		image: "black-won-diagonal.png"
	}, {
		text: "If the computer gets 4-in-a-row before you do, you lose"
	}, {
		text: "If the board is full and no-one has 4-in-a-row, it's a tie",
		image: "draw.png"
	}, {
		text: "If you were playing black pieces for one game, then the next game you will play white pieces. Let's play two games to see how it works. You will start playing black."
	}, {
		game_info: {
			amount: 2,
			practice: true,
			startCategory: 1,
			startLevel: 1
		},
		nextButton: "Practice"
	}, {
		text: "Let's see if you got it. Which color has won in the game shown below?",
		image: "blackHorizontal.png",
		answer: "Black"
	}, {
		text: "Which color has won in the game shown below?",
		image: "whiteDiagonal.png",
		answer: "White"
	}, {
		text: "Which color has won in this game?",
		image: "whiteVertical.png",
		answer: "White"
	}, {
		text: "Look closely! Which color has won?",
		image: "whiteNoWin.png",
		answer: "No-one"
	}, {
		text: "One more. Which color has won in this game?",
		image: "blackDiagonal.png",
		answer: "Black"
	}, {
		text: "You will now play " + _num_games + " games of 4-in-a-row against the computer. Do your best! You will win bonus money based on how well you play."
	}, {
		game_info: {
			amount: _num_games,
			practice: false,
			startCategory: 2,
			max_minutes: 50.0
		},
		nextButton: "Start"
	}, {
		text: "Well done! The next part uses audio so <span style='color: #ff0000; font-weight: bold;'>please turn on your sound now</span>. Then click the button to go to the next part.",
		nextButton: "Sound is on"
	}]
	if (typeof demo !== "undefined") {
		instructions = [{
			game_info: {
				amount: _num_games,
				practice: false,
				startCategory: 2,
				max_minutes: 50.0
			},
			nextButton: "Start"
		}];
	}
}

function start_experiment() {
	makemove = Module.cwrap('makemove', 'number', ['number','string','string','number','number'])
	$(document).on("contextmenu",function(e){
		e.preventDefault()
	})
	// Preload all the instruction images
	instructions.forEach(ins => {
		if (ins.image) {
			let img = new Image();
			img.src = get_image_path(ins.image);
			preloadedImages.push(img);
		}
	});
	perform_instruction()
}

module.exports = {pick_level, check_win, check_draw, adjust_level};