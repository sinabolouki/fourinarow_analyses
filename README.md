This repository containes the code to analyze the Four in a Row Development data 

**This repository is private. Make sure that we anonymize the data before making a public repo.**

Run "Parse fourinarow data.ipynb" in the folder "Experiment code" and add your participant numbers in cell 55 along with the correct directory and datafile name.

Data quality checks: 
- There should be 37 games per subject (2 of wich are practise)
- Number of wins per subject should be about 2/3 but is probably more for adults
- Number of subject moves (should be at minimum about 150)
- Check for ceiling or floor effects in staircasing
- plot estimate win rate as a function of opponent level and fit a psychometric curve (a sigmoid) aggregated over subjects. Then ideally the inflection point of that sigmoid should be close to the 1/3 of the range and the ends should be close to 0/100
- plot RT distribution

To fit the data:
* Get the data from psiturk. This will give you ```trialdata.csv``` which should go in the data folder
* From the ```Process Data``` notebook run the first part to get a ```splits``` and ```raw``` folder in the data folder. The splits file contains one folder per participant. This is the input for the fitting pipeline.
* Login to the HPC. Copy both raw and splits to the cluster. Copy the modelcode folder too. On the cluster edit and run a slurm script ```sbatch auto_fit.sh```
* Copy the resulting ```fit_main``` folder back to the data folder in this repository

Checks after fitting:
1. Check the mean test log likelihood. These are in lltest$n.csv. Each of these will have as many entries as there are boards in the dataset for that split.
To get a LL for the participant, you want to add all these numbers across all of lltest1.csv to lltest5.csv
Note: in practice, Bas finds average LLs to be more informative than summed LLs, since different participants have different numbers of data points. 
In python you can do this by running: nll = np.sum(np.hstack([np.loadtxt(direc + 'lltest' + str(i) + '.csv' for i in range(1,6)]))

2. Create a bargraph of the parameter estimates, see figure in cell 156 in "Parameter tradeoffs and reliability.ipynb"

Order of free parameter estimates: 1. pruning threshold, 2. stopping probability, 3. feature drop rate, 4. lapse rate, 5. active scaling constant, 6. then weights of center, 7. 2-in-a-row connected, 8. 2 unconnected, 9. 3 in a row, and 10. 4-in-a-row

Run the rest of data analysis
* Now that you have updated the ```fit_main``` folder you can run the remainder of the ```Process Data``` notebook to get ```paramsMatrix.csv``` and the two ```paramsLogLikelihoods*.csv``` files.
* Run the first part of the ```Calculate metrics and Elo``` notebook to get ```params.txt```.
* Copy params.txt back to the cluser, edit and run (with sbatch) ```compute_planning_depth.sh```. This will give you the ```depth``` folder.
* Copy the depth folder back to the data folder in this repository (it has many small files, so you may want to zip the folder).
* Run the rest of the ```Calculate metrics and Elo``` notebook to get ```params_with_metrics.csv```.