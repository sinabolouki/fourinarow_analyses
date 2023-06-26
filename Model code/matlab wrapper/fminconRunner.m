function [pars_est, NLL_est, pars_per_run, NLL] = fminconRunner(myNLL, param_descriptions, numinit)
	nparams = length(param_descriptions);
	lo_limits = NaN(nparams, 1);
	hi_limits = NaN(nparams, 1);
	for i = 1:nparams
		lo_limits(i) = param_descriptions{i}{3};
		hi_limits(i) = param_descriptions{i}{4};
	end
	
	pars_per_run = NaN(numinit, nparams);
	NLL = NaN(numinit, 1);
	for runidx = 1:numinit
		fprintf(".");
		drawnow('update');
		for attempt = 1:100
			% Pick a random starting point within the defined limits per parameter.
			initialPoint = rand(1, nparams);
			for i = 1:nparams
				lo_init = param_descriptions{i}{1};
				hi_init = param_descriptions{i}{2};
				initialPoint(i) = initialPoint(i) * (hi_init - lo_init) + lo_init;
			end
			try
				% Run fmincon and break out of the attempt loop if we succeed
				[pars_per_run(runidx, :), NLL(runidx)] = fmincon(myNLL, initialPoint, [],[],[],[], lo_limits, hi_limits, [], optimset('Display', 'off'));
				break;
			catch e
				% Log a failed attempt. Probably the objective function was
				% undefined at initial point, so go again and pick a new starting point.
				fprintf("-");
			end
		end
	end
	[NLL_est, best_run_idx] = min(NLL);
	pars_est = pars_per_run(best_run_idx, :);
	fprintf("\n");
end
