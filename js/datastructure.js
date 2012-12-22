/// options = 'stack', 'queue', 'pqueue', 'random'
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

FirebaseDataStructure.subclasses = {};

FirebaseDataStructure.addSubclass = function(name, type){
	FirebaseDataStructure.subclasses[name] = type;
}

FirebaseDataStructure.getSubclass = function(type){
	return FirebaseDataStructure.subclasses[type];
}

FirebaseDataStructure.prototype.getPriority = function(callback){
	// use the default
	callback(null);
}

var i = 0;

FirebaseDataStructure.prototype.getFirstItem = function(callback, first){
	console.log("FDS: get first item");
	var self = this;

	var thisTime = i;

	this.size(function(size){
		console.log("SIZE = " + size + " ,, " + thisTime);
		if(size == 0 && !first){
			callback(null, null);
		}else{
			self.ref.startAt().limit(1).once("child_added", function(snap){
				callback(snap.ref(), snap.val());
			});				
		}
	});

	i++;
}

FirebaseDataStructure.prototype.removeOneItem = function(callback){
	this.getFirstItem(function(ref, value){
		if(ref == null){
			if(callback){
				callback(null);				
			}
		}else{
			ref.remove(function(){
				if(callback){
					callback(value);					
				}
			});			
		}
	});
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

/*
Get the size of this data structure. Send the value back in a callback.
Use once here because we do not want to keep listening for events.

@param callback	{function}		the callback, passed the size
*/
FirebaseDataStructure.prototype.size = function(callback){
	this.ref.once('value', function(snap){
		var size = snap.numChildren();
		callback(size);
	});
}


