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

FirebaseDataStructure.addSubclass('stack', FirebaseStack);


// This is the maximum priority for our stack. The first item added
// will get this priority. Each item after will get a lower priority.
FirebaseStack.MAX_PRIORITY = 10000;

function FirebaseStack(ref){
	FirebaseDataStructure.call(this, ref);
	console.log("new STACK");
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
		console.log("Set priority = " + priority);
		result.setPriority(priority);
	});
}
