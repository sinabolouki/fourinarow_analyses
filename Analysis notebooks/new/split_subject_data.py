from typing import *

# This script load trialdata and splits it into two files,
# each containing half of the data per subject. One file will have
# each subject's first 18 games (0 to 17) and the other will have
# the last 17 games (18 to 34)

def reset_state(subject: str) -> None:
	global current_subject, current_game, linesA, linesB
	current_subject = subject
	current_game = -1
	linesA = []
	linesB = []

def finish_subject(outFileA: TextIO, outFileB: TextIO) -> None:
	if not current_subject and current_game < 0:
		return
	if current_game < 34:
		print(f"{current_subject} only played {current_game + 1} games")
		return
	print(f"writing {current_subject}")
	outFileA.writelines(linesA)
	outFileB.writelines(linesB)

reset_state("")

with (open("../data/trialdata.csv") as infile,
      open("..\\data\\trialdata00to17.csv", "w") as outFileA,
      open("..\\data\\trialdata18to34.csv", "w") as outFileB):
	for line in infile:
		parts = line.split(",")
		if len(parts) < 2:
			continue
		subject = parts[0]
		if subject != current_subject:
			finish_subject(outFileA, outFileB)
			reset_state(subject)
		if "start game" in line and '""is_practice"": false' in line:
			current_game += 1
		if current_game >= 18:
			linesB.append(line)
		elif current_game >= 0:
			linesA.append(line)
	finish_subject(outFileA, outFileB)

print("done")
