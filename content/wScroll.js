wScrollSpeed = 0.15;
wScrollList = [];

function wScroll(id) {
	window.addEventListener('load', function () {
		document.getElementById(id).innerHTML = "<div class='wScrollConent' id='" + id + "_content'><div class='wScrollScrollBar' id='" + id + "_bar'><div class='wScrollScroll' id='" + id + "_scroll'></div></div><div class='wScrollScrolling' id='" + id + "_scrolling'>" + document.getElementById(id).innerHTML + "</div></div>";
		
		var heigh = document.getElementById(id).offsetHeight;
		console.log(heigh);
		
		document.getElementById(id).addEventListener("mousewheel", wScrollMove, false);
		document.getElementById(id).addEventListener("DOMMouseScroll", wScrollMove, false);
		document.getElementById(id).addEventListener("keydown", wScrollMove, false);
		//document.getElementById(id).addEventListener("touchmove mousemove", wScrollTouchMove, false);
		
		document.getElementById(id).destinationPosition = 0;
		document.getElementById(id).marginPosition = 0;
		document.getElementById(id).invoked = false;
		//document.getElementById(id).smaller = false;
		//document.getElementById(id).scrollSize = 0;
		//document.getElementById(id).maxHeight = document.getElementById(id + "_content").offsetHeight;
		//document.getElementById(id).scrollingHeight = document.getElementById(id + "_scrolling").offsetHeight;
		
		wScrollList.push(document.getElementById(id));
		wScrollSizeChange();
	});
}

(function wScrollSizeLoop() {
	setTimeout(function(){wScrollSizeChange(); wScrollSizeLoop();}, 400);
	
})();

function wScrollMove(e) {
	var stop = false;
	var evt = window.event || e;
	var delta = evt.detail ? evt.detail : evt.wheelDelta;
	evt.stopPropagation();
	
	if (delta == undefined || delta == 0) {
		if (evt.keyCode == 38) {
			delta = 120;
		} else if (evt.keyCode == 40) {
			delta = -120;
		} else {
			stop = true;
		}
	}
	
	if (!this.smaller && !stop) {
		if ((this.destinationPosition > 0 && delta > 0) || (this.destinationPosition < 0 && delta < 0)) {
			this.destinationPosition += delta;
		} else if ((this.destinationPosition == 0) || (this.destinationPosition > 0 && delta < 0) || (this.destinationPosition < 0 && delta > 0)) {
			this.destinationPosition = delta;
		}
		
		if (!this.invoked) {
			this.invoked = true;
			wScrolling(this);
		}
	}
}

function wScrolling(element) {
	var delta = element.destinationPosition * wScrollSpeed;
	element.destinationPosition = element.destinationPosition - delta;
	
	if (element.destinationPosition < 1 && element.destinationPosition > -1) {
		element.destinationPosition = 0;
		delta = 0;
		element.invoked = false;
	}
	element.marginPosition += delta;
	
	if (element.marginPosition < element.maxHeight - element.scrollingHeight) {
		element.marginPosition = element.maxHeight - element.scrollingHeight;
		element.destinationPosition = 0;
	} else if (element.marginPosition > 0) {
		element.marginPosition = 0;
		element.destinationPosition = 0;
	}
	
	document.getElementById(element.id + "_scrolling").style.marginTop = element.marginPosition + "px";
	document.getElementById(element.id + "_scroll").style.marginTop = - element.maxHeight / element.scrollingHeight * element.marginPosition + "px";
	
	if (element.invoked) {
		setTimeout(function(){ wScrolling(element); }, 10);
	}
}

function wScrollSizeChange() {
	for (i = 0; i < wScrollList.length; i++) {
		if (document.getElementById(wScrollList[i].id + "_scrolling").offsetHeight != wScrollList[i].scrollingHeight || document.getElementById(wScrollList[i].id).offsetHeight != wScrollList[i].maxHeight) {
			wScrollList[i].maxHeight = document.getElementById(wScrollList[i].id + "_content").offsetHeight;
			wScrollList[i].scrollingHeight = document.getElementById(wScrollList[i].id + "_scrolling").offsetHeight;
			wScrollList[i].scrollSize = Math.pow(wScrollList[i].maxHeight, 2) / wScrollList[i].scrollingHeight;
				
				//console.log(wScrollList[i].id);
				//console.log(wScrollList[i].scrollingHeight);
				//console.log(wScrollList[i].scrollSize);
				//console.log(wScrollList[i].maxHeight);
				//console.log(this.maxHeight);
				//console.log(this.scrollingHeight);
				//console.log(this.invoked);
			
			if (document.getElementById(wScrollList[i].id).scrollingHeight < document.getElementById(wScrollList[i].id).maxHeight) {
				document.getElementById(wScrollList[i].id + "_bar").style.visibility = "hidden";
				document.getElementById(wScrollList[i].id + "_content").style.paddingRight = "0px";
				wScrollList[i].smaller = true;
				
				document.getElementById(wScrollList[i].id).marginPosition = 0;
			} else {
				document.getElementById(wScrollList[i].id + "_bar").style.visibility = "";
				document.getElementById(wScrollList[i].id + "_content").style.paddingRight = "";
				wScrollList[i].smaller = false;
				
				if (document.getElementById(wScrollList[i].id).marginPosition < document.getElementById(wScrollList[i].id).maxHeight - document.getElementById(wScrollList[i].id).scrollingHeight) {
					document.getElementById(wScrollList[i].id).marginPosition = document.getElementById(wScrollList[i].id).maxHeight - document.getElementById(wScrollList[i].id).scrollingHeight;
				}
			}
			
			document.getElementById(wScrollList[i].id + "_scrolling").style.marginTop = document.getElementById(wScrollList[i].id).marginPosition + "px";
			document.getElementById(wScrollList[i].id + "_scroll").style.height = wScrollList[i].scrollSize + "px";
			document.getElementById(wScrollList[i].id + "_scroll").style.marginTop = - document.getElementById(wScrollList[i].id).maxHeight / document.getElementById(wScrollList[i].id).scrollingHeight * document.getElementById(wScrollList[i].id).marginPosition + "px";
		}
	}
};

