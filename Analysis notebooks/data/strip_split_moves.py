import os

# Go through the split files and remove any state that has either 0 or 1 pieces on the board.
# This removes the first 2 moves, 1 player and 1 computer move, regardless who went first.
# Planning depth on a near empty board can be computationally intensive, so this will enable
# you to generate a dataset where the most costly states are removed.
# Note that this script directly modifies the data in the provide dir, so either have a backup
# or a git commit for the original data.

splits_folder = "./splits"

for subject_id in os.listdir(splits_folder):
	subdir = os.path.join(splits_folder, subject_id)
	if not os.path.isdir(subdir):
		# We're looking for directories only. Skip everything else
		continue
	for index in range(1, 6):
		sourc_filename = f"{subdir}/{index}.csv"
		strip_filename = f"{subdir}/{index}_stripped.csv"
		with open(sourc_filename) as infile, open(strip_filename, "w") as outfile:
			for line in infile:
				parts = line.split("\t")
				if not line or not parts:
					continue
				if all(map(str.isdigit, parts[0])):
					board = int(parts[0])
					if board == 0:
						# Empty board
						continue
					# This bitwise operation will detect powers of 2. A power of 2 will have exactly 1 bit set.
					# A power of 2 - 1 will not have that bit so &ing them will yield 0.
					if (board & (board - 1)) == 0:
						# Board has exactly 1 piece on it
						continue
				# The line already includes a newline character
				outfile.write(line)
		os.remove(sourc_filename)
		os.rename(strip_filename, sourc_filename)
