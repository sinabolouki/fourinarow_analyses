import math
from typing import *
from fourinarowfunctions import *

# Generate nlls for player data using random model

def free_spots(move) -> int:
	free = 0
	for index in range(len(move["bp"])):
		if move["bp"][index] == "0" and move["wp"][index] == "0":
			free += 1
	return free

data_dict = load_data("../data/trialdata.csv")
with open("../simple_model_nlls.csv", "w") as outfile:
	outfile.write(f"Subject ID,Games,Decisions,NLL (Random model)\n")
	for username, data in data_dict.items():
		print(f"Processing {username} {len(data)}         ", end='\r')
		parsed_data = get_parsed_data(data, username, False, 0)
		nll = 0
		decisions = 0
		for game in parsed_data:
			decisions += len(game)
			for move in game:
				nll += -math.log(1.0 / free_spots(move))
		outfile.write(f"{username},{len(parsed_data)},{decisions},{nll}\n")

print("\ndone")