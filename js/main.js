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
			var structureRef = pageRef.child(type);
			var subclass = FirebaseDataStructure.getSubclass(type);
			dataStructure = new subclass(structureRef);
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

		// Set the value of the current task
		function setCurrent(forced){
			if(typeof forced == "undefined"){
				forced = false;
			}else{
				forced = true;
			}
			dataStructure.getFirstItem(function(ref, val){
				if(val){
					$(CURRENT).html(val.value);								
				}else{
					$(CURRENT).html("Empty!");
				}
			}, forced);
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
			setCurrent(true);
		}

		// Do things
		setup();
	}(DATA_STRUCTURE_TYPE));
});
