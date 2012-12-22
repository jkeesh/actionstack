//////////////////////////////////////////////
// FirebaseQueue
//////////////////////////////////////////////

/*
A FirebaseQueue provides first-in-first-out (FIFO) access to a list
When an item is added, it is added to the back of the list.
*/
FirebaseQueue.prototype = new FirebaseDataStructure();
FirebaseQueue.prototype.constructor = FirebaseQueue;

FirebaseDataStructure.addSubclass('queue', FirebaseQueue);

function FirebaseQueue(ref){
	FirebaseDataStructure.call(this, ref);
	console.log("new QUEUE");
}

FirebaseQueue.prototype.getDefaultTitle = function(){
	return "My Action Queue";
}