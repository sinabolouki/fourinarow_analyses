function preprocessed = fit_adjacent_model(indir)
	listing = dir(indir);
	listing = listing([listing.isdir]); % Get subdirs
	listing = listing(~ismember({listing.name},{'.','..'})); % exclude special dirs
	n_subjects = numel(listing);

	numinit = 100;
	% {low init, high init, low limit, high limit}
	params{1} = {0.1, 100, 0.01, 1000}; % Adjacent weight
	
	best_headers = {"Subject", "nll (adjacent)", "adjacent weight", "nll (random)" ,"games", "decisions"};
	all_headers = {"Subject", "nll", "adjacent weight"};
	best_file = cell(n_subjects, numel(best_headers));
	all_file = cell(n_subjects * numinit, numel(all_headers));
	for row = 1:n_subjects
		subject = listing(row).name;
		fprintf("Processing %s (%d/%d)", subject, row, n_subjects);
		data = load_data(fullfile(listing(row).folder, subject, "data.csv"));
		preprocessed = preprocess(data);
		fun = @(params)computer_nll(preprocessed, params(1));
		[best_pars, best_nll, all_pars, all_nll] = fminconRunner(fun, params, numinit);
		amount_open = preprocessed(:, 1) + preprocessed(:, 2);
		best_file{row, 1} = subject;
		best_file{row, 2} = best_nll;
		best_file{row, 3} = best_pars(1);
		best_file{row, 4} = sum(-log(1 ./ amount_open));
		best_file{row, 5} = sum(amount_open >= 35);
		best_file{row, 6} = size(preprocessed, 1);
		range = ((row - 1) * numinit + 1) : (row * numinit);
		all_file(range, 1) = {subject};
		all_file(range, 2) = num2cell(all_nll);
		all_file(range, 3) = num2cell(all_pars(:, 1));
	end
	fprintf("Writing csv files to %s\n", indir);
	writecell([best_headers; best_file], fullfile(indir, "adjacent_model_fit.csv"));
	writecell([all_headers; all_file], fullfile(indir, "adjacent_model_all_runs.csv"));
	fprintf("done\n");
end

function nll = computer_nll(preprocessed, weight)
	choices = preprocessed(:, 3);
	weighted_adjacent = weight * preprocessed(:, 2);
	choice_values = choices .* weight + (1 - choices);
	nll = sum(-log(choice_values ./ (preprocessed(:, 1) + weighted_adjacent)));
end

function board = decode_board(encoded)
	% Create a matrix that has 1's where pieces are and 0's otherwise.
	board = zeros(9, 4);
	index = 1;
	while encoded > 0
		if mod(encoded, 2) > 0
			board(index) = 1;
		end
		encoded = bitshift(encoded, -1);
		index = index + 1;
	end
end

function preprocessed = preprocess(data)
	% The resulting matrix has one row per decision/move
	% The columns are non-adjacent free spots, free adjacent spots, move was adjacent (0 or 1)
	adjacent_kernel = ones(3, 3);
	preprocessed = zeros(size(data, 1), 3);
	for row = 1:size(data, 1)
		player_color = data{row, 3}; % 0 or 1
		player_pieces = decode_board(data{row, 1 + player_color});
		opponent_pieces = decode_board(data{row, 2 - player_color});

		occupied = player_pieces + opponent_pieces;
		n_free = numel(occupied) - sum(occupied, 'all');

		conv = conv2(adjacent_kernel, player_pieces);
		adjacent = min(1, conv(2:10, 2:5));
		adjacent_free = max(0, adjacent - occupied);
		n_adjacent_free = sum(adjacent_free, 'all');

		move = log2(double(data{row, 4})) + 1;
		preprocessed(row, :) = [n_free - n_adjacent_free, n_adjacent_free, adjacent_free(move)];

		% player_pieces(move) = player_pieces(move) + 3;
		% disp(player_pieces');
		% disp(opponent_pieces');
		% disp(adjacent_free');
		% sprintf("Free: %d    Adjacent: %d   Move adjacent: %d", n_free, n_adjacent_free, adjacent(move))
	end
end