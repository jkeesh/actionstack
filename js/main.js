/// options = 'stack', 'queue', 'pqueue', 'random'
var DATA_STRUCTURE_TYPE = 'queue';

/*

TODO: WHEN EMPTY GIVE MESSAGE

*/


/* 
 This represnts a firebase data structure. A FirebaseDataStructure
 
 has three important methods

 addOneItem
 removeOneItem
 getFirsItem

 each different implementation of a firebase datastructure can handle
 these methods in different ways for different access to your list data
 */
function FirebaseDataStructure(ref){
	this.ref = ref;
}

FirebaseDataStructure.prototype.getPriority = function(callback){
	// use the default
	callback(null);
}

FirebaseDataStructure.prototype.getFirstItem = function(callback){
	var self = this;
	this.size(function(size){
		if(size == 0){
			callback(null, null);
		}
		self.ref.startAt().limit(1).once("child_added", function(snap){
			callback(snap.ref(), snap.val());
		});	
	});
}

FirebaseDataStructure.prototype.removeOneItem = function(callback){
	this.getFirstItem(function(ref, value){
		if(ref == null){
			callback(null);
		}else{
			ref.remove(function(){
				callback(value);
			});			
		}
	})
}

FirebaseDataStructure.prototype.getDefaultTitle = function(){
	return "My Data Structure";
}

/* 
This function adds an item with value item to our list.

@param item 	{string}		the item to add
*/
FirebaseDataStructure.prototype.addOneItem = function(item){
	var result = this.ref.push({
		'value': item
	});
}

FirebaseDataStructure.prototype.size = function(callback){
	this.ref.once('value', function(snap){
		var size = snap.numChildren();
		callback(size);
	});
}

//////////////////////////////////////////////
// FirebaseStack
//////////////////////////////////////////////

/*
A FirebaseStack provides last-in-first-out (LIFO) access to a list
When an item is added, it goes to the front of the list. When we
remove an item, we remove the most recently added item
*/
FirebaseStack.prototype = new FirebaseDataStructure();
FirebaseStack.prototype.constructor = FirebaseStack;

// This is the maximum priority for our stack. The first item added
// will get this priority. Each item after will get a lower priority.
FirebaseStack.MAX_PRIORITY = 10000;

function FirebaseStack(ref){
	FirebaseDataStructure.call(this, ref);
}

FirebaseStack.prototype.getDefaultTitle = function(){
	return "My Action Stack";
}


FirebaseStack.prototype.getPriority = function(callback){
	this.size(function(size){
		var result = '' + (FirebaseStack.MAX_PRIORITY - size);	
		callback(result);
	});
}

/* 
This function adds an item with value item to our stack. We figure out
how to place it properly by getting the priority and setting that
value in the callback.

@param item 	{string}		the item to add
*/
FirebaseStack.prototype.addOneItem = function(item){
	var result = this.ref.push({
		'value': item
	});

	this.getPriority(function(priority){
		result.setPriority(priority);
	});
}

FirebaseStack.prototype.removeOneItem = function(callback){
	this.getFirstItem(function(ref, value){
		ref.remove(callback);
	})
}

FirebaseStack.prototype.getFirstItem = function(callback){
	console.log("Get first.");
	this.ref.startAt().limit(1).once("child_added", function(snap){
		console.log("Got first. Now callback.");
		callback(snap.ref(), snap.val());
		console.log("Callback done.");
	});	
}


//////////////////////////////////////////////
// FirebaseQueue
//////////////////////////////////////////////

/*
A FirebaseQueue provides first-in-first-out (FIFO) access to a list
When an item is added, it is added to the back of the list.
*/
FirebaseQueue.prototype = new FirebaseDataStructure();
FirebaseQueue.prototype.constructor = FirebaseQueue;

function FirebaseQueue(ref){
	FirebaseDataStructure.call(this, ref);
}

FirebaseQueue.prototype.getDefaultTitle = function(){
	return "My Action Queue";
}


//////////////////////////////////////////////
// FirebasePriorityQueue
//////////////////////////////////////////////

/*
A FirebaseQueue provides first-in-first-out (FIFO) access to a list
When an item is added, it is added to the back of the list.
*/
FirebasePriorityQueue.prototype = new FirebaseDataStructure();
FirebasePriorityQueue.prototype.constructor = FirebasePriorityQueue;

function FirebasePriorityQueue(ref){
	FirebaseDataStructure.call(this, ref);
}

FirebasePriorityQueue.prototype.getDefaultTitle = function(){
	return "My Action PQueue";
}

/* 
This function adds an item with value item to our priority queue.
The only difference here is that we get the priority given to us
explicitly.

@param item 	{string}		the item to add 
								must be of the form 

									[priority] value

								like

									[5] clean up todos
*/
FirebasePriorityQueue.prototype.addOneItem = function(item){
	var lbracket = item.indexOf('[')
	var rbracket = item.indexOf(']');

	var priorityString = item.substring(lbracket + 1, rbracket).trim();

	var result = this.ref.push({
		'value': item
	});

	result.setPriority(priorityString);
}



//////////////////////////////////////////////
// FirebaseRandomList
//////////////////////////////////////////////

/*
A FirebaseQueue provides first-in-first-out (FIFO) access to a list
When an item is added, it is added to the back of the list.
*/
FirebaseRandomList.prototype = new FirebaseDataStructure();
FirebaseRandomList.prototype.constructor = FirebaseRandomList;

FirebaseRandomList.MAX_PRIORITY = 100000;

function FirebaseRandomList(ref){
	FirebaseDataStructure.call(this, ref);
}

FirebaseRandomList.prototype.getDefaultTitle = function(){
	return "My Random List";
}

/* 
This function adds an item with value item to our list. The
priority is chosen randomly.
*/
FirebaseRandomList.prototype.addOneItem = function(item){
	var result = this.ref.push({
		'value': item
	});

	var priority = Math.random() * FirebaseRandomList.MAX_PRIORITY;
	console.log("Set priority to " + priority);
	result.setPriority(priority);
}


$(function(){
	ActionStack = (function(type){
		var ADD_BUTTON = '#add-button';
		var ADD_INPUT = '#add-input';
		var REMOVE_BUTTON = '#remove-button';
		var TITLE_ID = '#title';
		var CURRENT = '#current';
		var STRUCTURE_ID = '#stack-id';
		var FIREBASE_URL = 'https://jkeesh.firebaseio.com/actionstack/';
		var myRootRef = new Firebase(FIREBASE_URL);

		// Our FirebaseDataStructure
		var dataStructure;

		// The id for this action data structure
		var structureID;

		// The firebase reference for this page
		var pageRef;

		// The current thing you should be doing
		var curRef;

		function makeDataStructure(){
			if(type == 'stack'){
				var stackRef = pageRef.child('stack');
				dataStructure = new FirebaseStack(stackRef);
			}else if(type == 'queue'){
				var queueRef = pageRef.child('queue');
				dataStructure = new FirebaseQueue(queueRef);
			}else if(type == 'pqueue'){
				var pqref = pageRef.child('pqueue');
				dataStructure = new FirebasePriorityQueue(pqref);
			}else if(type == 'random'){
				var randRef = pageRef.child('random');
				dataStructure = new FirebaseRandomList(randRef);
			}else{
				console.log("Bad type");
			}
			console.log("Set structure.");
		}

		// Look up an existing action stack
		function lookupStructure(){
	 		structureID = window.location.hash.replace('#', '');
	 		pageRef = myRootRef.child(structureID);
		}

		// There is no stack, so create one.
		function createStructure(){
		 	pageRef = myRootRef.push({
				title: ''
			});
			structureID = pageRef.name();
			location.hash = structureID;
		}

		// Create a new task
		function addTask(){
			var task = $(ADD_INPUT).val();
			$(ADD_INPUT).val("");	

			dataStructure.addOneItem(task);

			setCurrent();
		}

		// Remove a task from our data structure
		function removeTask(){
			dataStructure.removeOneItem(function(removed){
				setCurrent();		
			});
		}

		function setTaskHtml(val){
		}

		// Set the value of the current task
		function setCurrent(){
			dataStructure.getFirstItem(function(ref, val){
				if(val){
					$(CURRENT).html(val.value);								
				}else{
					$(CURRENT).html("Empty!");
				}
			});
		}

		// Setup the button to respond to clicks and
		// the text field to respond to enter
		function setupInputs(){
			$(ADD_BUTTON).click(addTask);
			$(ADD_INPUT).keypress(function(e){
				if(e.keyCode == 13){
					addTask();
				}
			});
			$(REMOVE_BUTTON).click(removeTask);
		}

		// Set the title and id of the stack
		function setData(){
			$(TITLE_ID).html(dataStructure.getDefaultTitle());

			pageRef.update({
				title: dataStructure.getDefaultTitle()
			});

			$(STRUCTURE_ID).html(structureID);
		}

		// Setup the page
		function setup(){
			setupInputs();

			// See if we have an old stack, or should make a new one
			if(window.location.hash){
				lookupStructure();
			}else{
				createStructure();
			}
			makeDataStructure();

			setData();
			setCurrent();

		}


		// Do things
		setup();
	}(DATA_STRUCTURE_TYPE));
});
