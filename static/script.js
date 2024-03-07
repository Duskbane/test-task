let id = 0;
let tasks = [];

// on loading a page
loadTasks();

class Task {
	constructor(id_t, text, date, state) {
		this.id_t = id_t;
		this.text = text;
		this.date = date;
		this.state = state;
	}
	// for debugging purposes
	toString(){
		return`task ${this.id_t}, state - ${this.state}`;
	}
}

function flashContinueButton(x){
	x.nextElementSibling.style.background = "red";
	setTimeout(() => x.nextElementSibling.style.background = "", 200);
	return;
}

function addTask() {
	
	// load, save, and add task can't be done unless the current task is confirmed
	let inputField = document.getElementById('in');
	if (inputField != undefined) {
		flashContinueButton(inputField);
		return;
	}
	
	// adding whole row with task info
	let new_line = document.createElement('div');
	new_line.className = "row border m";
	
	let cells = [];
	for (let i = 0; i < 7; i++) {
		let new_cell = document.createElement('div');
		new_cell.className = "col-sm-1";
		new_cell.innerHTML = "";
		cells.push(new_cell);
	}

	cells[1].innerHTML = "";
	cells[2].className = "col-sm-6";
	cells[2].innerHTML = '<input class="inp lab" id ="in"\
		placeholder="What do you want to do?" autofocus></input> \
		<button class="btn-light" id="btn_cnf" onclick="confirmTask()">Confirm</button>';
	for (let i = 0; i < 7; i++) {
		new_line.appendChild(cells[i]);
	}
	
	// for convenience new task is shown at the top
	let title = document.getElementById('top');
	title.after(new_line);
	
	// autofocus and submitting by pressing "Enter"
	document.getElementById("in").focus();
	let input = document.getElementById("in");
	input.addEventListener("keypress", function(event) {
		if (event.key === "Enter") {
			event.preventDefault();
			document.getElementById("btn_cnf").click();
		}
	});
}

function showNumbersBelowTenWithLeadingZero(time) {
	if (time > 9)
		return time;
	else
		return "0" + time;
}

function confirmTask() {	
	let elem = document.getElementById('in');
	let text = elem.value.toString();
	
	// remove <input> and place <label> instead
	let label = elem.parentElement;
	elem.remove();
	label.innerHTML = `<label>${text}</label>`;
	
	// fill other fields of the row
	let now = new Date();
	date = showNumbersBelowTenWithLeadingZero(now.getDate()) + '/' + 
		   showNumbersBelowTenWithLeadingZero(now.getMonth() + 1) +
		   '/' + now.getFullYear();
	time = showNumbersBelowTenWithLeadingZero(now.getHours()) + ':' + 
		   showNumbersBelowTenWithLeadingZero(now.getMinutes()) +
		   ':' + showNumbersBelowTenWithLeadingZero(now.getSeconds());
	label.nextElementSibling.innerHTML = date;
	label.nextElementSibling.nextElementSibling.innerHTML = time;

	// default state for a task if false (not done)
	let newTask = new Task(0, text, now, false);
	tasks.push(newTask);
	// send new task to db
	sendTask(newTask);
}
async function sendTask(newTask){
	await fetch('/add', {
		"method": "POST",
		"headers": {"Content-Type": "application/json"},
		"body": JSON.stringify(newTask),
	}).then(_ => {
	
	// get task ID
	recieveID().then(data => {
	idDiv = document.getElementById("top").nextElementSibling.firstElementChild.nextElementSibling;
	idDiv.innerHTML = data;
	idDiv.id = data;
	
	let img = idDiv.parentElement.lastElementChild;
	img.innerHTML = '<img src="static/cross.png" style="width:50%"></img>'
	
	let doneButton = img.previousSibling;
	doneButton.innerHTML = `<button class="btn-light" onclick="doneTask(${data})">Done!</button>
							<button class="btn-light" onclick="deleteTask(${data})">Delete</button>`
	});
	});
}

async function recieveID() {
	response = await fetch('/add', {
		"method": "GET",
		"headers": {"Content-Type": "application/json"},
	})		
			
	data = await response.json();
    return data;
}

// id is Number
function doneTask(id) {
	
	// the number in the ID column on the website
	let taskNumber = document.getElementById(id);

	let state = taskNumber.parentElement.lastElementChild;
	state.innerHTML = '<img src="static/checked.png" style="width:50%"></img>'
	
	let btn = state.previousElementSibling;
	btn.innerHTML =`<button class="btn-light" onclick="undoTask(${id})">Undo</button>
					<button class="btn-light" onclick="deleteTask(${id})">Delete</button>`;
	
	// updated info is sent to app.py
	let t = {
		id_t: id,
		state: true,
	}
	
	fetch('/change', {
		"method": "POST",
		"headers": {"Content-Type": "application/json"},
		"body": JSON.stringify(t),
	}).then()
}

function undoTask(id) {
	let taskNumber = document.getElementById(id);
	let state = taskNumber.parentElement.lastElementChild;
	state.innerHTML = '<img src="static/cross.png" style="width:50%"></img>'
	
	let btn = state.previousElementSibling;
	btn.innerHTML =`<button class="btn-light" onclick="doneTask(${id})">Done!</button>
					<button class="btn-light" onclick="deleteTask(${id})">Delete</button>`;
	
	let t = {
		id_t: id,
		state: false,
	}
	
	fetch('/change', {
		"method": "POST",
		"headers": {"Content-Type": "application/json"},
		"body": JSON.stringify(t),
	}).then()
}

function deleteTask(id) {
	let taskNumber = document.getElementById(id);
	let outerDiv = taskNumber.parentElement;
	outerDiv.remove();
	
	fetch('/delete', {
		"method": "POST",
		"headers": {"Content-Type": "application/json"},
		"body": JSON.stringify(id),
	}).then()
}

// date_s - string
function dateWithoutTime(date_s){
	if (date_s != null){
		let date = new Date( Date.parse(date_s) );
		withoutTime = showNumbersBelowTenWithLeadingZero(date.getDate()) + '/' + 
			   showNumbersBelowTenWithLeadingZero(date.getMonth() + 1) +
			   '/' + date.getFullYear();
		return withoutTime;
	}
	return 'Not set'
}	

function timeWithoutDate(date_s){
	if (date_s != null){
		let date = new Date( Date.parse(date_s) );
		withoutDate = showNumbersBelowTenWithLeadingZero(date.getHours()) + ':' + 
			   showNumbersBelowTenWithLeadingZero(date.getMinutes()) +
			   ':' + showNumbersBelowTenWithLeadingZero(date.getSeconds());
		return withoutDate;
	}
	return 'Not set'
}
function loadTasks(){	
	fetch('/load', {
		"method": "GET",
		"headers": {"Content-Type": "application/json"},
	}).then((response) => {
      return response.json();
    })
    .then((data) => {
		for (let d of data){

			// show tasks in html
			let new_line = document.createElement('div');
			new_line.className = "row border m";
			let cells = [];
			
			// creating whole row for a task
			for (let i = 0; i < 7; i++) {
				let new_cell = document.createElement('div');
				new_cell.className = "col-sm-1";
				new_cell.innerHTML = "";
				cells.push(new_cell);
			}
			cells[2].className = "col-sm-6";
			cells[1].id = d[0];
			cells[1].innerHTML = d[0];
			cells[2].innerHTML = d[1];
			cells[3].innerHTML = dateWithoutTime(d[2]);
			cells[4].innerHTML = timeWithoutDate(d[2]);
			
			// these depend on the state
			cells[5].innerHTML = (d[3]) ?
			`<button class="btn-light" onclick="undoTask(${d[0]})">Undo</button>
			<button class="btn-light" onclick="deleteTask(${d[0]})">Delete</button>` :
			`<button class="btn-light" onclick="doneTask(${d[0]})">Done!</button>
			<button class="btn-light" onclick="deleteTask(${d[0]})">Delete</button>`;
			cells[6].innerHTML = (d[3]) ? 
			'<img src="static/checked.png" style="width:50%"></img>' : 
			'<img src="static/cross.png" style="width:50%"></img>';
			
			for (let i = 0; i < 7; i++) {
				new_line.appendChild(cells[i]);
			}

			let title = document.getElementById('top');
			title.after(new_line);
			
			// save tasks locally in Array
			let newTask = new Task(d[0], d[1], new Date( Date.parse(d[2]) ), d[3]);
			tasks.push(newTask);

		};
	})	
}