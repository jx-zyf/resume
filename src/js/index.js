function tab(){
	var oUl=document.querySelector('.nav_content>ul');
	var oLis=oUl.getElementsByTagName('li');
	var oDivs=document.querySelectorAll('.content>div');
	for(var i=0;i<oLis.length;i++){
		(function(i){
			oLis[i].onclick=function(){
				for(var j=0;j<oLis.length;j++){
					oLis[j].className="";
					oDivs[j].className="hide";
					oDivs[j].style.zIndex="1";
				}
				this.className="active";
				oDivs[i].className="show";
				oDivs[i].style.zIndex="8888";
			};
		})(i);
	}
}
function showNav(){
	var oNav=document.getElementById('nav');
	// var aNav=document.getElementsByTagName('nav')[0];
	var oUl=document.querySelector('.nav_content ul');
	var flag=false;
	oNav.onclick=function(e){
		if(oUl.style.visibility="hidden"&&!flag){
			oUl.className="slide";
			oUl.style.visibility="visible";
		}
		if(flag){
			oUl.className="slideHide";
			oUl.style.visibility="hidden";
		}
		flag=!flag;
		e.stopPropagation();
	}
	document.onclick=function(e){
		// console.log(e.target.id);
		if(e.target.id&&e.target.id=="nav"){
			return;
		}else{
			if(oUl.className!=""){
				oUl.className="slideHide";
				oUl.style.visibility="hidden";
				flag=false;
			}
		}
	}
	window.onresize=function(){
		if(document.body.offsetWidth>=760){
			oUl.className="";
			oUl.style.visibility="visible";
		}else{
			oUl.style.visibility="hidden";
		}
	}

}

window.onload=function(){
	tab();
	showNav();
};