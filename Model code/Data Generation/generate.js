const base = require('../../Experiment code/static/js/4inarow_base');
const fs = require('fs');

const M = 9, N = 4;
let level = 0;
let category = 2;
let subject = "testsub";
let file_content = "";
let line_count = 0;

function log_data(data) {
	file_content += [
		subject,
		line_count++,
		Math.floor(Date.now() / 1000),
		'"' + JSON.stringify(data).replaceAll('"', '""') + '"'
	].join(",") + "\n";
	console.log(data)
}

function make_color_string(color) {
	return color == 0 ? "black" : "white";
}

function play_single_game(game_info, player_move_func, opponent_move_func, use_categories) {
	if (use_categories) {
		level = base.pick_level(category);
	}
	let user_color = game_info.num % 2; // user color alternates between games
	let is_opponent = user_color == 1; // first turn is opponent if user plays white
	log_data({"event_type": "start game", "event_info": {
		"game_num": game_info.num,
		"game_total": game_info.amount,
		"is_practice": game_info.practice,
		"category": category,
		"level": level,
		"use_level": use_categories
	}});
	let bp = new Array(M * N).fill(0);
	let wp = new Array(M * N).fill(0);
	let result = null;
	while (!result) {
		const color = is_opponent ? 1 - user_color : user_color;
		const move_function = is_opponent ? opponent_move_func : player_move_func;
		result = generate_move(color, is_opponent, wp, bp, move_function);
		is_opponent = !is_opponent;
	}
	log_data({"event_type": "end game", "event_info": {
		"game_num": game_info.num,
		"is_practice": game_info.practice,
		"result": result,
		"level": level
	}});
	if (use_categories) {
		category = base.adjust_level(result, category, log_data);
	}
}

function random_move(bp, wp, color) {
	let options = [];
	for (let index = 0; index < bp.length; index++) {
		if (!bp[index] && !wp[index]) {
			options.push(index);
		}
	}
	return options[Math.floor(Math.random() * options.length)];
}

function best_first_move(bp, wp, color, override_level = null) {
	let seed = Date.now();
	const player_level = override_level ?? level;
	return makemove(seed, bp.join(""), wp.join(""), color, player_level);
}

function generate_move(color, is_opponent, wp, bp, move_function) {
	const color_string = make_color_string(color);
	const party = is_opponent ? "opponent" : "user";
	
	let tile_ind = move_function(bp, wp, color);
	log_data({"event_type": party + " move", "event_info": {"tile": tile_ind, "bp": bp.join(""), "wp": wp.join(""), [party + "_color"]: color_string}});
	if (color == 0) bp[tile_ind] = 1;
	else wp[tile_ind] = 1;

	winning_pieces = base.check_win(color == 0 ? bp : wp);
	if (winning_pieces.length == 4) {
		log_data({"event_type": party + " win", "event_info": {"bp": bp.join(""), "wp": wp.join(""), "winning_pieces": winning_pieces}});
		return is_opponent ? "opponent win" : "win";
	}
	else if (base.check_draw(bp, wp)) {
		log_data({"event_type": "draw", "event_info": {"bp": bp.join(""), "wp": wp.join("")}});
		return "draw";
	}
}

function play_games(amount_games, player_move_func, opponent_move_func, use_categories) {
	for (let game_nr = 0; game_nr < amount_games; game_nr++) {
		const game_info = {
			num: game_nr,
			amount: amount_games,
			practice: false
		}
		play_single_game(game_info, player_move_func, opponent_move_func, use_categories);
	}
}

const model = require('../../Experiment code/static/scripts/Code/makemove');
model['onRuntimeInitialized'] = () => {
	matches = [
		["10v10", (bp, wp, color) => best_first_move(bp, wp, color, 10), (bp, wp, color) => best_first_move(bp, wp, color, 10)],
		["100v100", (bp, wp, color) => best_first_move(bp, wp, color, 100), (bp, wp, color) => best_first_move(bp, wp, color, 100)],
	]
	global.makemove = model.cwrap('makemove', 'number', ['number','string','string','number','number']);
	const amount_games = 35;
	for (let matchIndex = 0; matchIndex < matches.length; matchIndex++) {
		const match = matches[matchIndex];
		subject = match[0];
		play_games(amount_games, match[1], match[2], false);
	}
	try {
		const filename = 'test.csv';
		console.log("Going to write " + filename);
		fs.writeFileSync(filename, file_content);
		console.log("File written ok");
	} catch (err) {
		console.error(err);
	}
};