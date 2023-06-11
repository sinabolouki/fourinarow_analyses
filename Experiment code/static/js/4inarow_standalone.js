function finish_experiment(){
	save(data_log,"fourinarow_data_" + user_credentials + ".json");
}

function get_image_path(filename){
	return "../static/images/" + filename;
}

function save(data,filename){
	var blob = new Blob([JSON.stringify(data)], {type: 'text/csv'});
	var elem = window.document.createElement('a');
	elem.href = window.URL.createObjectURL(blob);
	elem.download = filename;        
	document.body.appendChild(elem);
	elem.click();
	document.body.removeChild(elem);
}

function log_data(data){
	data["event_time"] = Date.now()
	data["credentials"] = user_credentials
	console.log(data)
	data_log.push(data)
}

$(document).ready(function(){
	user_credentials = "test"
	//enter_credentials(start_game)
	initialize_task();
	start_experiment();
});