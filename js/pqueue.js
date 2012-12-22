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
	console.log("new PQUEUE");
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