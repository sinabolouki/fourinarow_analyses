#!/bin/bash
#SBATCH --nodes=1
# hieronder array = 0 - nr subjects * 5 - 1
#SBATCH --array=0-794
#SBATCH --cpus-per-task=20
#SBATCH --time=24:00:00
#SBATCH --mem=2GB
#SBATCH --job-name=four_5
#SBATCH --mail-type=ALL
##SBATCH --mail-user=svo213@nyu.edu
#SBATCH --output=4inarow_%j.out

player=$((${SLURM_ARRAY_TASK_ID} / 5 + 1))
group=$((${SLURM_ARRAY_TASK_ID} % 5 + 1))

indir=$HOME/fourinarow/splits
outdir=$HOME/fourinarow/fit_no_scale_strict
codedirec=$HOME/modelcode/matlab\ wrapper

module purge
module load matlab/2020b

echo $player $group

echo "addpath(genpath('${codedirec}')); cross_val_no_scale($player,$group,'${indir}', '${outdir}'); exit;" | matlab -nodisplay

echo "Done"
