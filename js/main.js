function FirebaseDataStructure(ref){
	this.ref = ref;
}

FirebaseDataStructure.prototype.addOneItem = function(item){}
FirebaseDataStructure.prototype.removeOneItem = function(){}


FirebaseStack.prototype = new FirebaseDataStructure();
FirebaseStack.prototype.constructor = FirebaseStack;
function FirebaseStack(ref){
	FirebaseDataStructure.call(this, ref);
}

FirebaseStack.prototype.addOneItem = function(item){
	this.ref.push({
		'value': item
	});
}

FirebaseStack.prototype.removeOneItem = function(){
	this.ref.startAt().limit(1).on("child_added", function(snap){
		console.log(snap);
		console.log(snap.val());
		console.log(snap.name());
		console.log(snap.ref());
	});
}

/*
	function makeList(ref) {
  var fruits = ["banana", "apple", "grape", "orange"];
  for (var i = 0; i < fruits.length; i++) {
    ref.push(fruits[i]);
  }
}
 
function getFirstFromList(ref, cb) {
  ref.startAt().limit(1).on("child_added", function(snapshot) {
    cb(snapshot.val());
  });
}
 
// Running this should popup an alert with "banana".
function go() {
  var testRef = new Firebase("https://example.firebaseIO-demo.com/");
  makeList(testRef);
  getFirstFromList(testRef, function(val) {
    alert(val);
  });
}
*/


$(function(){




	ActionStack = (function(){
		var DEFAULT_TITLE = 'Your Action Stack';
		var FIREBASE_URL = 'https://jkeesh.firebaseio.com/actionstack/';
		var myRootRef = new Firebase(FIREBASE_URL);

		// The id for this action stack
		var stackID;

		// The firebase reference for this page
		var pageRef;

		// The firebase for the stack
		var stackRef;

		// The current thing you should be doing
		var curRef;

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

		function popTask(){
			curRef.remove();


		}

		function listenForUpdate(){
			var lastItem = stackRef.limit(1);
			lastItem.on('child_added', function(snap) { 
				console.log("ADD");
				var cur = snap.val();
				console.log(snap.name())
				console.log(snap.ref());

				curRef = snap.ref();

				console.log(cur);
				setCurrent(cur.value);
			});

			stackRef.on('child_removed', function(removed){
				console.log("REMOVED:" );
				console.log(removed.val());

				stackRef.on('value', function(snap){
					console.log("NEW STATUS");
					console.log(snap.val());

					var numChildren = snap.numChildren();

					if(numChildren == 0){
						setCurrent("Empty!");
						return;
					}

					console.log(numChildren);
					var i = 1;
					snap.forEach(function(child){
						console.log(i);
						var cur = child.val();
						console.log(child.ref());

						if(i == numChildren){
							setCurrent(cur.value);
							curRef = child.ref();
						}

						console.log(cur);
						i++;
					})
				})
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
			$("#pop-button").click(popTask);
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

Why do i get a remove genreated for each thing in the list?

			var lastItem = stackRef.limit(1);
			lastItem.on('child_added', function(snap) { 
				/// works...
			});

			lastItem.on('child_removed', function(snap) { 
				/// gets called for each one...?
			});

*/
