import os

def get_subject_list(data_folder):
	subjects = []
	for subject_id in os.listdir(data_folder):
		subdir = os.path.join(data_folder, subject_id)
		if not os.path.isdir(subdir):
			# We're looking for directories only. Skip everything else
			continue
		subjects.append(subject_id)
	return subjects

def account(data_folder, subjects):
	todo = set(subjects)
	missing = False
	for subject_id in os.listdir(data_folder):
		subdir = os.path.join(data_folder, subject_id)
		if not os.path.isdir(subdir):
			# We're looking for directories only. Skip everything else
			continue
		if subject_id not in todo:
			print(f"{data_folder} has unexpected subject {subject_id}")
			continue
		todo.remove(subject_id)
		file_list = [
			"lltest1.csv", "lltest2.csv", "lltest3.csv", "lltest4.csv", "lltest5.csv",
			"lltrain1.csv", "lltrain2.csv", "lltrain3.csv", "lltrain4.csv", "lltrain5.csv",
			"params1.csv", "params2.csv", "params3.csv", "params4.csv", "params5.csv"
		]
		# Get nlls for all the folds
		for filename in os.listdir(subdir):
			file_list.remove(filename)
		# for filename in file_list:
		# 	print(f"{data_folder}/{subject_id} is missing file {filename}")
		if file_list:
			missing = True
			print(f"{data_folder}/{subject_id} is missing files")
	for subject_id in todo:
		missing = True
		print(f"{data_folder} is missing subject {subject_id}")
	if not missing:
		print(f"{data_folder} is complete ({len(subjects)} subjects)")

subjects = get_subject_list("./splits")
account("fit_main", subjects)
account("fit_main_repeat", subjects)
account("fit_main_repeat2", subjects)
account("fit_no_2_con", subjects)
account("fit_no_2_unc", subjects)
account("fit_no_3_row", subjects)
account("fit_no_4_row", subjects)
account("fit_no_center", subjects)
account("fit_no_feature_drop", subjects)
account("fit_no_noise", subjects)
account("fit_no_prune", subjects)
account("fit_no_scale", subjects)
account("fit_no_tree", subjects)
