$(function(){
	var ActionStack = (function(){
		var DEFAULT_TITLE = 'Your Action Stack';
		var FIREBASE_URL = 'https://jkeesh.firebaseio.com/actionstack/';
		var myRootRef = new Firebase(FIREBASE_URL);

		// The id for this action stack
		var stackID;

		// The firebase reference for this page
		var pageRef;

		// Look up an existing action stack
		function lookupStack(){
	 		stackID = window.location.hash.replace('#', '');
	 		pageRef = myRootRef.child(stackID);
	 		stackRef = pageRef.child('stack');
		}

		// There is no stack, so create one.
		function createStack(){
		 	pageRef = myRootRef.push({
				title: DEFAULT_TITLE
			});
			stackID = pageRef.name();
			location.hash = stackID;
		 	stackRef = pageRef.child('stack');
		}

		// Create a new task
		function pushTask(){
			var task = $("#push-input").val();
			stackRef.push({
				'value': task
			})
			$("#push-input").val("");	
			//setCurrent(task);		
		}

		function listenForUpdate(){
			var lastItem = stackRef.endAt().limit(1);
			lastItem.on('child_added', function(snap) { 
				var cur = snap.val();
				console.log(cur);
				setCurrent(cur.value);
			});

		}

		function setCurrent(val){
			$("#current").html(val);
		}

		function getCurrentItem(){
			stackRef.once('value', function(snap){
				console.log(snap);
				console.log(snap.val());
			});
		}

		// Setup the button to respond to clicks and
		// the text field to respond to enter
		function setupInputs(){
			$("#push-button").click(pushTask);
			$("#push-input").keypress(function(e){
				if(e.keyCode == 13){
					pushTask();
				}
			});
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
				lookupStack();
			}else{
				console.log("Creating new...");
				createStack();
			}

			setData();
			listenForUpdate();
//			getCurrentItem();
		}

		// Do things
		setup();
	}());
});


/*
Questions:

Why do I not need to wait for a callback on push() to get the name?



*/
