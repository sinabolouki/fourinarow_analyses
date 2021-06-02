function [params,loglik] = fit_model(data,settings)

badsopts = bads('defaults');
badsopts.UncertaintyHandling = 1;
badsopts.NoiseFinalSamples = 0;
badsopts.MaxFunEvals = 2000;

if nargin < 2
	%              [prn, pstop, drp, laps, scal, ctr, 2un, 2co, 3rw, 4rw]
	settings.x0 =  [ 2 , 0.02 , 0.2, 0.05, 1.2 , 0.8,   1, 0.4, 3.5,  10];
	settings.ub =  [10 , 1    , 1  , 1   , 4   ,  10,  10,  10,  10,  10];
	settings.lb =  [0.1, 0.001, 0  , 0.05, 0.25, -10, -10, -10, -10, -10];
	settings.pub = [10 , 1    , 0.5, 0.5 , 2   ,   5,   5,   5,   5,   5];
	settings.plb = [0.1, 0.001, 0  , 0.05, 0.5 ,  -5,  -5,  -5,  -5,  -5];
	settings.c = 50;
end

x0 = settings.x0;
lb = settings.lb;
ub = settings.ub;
plb = settings.plb;
pub = settings.pub;
c = settings.c;
Ntrials = size(data,1);
L = zeros(Ntrials,10);

% Apply a lesion to one of the parameters.
lesion_index = 0; % which parameter to lesion (set to 0 to disable)
lesion_value = 1; % fix the lesioned parameter to this value
if lesion_index > 0
	x0(lesion_index) = lesion_value;
	lb(lesion_index) = lesion_value;
	ub(lesion_index) = lesion_value;
	plb(lesion_index) = lesion_value;
	pub(lesion_index) = lesion_value;
end

data

for i=1:10
	L(:,i) = estimate_loglik_ibs(data,x0);
end

times = generate_times(mean(L,2),c);

times'

fun=@(x) sum(estimate_loglik_ibs(data,x,times));

params = bads(fun,x0,lb,ub,plb,pub,[],badsopts);

params

for i=1:10
	loglik(i) = fun(params);
end

end
