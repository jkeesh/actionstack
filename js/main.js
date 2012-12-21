var DATA_STRUCTURE_TYPE = 'stack';


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

FirebaseDataStructure.prototype.addOneItem = function(item){}
FirebaseDataStructure.prototype.removeOneItem = function(){}
FirebaseDataStructure.prototype.getFirstItem = function(){}


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
		console.log("Setting priority of " + item + " to " + priority);
		result.setPriority(priority);
	});
}

FirebaseStack.prototype.removeOneItem = function(callback){
	this.getFirstItem(function(ref, value){
		ref.remove(callback);
	})
}

FirebaseStack.prototype.getFirstItem = function(callback){
	this.ref.startAt().limit(1).once("child_added", function(snap){
		callback(snap.ref(), snap.val());
	});	
}


$(function(){
	ActionStack = (function(type){
		var ADD_BUTTON = '#add-button';
		var ADD_INPUT = '#add-input';
		var REMOVE_BUTTON = '#remove-button';
		var TITLE_ID = '#title';
		var CURRENT = '#current';
		var STRUCTURE_ID = '#stack-id';

		var DEFAULT_TITLE = 'Your Action Stack';
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
			}else{
				console.log("Bad type");
			}
		}

		// Look up an existing action stack
		function lookupStructure(){
	 		structureID = window.location.hash.replace('#', '');
	 		pageRef = myRootRef.child(structureID);
		}

		// There is no stack, so create one.
		function createStructure(){
		 	pageRef = myRootRef.push({
				title: DEFAULT_TITLE
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
			dataStructure.removeOneItem(function(success){
				setCurrent();
			});
		}

		// Set the value of the current task
		function setCurrent(){
			dataStructure.getFirstItem(function(ref, val){
				$(CURRENT).html(val.value);
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
			$(TITLE_ID).html(DEFAULT_TITLE);
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
