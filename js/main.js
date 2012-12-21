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




	ActionStack = (function(){
		var DEFAULT_TITLE = 'Your Action Stack';
		var FIREBASE_URL = 'https://jkeesh.firebaseio.com/actionstack/';
		var myRootRef = new Firebase(FIREBASE_URL);

		// Our FirebaseDataStructure
		var dataStructure;

		// The id for this action stack
		var stackID;

		// The firebase reference for this page
		var pageRef;

		// The firebase for the stack
		var stackRef;

		// The current thing you should be doing
		var curRef;

		function makeDataStructure(){
			stackRef = pageRef.child('stack');
			dataStructure = new FirebaseStack(stackRef);
		}

		// Look up an existing action stack
		function lookupStructure(){
	 		stackID = window.location.hash.replace('#', '');
	 		pageRef = myRootRef.child(stackID);
		}

		// There is no stack, so create one.
		function createStructure(){
		 	pageRef = myRootRef.push({
				title: DEFAULT_TITLE
			});
			stackID = pageRef.name();
			location.hash = stackID;
		}

		// Create a new task
		function addTask(){
			var task = $("#push-input").val();
			$("#push-input").val("");	

			dataStructure.addOneItem(task);

			setCurrent();
		}

		function removeTask(){
			dataStructure.removeOneItem(function(success){
				console.log("Success? " + success);
				setCurrent();
			});
		}

		function setCurrent(){
			console.log("===== Setting current...");
			dataStructure.getFirstItem(function(ref, val){
				console.log("In set current callback...");
				console.log(val);
				$("#current").html(val.value);
				console.log("===== end setCurrent");
			});
		}

		// Setup the button to respond to clicks and
		// the text field to respond to enter
		function setupInputs(){
			$("#push-button").click(addTask);
			$("#push-input").keypress(function(e){
				if(e.keyCode == 13){
					addTask();
				}
			});
			$("#pop-button").click(removeTask);
		}

		// Set the title and id of the stack
		function setData(){
			$("#title").html(DEFAULT_TITLE);
			$("#stack-id").html(stackID);
		}

		function setup(){
			setupInputs();

			// See if we have an old stack, or should make a new one
			if(window.location.hash){
				console.log("Looking up old...");
				lookupStructure();
			}else{
				console.log("Creating new...");
				createStructure();
			}
			makeDataStructure();

			setData();
			setCurrent();
		}

		// Do things
		setup();
	}());
});


/*
Questions:

Why do I not need to wait for a callback on push() to get the name?

Why do i get a remove genreated for each thing in the list?

			var lastItem = stackRef.limit(1);
			lastItem.on('child_added', function(snap) { 
				/// works...
			});

			lastItem.on('child_removed', function(snap) { 
				/// gets called for each one...?
			});

*/
