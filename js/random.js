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
	console.log("new RANDOM");
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

	var priority = '' + (Math.random() * FirebaseRandomList.MAX_PRIORITY);
	console.log("Set priority to " + priority);
	result.setPriority(priority);
}
