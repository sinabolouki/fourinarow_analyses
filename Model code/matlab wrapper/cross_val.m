% Function to fit model with 5-fold cross-validation on a single user from 
% peak dataset. Splits must be pre-generated using
% auto_split.m/generate_splits.m.
function [params,loglik_train,loglik_test] = cross_val(user, num, indir, outdir, lesion_index, lesion_value)

if nargin < 4; outdir = indir; end;
if nargin < 6; lesion_index = -1; lesion_value = 0; end;

% Assuming all folders in indir belong to users we'll use dir and user nr
% to get user name
listing = dir(indir);
listing = listing([listing.isdir]);
listing = listing(~ismember({listing.name},{'.','..'}));

% Find all files for the specified user
user_input_path  = sprintf('%s/%s/', indir,  listing(user).name)
user_output_path = sprintf('%s/%s/', outdir, listing(user).name)

% Load all the groups
for i=1:5
	group{i}=load_data(fullfile(user_input_path,sprintf('%i.csv',i)));
end	

if num>0
	test = group{num};

	train = [];
	for i=1:5
		if i~=num
			train = [train; group{i}];
		end
	end
else
	train = [];
	for i=1:5
		train = [train; group{i}];
	end
	
	test = train;
end

% Fit model to training data
[params,loglik_train] = fit_model(train, lesion_index, lesion_value);

% Estimate loglike for test data with params from training
loglik_test = estimate_loglik_ibs(test,params);

% Save outputs to csv
[status, msg] = mkdir(user_output_path);
param_path   = sprintf('%s/params%i.csv',  user_output_path, num);
lltrain_path = sprintf('%s/lltrain%i.csv', user_output_path, num);
lltest_path  = sprintf('%s/lltest%i.csv',  user_output_path, num);

csvwrite(param_path,   params);
csvwrite(lltrain_path, loglik_train);
csvwrite(lltest_path,  loglik_test);

end
