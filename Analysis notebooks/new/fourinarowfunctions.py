import json
import numpy as np
import os
import pandas as pd
import subprocess

def load_data(filename, verbose = True):
    df = pd.read_csv(filename, header=None, names=['participant_id','i','ts','info'])
    result = {}
    for participant_id in df['participant_id'].unique():
        # Skip debug data by filtering in name
        if any(part in participant_id.lower() for part in ["debug", "test", "noas", "null"]):
            if verbose:
                print("drop " + participant_id)
            continue
        events = [json.loads(e) for e in df[df['participant_id'] == participant_id]['info']]
        result[participant_id] = events # Don't sort by event time! Time adjustments can mess up the order.
    if verbose:
        print(f"Loaded {len(result)} participants")
    return result

def get_events_with_type(f, event_type):
    return [e for e in f if e['event_type'].replace('_',' ') == event_type.replace('_', ' ')]

# Make data more accessible
def get_parsed_data(data, user = "?"):
    result = []
    game = []
    game_nr = -1
    include_game = True
    for e in data:
        if e["event_type"] == "start game":
            if game:
                if include_game:
                    result.append(game)
                game = []
                include_game = True
            game_nr = int(e["event_info"]["game_num"])
            if not e["event_info"]["is_practice"]:
                game_nr += 2
            if game_nr != len(result):
                if game_nr < 2:
                    include_game = False
                    continue # Users can potentially redo the instruction games
                if len(result) == 37:
                    print(f"user {user} started games after completing the task. Using only the first 37 games")
                    break
                else:
                    assert False, f"user {user} started game {game_nr} before (len {len(result)}) at time {e['event_time']}"
        elif e["event_type"] == "your turn":
            e_your_turn = e
        elif e["event_type"] == "user move":
            assert e_your_turn, f"{user} made a move before turn announcement in game {game_nr} at time {e['event_time']}"
            event = {"bp": e['event_info']['bp'], "wp": e['event_info']['wp'], "tile": e['event_info']['tile'],
                "user_color": e['event_info']['user_color'], "reactiontime": (e['event_time'] - e_your_turn['event_time']) / 1000}
            e_your_turn = None
            game.append(event)
    if game:
        result.append(game)
    assert len(result) >= 36, f"user only finished {len(result)} games"
    return result

def get_quiz_answers(trial_data):
    """Given data from load_data, create a list with entries about quiz answers. The result is a list but can be used to create a dataframe."""
    result = []
    for subject_id in trial_data:
        for event in trial_data[subject_id]:
            type = event["event_type"]
            if type == "show instructions":
                show_time = event["event_time"]
            elif type == "quiz answer":
                info = event["event_info"]
                result.append({
                    "subject": subject_id,
                    "image": info["image"],
                    "expected": info['expected'],
                    "given": info['given'],
                    "correct": info['correct'],
                    "rt_ms": int(event['event_time']) - int(show_time)
                })
    return result


def expand_params(params):
    """convert list of 10 parameters to expanded version of 58, as used for the C++ input"""
    return np.hstack([[10000],params[:2],params[3:4],[1,1],params[5:6],
                    np.tile(params[6:],4),[0],params[4]*np.tile(params[6:],4),
                    [0],np.tile(params[2:3],17)])

def shrink_params(p):
    return np.hstack([p[[1,2,41,3]],np.nanmean(p[24:28]/p[7:11]),p[6:11]])

def get_heuristic_quality(params):
    f3inarow = (params[9]+params[28])/2
    heuristic_values = np.tanh(0.4*np.sum((-2*player_color+1)[:,None]*feature_counts
                                                *params[None,6:41]/f3inarow,axis=1))
    return np.corrcoef(heuristic_values,optimal_board_values)[0,1]

feature_counts = np.loadtxt('Heuristic quality/optimal_feature_vals.txt')[:,-35:]
optimal_move_values = np.loadtxt('Heuristic quality/opt_hvh.txt')[:,-36:]
move_stats_hvh = np.loadtxt('Heuristic quality/move_stats_hvh.txt',dtype=int)
#columns are player id, color, cross-validation group, number of pieces, chosen move, and response time in ms
num_pieces_hvh = move_stats_hvh[:,3]
mask = ~np.isnan(optimal_move_values)
optimal_move_values[mask] = np.vectorize(lambda x: -1 if x<-5000 else (1 if x>5000 else 0))(optimal_move_values[mask])
player_color = move_stats_hvh[:,1]
optimal_board_values = np.full_like(player_color,fill_value=np.nan,dtype=float)
optimal_board_values[player_color==0] = np.nanmax(optimal_move_values[player_color==0,:],axis=1)
optimal_board_values[player_color==1] = -np.nanmin(optimal_move_values[player_color==1,:],axis=1)

import matplotlib.patches as patches
import matplotlib.colors as colors

cm = colors.LinearSegmentedColormap.from_list('gray_gold_map', [colors.to_rgb('darkgray'), 
                                                                colors.to_rgb('gold')], N=100)
def show_board(bp,wp,response,color,save=False):    
    fig = plt.figure(figsize=[9,4])
    ax = fig.add_subplot(111,aspect='equal')
    ax.vlines(np.arange(-0.5,9.5,1),-0.5,3.5)
    ax.hlines(np.arange(-0.5,4.5,1),-0.5,8.5)
    
    black_pieces = np.nonzero(np.array(list(bp)).astype(int))[0]
    white_pieces = np.nonzero(np.array(list(wp)).astype(int))[0]
    
    for p in black_pieces:
        circ = patches.Circle((p%9,p//9),0.33,color="black",fill=True)
        circ = ax.add_patch(circ)
    for p in white_pieces:
        circ = patches.Circle((p%9,p//9),0.33,color="white",fill=True)
        circ = ax.add_patch(circ)
    for p in [response]:
        circ = patches.Circle((p%9,p//9),0.33,color=color,fill=False)
        circ = ax.add_patch(circ)
    plt.imshow(np.zeros(shape=[4,9]), cmap=cm, 
               interpolation='nearest',origin='bottom',vmin=0,vmax=0.2)
    ax.axis('off')
    fig.tight_layout()
    #if save:
    #    fig.savefig('C:/Users/svo/Documents/fmri/Boards/board_' + bp + '_' + wp + '.png')
    plt.show()
    
def create_bayeselo_input(results,name):
    with open(name,'w') as f:
        for black,white,r in results:
            outcome = ('1-0' if r==1 else ('0-1' if r==-1 else '1/2-1/2'))
            print('[White \"' + black +'\"]',file=f)
            print('[Black \"' + white +'\"]',file=f)
            print('[Result \"' + outcome +'\"]',file=f)
            print(outcome,file=f)
            print(file=f)
            
def run_bayeselo(bayeselo_direc,names):
    wd = os.getcwd()
    os.chdir(bayeselo_direc)
    bayeselo_input = '\n'.join(['readpgn ' + name for name in names] + ['elo','mm 1 1','ratings','x','x'])
    bayeselo_output = subprocess.check_output('bayeselo.exe',input=bayeselo_input, text=True, stderr=subprocess.STDOUT).split('\n')
    os.chdir(wd)
    start_line = [i+1 for i,line in enumerate(bayeselo_output) if line.startswith('ResultSet-EloRating>Rank')][0]
    df = pd.DataFrame([line.split() for line in bayeselo_output[start_line:-1]],
                  columns = ['','Name','Elo','','','','','',''])[['Name','Elo']]
    df['Elo'] = df['Elo'].astype(int)
    elo_ratings = dict(df.values)
    return elo_ratings