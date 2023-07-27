from fourinarowfunctions import *

print(f"Loading game data")
data_dict = load_data("../data/trialdata.csv", verbose = False)
included = 0
with open("../data/win_orientations.csv", "w") as outfile:
	outfile.write(f"Subject ID,Total Games, Total Wins, Horizontal wins,Vertical wins, Diagonal wins, Losses, Draws\n")
	for username, data in data_dict.items():
		print(f"Processing {username} {len(data)}         ", end='\r')
		h_win = 0
		v_win = 0
		d_win = 0
		loss = 0
		draw = 0
		parsed_data = get_parsed_data(data, username, False, 0)
		if len(parsed_data) < 34:
			continue
		for game in parsed_data:
			outcome = get_parsed_outcome(game)
			if outcome == 0:
				draw += 1
			elif outcome < 0:
				loss += 1
			else:
				last_state = game[-1]
				player_is_black = last_state["user_color"] == "black"
				player_pieces = decode_str_board(last_state["bp" if player_is_black else "wp"], last_state["tile"])
				if is_horizontal_four_in_a_row(player_pieces):
					h_win += 1
				elif is_horizontal_four_in_a_row(player_pieces.transpose()):
					v_win += 1
				elif is_diagonal_down_four_in_a_row(player_pieces) or is_diagonal_down_four_in_a_row(np.rot90(player_pieces)):
					d_win += 1
		total_wins = h_win + v_win + d_win
		total_games = total_wins + loss + draw
		outfile.write(f"{username},{total_games},{total_wins},{h_win},{v_win},{d_win},{loss},{draw}\n")
		included += 1

print(f"\nIncluded {included} subjects")