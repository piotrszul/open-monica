dojo.require("dijit.Dialog");dojo.require("dojo.parser");dojo.require("dojo.NodeList-traverse");dojo.require("dojo.data.ItemFileReadStore");dojo.require("dijit.Tree");dojo.require("dojox.timing._base");
function monicaConnection(a){this.monitoringServer=a?a:"monhost-nar";this.requestedPoints=[];this.pointRequests=[];this.returnedData=[];this.intervalPoints=[];this.intervalPointRequester=[];this.intervalStartTimes=[];this.intervalTimeInterval=[];this.intervalMaxPoints=[];this.intervalCompleted=[];this.intervalPointResponse=[];this.availableMonitoringPoints=[];this.monPoints={};this.updateTime=-1;this.updateInterval=new dojox.timing.Timer;this.isUpdating=false;this.initialise()}
monicaConnection.prototype.disconnect=function(){for(var a in this)delete this[a]};monicaConnection.prototype.comms=function(a,b){var c=this;dojo.xhrPost({url:"/cgi-bin/obstools/web_monica/monicainterface.pl",sync:true,content:{action:a,server:this.monitoringServer,points:b},load:function(d){c.returnedData=d.split(/\n/)},error:function(d){alert(d)}})};
monicaConnection.prototype.initialise=function(){this.comms("names");this.oMPTree=[];for(var a=0,b=0;b<this.returnedData.length;b++){this.availableMonitoringPoints[b]=this.returnedData[b];this.monPoints[this.returnedData[b]]={};for(var c=this.availableMonitoringPoints[b].split(/\./),d=this.oMPTree,e=1;e<c.length;e++){for(var f=0,i=0;i<d.length;i++)if(d[i].label==c[e]){f=1;d=d[i].children;break}if(f==0){d.push({id:++a,label:c[e],children:[]});d=d[d.length-1].children}}d.push({id:this.availableMonitoringPoints[b],
label:c[0],pointName:this.availableMonitoringPoints[b]})}this.requestedPoints=[];this.store=new dojo.data.ItemFileReadStore({data:{identifier:"id",label:"label",items:this.oMPTree}});this.treeModel=new dijit.tree.ForestStoreModel({store:this.store})};
monicaConnection.prototype.getDescriptions=function(){for(var a="",b=0;b<this.requestedPoints.length;b++){if(b>0)a+=";";a+=this.requestedPoints[b]}for(var c=0;c<this.intervalPoints.length;c++){if(b>1||c>0)a+=";";a+=this.intervalPoints[c]}this.comms("descriptions",a);for(b=0;b<this.returnedData.length;b++){a=this.returnedData[b].split(/\|/);this.monPoints[a[0]].pointName=a[0];this.monPoints[a[0]].updateTime=a[1];this.monPoints[a[0]].units=a[2];this.monPoints[a[0]].description=a[3]}this.pollValues()};
monicaConnection.prototype.pollValues=function(){if(this.requestedPoints.length>0){for(var a="",b=0;b<this.requestedPoints.length;b++){if(b>0)a+=";";a+=this.requestedPoints[b]}this.comms("points",a);for(b=0;b<this.returnedData.length;b++){a=this.returnedData[b].split(/\s+/);a[0]!=""&&this.updateClass(a[0],a[2],a[3],this.monPoints[a[0]].description,this.monPoints[a[0]].units)}}if(this.intervalPoints.length>0){a="";var c=0;for(b=0;b<this.intervalPoints.length;b++)if(this.intervalCompleted[b]==false){if(c>
0)a+=";";a+=this.intervalPoints[b]+","+this.intervalStartTimes[b]+","+this.intervalTimeInterval[b]+","+this.intervalMaxPoints[b];c++}this.comms("intervals",a);for(b=0;b<this.returnedData.length;b++)if(this.returnedData[b]!=""){this.returnedData[b]=this.returnedData[b].replace(/[\u00c2><]/g,"");this.intervalPointResponse[b]=eval("("+this.returnedData[b]+")");this.intervalPointResponse[b]=this.convertToNumbers(this.intervalPointResponse[b])}a=[];for(b=0;b<this.intervalPointRequester.length;b++){for(var d=
c=0;d<a.length;d++)if(a[d]==this.intervalPointRequester[b]){c=1;break}if(c==0){this.intervalPointRequester[b].updaterFunction();a.push(this.intervalPointRequester[b])}}}};function isNumber(a){return typeof a==="number"&&isFinite(a)}
monicaConnection.prototype.convertToNumbers=function(a){for(var b=0;b<a.data.length;b++)if(!isNumber(a.data[b][1]))if(a.data[b][1].match(/\:/)||a.data[b][1].match(/\|/)){var c=a.data[b][1].split(/[\:\|]/g),d=1;if(a.data[b][1].match(/^\-/))d=-1;c[0]*=d;c=c[0]+c[1]/60+c[2]/3600;c*=d;a.data[b][1]=c}return a};
monicaConnection.prototype.updateClass=function(a,b,c,d,e){a=this.safifyClassName(a);var f="description_"+a,i="units_"+a;b=b.replace(/[\u00c2><]/g,"");dojo.query("."+a).forEach(function(g){if(dojo.isIE)g.innerText=b;else g.innerHTML=b;c=="true"?dojo.removeClass(g,"pointWarning"):dojo.addClass(g,"pointWarning")});dojo.query("."+f).forEach(function(g){if(dojo.isIE)g.innerText=d;else g.innerHTML=d});dojo.query("."+i).forEach(function(g){if(dojo.isIE)g.innerText=e;else g.innerHTML=e})};
monicaConnection.prototype.safifyClassName=function(a){return a.replace(/\./g,"").replace(/\+/g,"plus")};monicaConnection.prototype.addUpdatePoint=function(a){for(var b=0;b<a.length;b++){for(var c=-1,d=0;d<this.requestedPoints.length;d++)if(a[b]==this.requestedPoints[d]){c=d;break}if(c==-1){this.requestedPoints.push(a[b]);this.pointRequests.push(1)}else this.pointRequests[d]++}};
monicaConnection.prototype.addTimeSeriesPoint=function(a,b){for(var c=0;c<a.length;c++){for(var d=-1,e=0;e<this.intervalPoints.length;e++)if(this.intervalPoints[e]==a[c]&&this.intervalPointRequester[e]==b){d=e;break}if(d==-1){this.intervalPoints.push(a[c]);this.intervalPointRequester.push(b);this.intervalStartTimes.push(null);this.intervalTimeInterval.push(null);this.intervalMaxPoints.push(null);this.intervalCompleted.push(false)}}};
monicaConnection.prototype.removeTimeSeriesPoint=function(a,b){if(a!=null)for(var c=0;c<a.length;c++)for(var d=0;d<this.intervalPoints.length;d++){if(this.intervalPoints[d]==a[c]&&this.intervalPointRequester[d]==b){this.intervalPoints.splice(d,1);this.intervalPointRequester.splice(d,1);this.intervalStartTimes.splice(d,1);this.intervalTimeInterval.splice(d,1);this.intervalMaxPoints.splice(d,1);this.intervalCompleted.splice(d,1);break}}else for(c=0;c<this.intervalPoints.length;c++)if(this.intervalPointRequester[c]==
b){this.intervalPoints.splice(c,1);this.intervalPointRequester.splice(c,1);this.intervalStartTimes.splice(c,1);this.intervalTimeInterval.splice(c,1);this.intervalMaxPoints.splice(c,1);this.intervalCompleted.splice(c,1);c--}};
monicaConnection.prototype.setTimeSeriesPointRange=function(a,b,c,d){for(var e=false,f=0;f<this.intervalPointRequester.length;f++)if(this.intervalPointRequester[f]==a)if(this.intervalStartTimes[f]!=b||this.intervalTimeInterval[f]!=c||this.intervalMaxPoints[f]!=d){this.intervalCompleted[f]=false;this.intervalStartTimes[f]=b;this.intervalTimeInterval[f]=c;this.intervalMaxPoints[f]=d;e=true}return e};
monicaConnection.prototype.getTimeSeriesPoints=function(a){for(var b=[],c=0;c<this.intervalPoints.length;c++)this.intervalPointRequester[c]==a&&this.intervalPointResponse[c]&&b.push(this.intervalPointResponse[c]);return b};
monicaConnection.prototype.removeUpdatePoint=function(a){if(this.requestedPoints)for(var b=0;b<a.length;b++)for(var c=0;c<this.requestedPoints.length;c++)if(a[b]==this.requestedPoints[c]){this.pointRequests[c]--;if(this.pointRequests[c]==0){this.requestedPoints.splice(c,1);this.pointRequests.splice(c,1)}break}};
monicaConnection.prototype.startMonitoring=function(a){this.updateInterval.stop();this.isUpdating=false;if(a)this.updateTime=a*1E3;else a=this.updateTime;this.updateInterval.setInterval(this.updateTime);var b=this;this.updateInterval.onTick=function(){b.pollValues()};this.updateInterval.start();this.isUpdating=true};monicaConnection.prototype.stopMonitoring=function(){this.updateInterval.stop();this.isUpdating=false};
function monicaContainer(a){this.containerName="";this.containerParent=null;if(a){if(a.name)this.containerName=a.name;if(a.parent)this.containerParent=a.parent}this.domNode=dojo.create("div");dojo.attr(this.domNode,"class","monicaContainer");if(this.containerName!="")this.domNode.id=this.containerName;this.changeViewButton=dojo.create("button",{type:"button","class":"changeViewButton",innerHTML:"Edit"});this.domNode.appendChild(this.changeViewButton);this.viewButtonHandle=dojo.connect(this.changeViewButton,
"onclick",this,this.switchView);this.closeViewImage=dojo.create("img",{src:"closebutton.png","class":"closeButton",width:"16px",height:"16px"});this.domNode.appendChild(this.closeViewImage);this.closeButtonHandle=dojo.connect(this.closeViewImage,"onclick",this,this.destroyContainer);this.overlapTable=dojo.create("table",{"class":"containerOverlapTable"});this.contentRow=dojo.create("tr");this.overlapTable.appendChild(this.contentRow);this.editorRow=dojo.create("tr");this.overlapTable.appendChild(this.editorRow);
this.content=dojo.create("div",{"class":"containerContent"});this.editor=dojo.create("div",{"class":"containerEditor"});this.contentRow.appendChild(this.content);this.editorRow.appendChild(this.editor);this.domNode.appendChild(this.overlapTable);this.contentRow.style.visibility="visible";this.editorRow.style.visibility="collapse";this.isShowing=true;this.childObject=null;this.childType=""}
monicaContainer.prototype.destroyContainer=function(){this.containerParent&&this.containerParent.childStopped(this);this.childObject.destroy();dojo.disconnect(this.viewButtonHandle);dojo.disconnect(this.closeButtonHandle);dojo.destroy(this.domNode)};
monicaContainer.prototype.switchView=function(){if(this.changeViewButton.innerHTML=="Edit"){this.changeViewButton.innerHTML="Show Content";this.contentRow.style.visibility="collapse";this.editorRow.style.visibility="visible";this.isShowing=false}else{this.changeViewButton.innerHTML="Edit";this.contentRow.style.visibility="visible";this.editorRow.style.visibility="collapse";this.isShowing=true;this.childObject.hasChanged==true&&this.childObject.updaterFunction()}};
function pointTable(a,b){this.hasPoints=[];this.contentDomNode=dojo.create("div",{"class":"pointTableDiv"});this.editDomNode=dojo.create("div",{"class":"pointTableEdit"});this.monicaServer=a;this.monicaContainer=b;this.monicaContainer.childObject=this;this.monicaContainer.childType="pointTable";this.updaterFunction=this.updateTables;this.hasChanged=true;this.monicaContainer.content.appendChild(this.contentDomNode);this.monicaContainer.editor.appendChild(this.editDomNode);this.treeSideDiv=dojo.create("div",
{"class":"pointTableTreeSideDiv"});this.treeSideDiv.appendChild(dojo.create("p",{innerHTML:"Available Points"}));this.treeDiv=dojo.create("div",{"class":"pointTableTreeDiv"});this.treeControl=new dijit.Tree({model:this.monicaServer.treeModel,showRoot:false,"class":"pointTreeControl"});this.treeDiv.appendChild(this.treeControl.domNode);this.treeSideDiv.appendChild(this.treeDiv);this.editDomNode.appendChild(this.treeSideDiv);this.treeHandle=dojo.connect(this.treeControl,"onDblClick",this,this.addFromClick);
this.editSelectDiv=dojo.create("div",{"class":"pointTableEditDiv"});this.editSelectDiv.appendChild(dojo.create("p",{innerHTML:"Points in table"}));this.editSelectScrollDiv=dojo.create("div",{"class":"pointTableEditScrollDiv"});this.editSelectDiv.appendChild(this.editSelectScrollDiv);this.editSelect=dojo.create("select",{multiple:"multiple",size:"20","class":"pointTableEditSelect"});this.editSelectScrollDiv.appendChild(this.editSelect);this.editRemoveButton=dojo.create("button",{type:"button",innerHTML:"Remove Points",
"class":"pointTableEditRemoveButton"});this.editSelectDiv.appendChild(this.editRemoveButton);this.removeButtonHandle=dojo.connect(this.editRemoveButton,"onclick",this,this.removePoints);this.removeClickHandle=dojo.connect(this.editSelect,"ondblclick",this,this.removeFromClick);this.editDomNode.appendChild(this.editSelectDiv);this.editSelectOptions=[]}
pointTable.prototype.destroy=function(){this.monicaServer.removeUpdatePoint(this.hasPoints);dojo.disconnect(this.treeHandle);dojo.disconnect(this.removeButtonHandle);dojo.disconnect(this.removeClickHandle)};pointTable.prototype.addFromClick=function(a){a=this.monicaServer.store.getValue(a,"id");a.split(/\./);this.addPoints([a])};
pointTable.prototype.addPoints=function(a){for(var b=[],c=0;c<a.length;c++){for(var d=0,e=0;e<this.hasPoints.length;e++)if(a[c]==this.hasPoints[e]){d=1;break}if(d==0){this.hasPoints.push(a[c]);b.push(a[c]);this.editSelectOptions.push(dojo.create("option",{innerHTML:a[c]}));this.editSelect.appendChild(this.editSelectOptions[this.editSelectOptions.length-1])}}this.monicaServer.addUpdatePoint(b);this.hasChanged=true;this.monicaContainer.isShowing==true&&this.updaterFunction()};
pointTable.prototype.removeFromClick=function(a){a=a.target;this.monicaServer.removeUpdatePoint([a.innerHTML]);for(var b=0;b<this.hasPoints.length;b++)if(this.hasPoints[b]==a.innerHTML){this.hasPoints.splice(b,1);break}dojo.destroy(a);this.hasChanged=true};
pointTable.prototype.removePoints=function(){for(var a=[],b=0;b<this.editSelectOptions.length;b++)if(this.editSelectOptions[b].selected){a.push(this.editSelectOptions[b].innerHTML);for(var c=0;c<this.hasPoints.length;c++)if(this.hasPoints[c]==this.editSelectOptions[b].innerHTML){this.hasPoints.splice(c,1);break}dojo.destroy(this.editSelectOptions[b]);this.editSelectOptions.splice(b,1);b--}this.monicaServer.removeUpdatePoint(a);this.hasChanged=true};
pointTable.prototype.updateTables=function(){dojo.empty(this.contentDomNode);for(var a=[],b=[],c=[],d=[],e=0;e<this.hasPoints.length;e++){for(var f=this.hasPoints[e].split(/\./),i=f[1],g=2;g<f.length;g++)i+="."+f[g];var k=/^(\D+)(\d*)(.*)$/i.exec(f[0]),h=1;for(g=0;g<b.length;g++)if(b[g]==k[1]){var j=1;for(h=0;h<c[g].length;h++)if(c[g][h]==f[0]){j=0;break}j==1&&c[g].push(f[0]);j=1;for(h=0;h<d[g].length;h++)if(d[g][h]==i){j=0;break}j==1&&d[g].push(i);h=0;break}if(h==1){b.push(k[1]);c.push([f[0]]);d.push([i])}}for(e=
0;e<b.length;e++){c[e].sort();a[e]=dojo.create("table",{"class":"pointTable"});f=dojo.create("tr");h=dojo.create("td");f.appendChild(h);for(g=0;g<c[e].length;g++){h=dojo.create("td",{innerHTML:"<b>"+c[e][g]+"</b>"});f.appendChild(h)}h=dojo.create("td");f.appendChild(h);a[e].appendChild(f);for(g=0;g<d[e].length;g++){i=dojo.create("tr");k=[];f=RegExp(d[e][g]+"$");for(h=0;h<this.hasPoints.length;h++)this.hasPoints[h].search(f)!=-1&&k.push(this.hasPoints[h]);j=dojo.create("th",{"class":"description_"+
this.monicaServer.safifyClassName(k[0]),innerHTML:"&nbsp;"});i.appendChild(j);for(h=0;h<c[e].length;h++){j=dojo.create("td",{innerHTML:"&nbsp;"});for(var l=0;l<k.length;l++){f=k[l].split(/\./);if(f[0]==c[e][h]){dojo.addClass(j,this.monicaServer.safifyClassName(k[l]));break}}i.appendChild(j)}j=dojo.create("td",{"class":"units_"+this.monicaServer.safifyClassName(k[0]),innerHTML:"&nbsp;"});i.appendChild(j);a[e].appendChild(i)}this.contentDomNode.appendChild(a[e])}this.monicaServer.getDescriptions();
this.hasChanged=false};
function monicaHTMLFrontPage(a){if(!a){document.write("New monicaHTMLFrontPage was not called with an options object, you fail!");return null}if(!a.topDivId){document.write("Must supply ID of top level element to attach to, as topDivId!");return null}if(!a.availableServers){document.write("Must supply list of available MoniCA servers, as availableServers!");return null}this.topDivId=a.topDivId;this.availableServers=a.availableServers;this.updateTime=!a.updateTime||a.updateTime<0?10:a.updateTime;this.monicaConnection=
{serverIndex:-1,serverConnection:null};for(a=0;a<this.availableServers.length;a++)if(this.availableServers[a].connect&&this.availableServers[a].connect==true){this.monicaConnection.serverConnection=new monicaConnection(this.availableServers[a].host);this.monicaConnection.serverIndex=a;break}this.childContainers=[];this.childPointTables=[];this.childPlots=[];this.dialogPopup=new dijit.Dialog({title:"MoniCA Dialog"});this.dialogPopupDiv=dojo.create("div",{id:"frontPageDialog"});this.dialogPopup.attr("content",
this.dialogPopupDiv);this.dialogTable=dojo.create("table");this.dialogPopupDiv.appendChild(this.dialogTable);this.dialogLinkRow=dojo.create("tr");this.dialogTable.appendChild(this.dialogLinkRow);this.dialogLinkCell=dojo.create("td");this.dialogLinkRow.appendChild(this.dialogLinkCell);this.dialogLinkCell.appendChild(dojo.create("div",{innerHTML:"Page link:"}));this.dialogLinkBox=dojo.create("textarea",{name:"dialogLinkBox",cols:"60",rows:"20"});this.dialogLinkCell.appendChild(this.dialogLinkBox);this.frontPageHeader=
null;this.draw()}
monicaHTMLFrontPage.prototype.connectServer=function(a){if(this.monicaConnection.serverConnection){if(this.monicaConnection.serverConnection.monitoringServer==a.host)return;this.disconnectServer()}for(var b=-1,c=0;c<this.availableServers.length;c++)if(this.availableServers[c].host==a.host){b=c;break}if(b==-1){if(!a.name)a.name=a.host;this.availableServers.push(a);b=this.availableServers.length-1;this.draw()}this.monicaConnection.serverConnection=new monicaConnection(this.availableServers[b].host);this.monicaConnection.serverIndex=
b;this.buttonStates()};monicaHTMLFrontPage.prototype.disconnectServer=function(){this.monicaConnection.serverConnection.disconnect();this.monicaConnection.serverConnection=null;this.monicaConnection.serverIndex=-1};
monicaHTMLFrontPage.prototype.draw=function(){if(this.frontPageHeader!=null)dojo.empty(this.frontPageHeader);else{this.frontPageHeader=dojo.create("div",{"class":"frontPageHeader"});dojo.byId(this.topDivId).appendChild(this.frontPageHeader)}this.frontPageHeader.appendChild(dojo.create("div",{innerHTML:"MoniCA Web Client Page"}));var a=dojo.create("div",{"class":"frontPageOptionsDiv"});this.frontPageHeader.appendChild(a);var b=dojo.create("table",{"class":"frontPageOptionsTable"});a.appendChild(b);
a=dojo.create("tr");b.appendChild(a);a.appendChild(dojo.create("th",{innerHTML:"MoniCA Server:"}));this.monicaServersBox=dojo.create("select",{id:"monicaServerSelection"});for(var c=0;c<this.availableServers.length;c++)this.monicaServersBox.appendChild(dojo.create("option",{value:this.availableServers[c].host,innerHTML:this.availableServers[c].name}));c=dojo.create("td");c.appendChild(this.monicaServersBox);a.appendChild(c);a.appendChild(dojo.create("th",{innerHTML:"Update Time (s):"}));this.updateTimeBox=
dojo.create("input",{type:"text",id:"updateTimeValue",value:this.updateTime,size:"3"});c=dojo.create("td");c.appendChild(this.updateTimeBox);a.appendChild(c);a=dojo.create("tr");b.appendChild(a);c=dojo.create("td",{colspan:"2"});a.appendChild(c);this.connectorButton=dojo.create("button",{type:"button"});c.appendChild(this.connectorButton);c=dojo.create("td",{colspan:"2"});a.appendChild(c);this.starterButton=dojo.create("button",{type:"button"});c.appendChild(this.starterButton);dojo.connect(this.connectorButton,
"onclick",this,this.connectionHandler);dojo.connect(this.starterButton,"onclick",this,this.updaterHandler);a=dojo.create("div",{"class":"frontPageButtonsDiv"});this.frontPageHeader.appendChild(a);b=dojo.create("table",{"class":"frontPageButtonsTable"});a.appendChild(b);a=dojo.create("tr");b.appendChild(a);b=dojo.create("td");a.appendChild(b);this.newPointTableButton=dojo.create("button",{type:"button",innerHTML:"New Point Table"});b.appendChild(this.newPointTableButton);b=dojo.create("td");a.appendChild(b);
this.newPlotButton=dojo.create("button",{type:"button",innerHTML:"New Time-Series"});b.appendChild(this.newPlotButton);b=dojo.create("td");a.appendChild(b);this.presetButton=dojo.create("button",{type:"button",innerHTML:"Load Preset"});b.appendChild(this.presetButton);b=dojo.create("td");a.appendChild(b);this.linkGenerateButton=dojo.create("button",{type:"button",innerHTML:"Generate Link"});b.appendChild(this.linkGenerateButton);dojo.connect(this.newPointTableButton,"onclick",this,this.addPointTable);
dojo.connect(this.newPlotButton,"onclick",this,this.addPlot);dojo.connect(this.linkGenerateButton,"onclick",this,this.generateLink);this.frontPageHeader.appendChild(dojo.create("div",{"class":"frontPageClearDiv"}));this.buttonStates()};
monicaHTMLFrontPage.prototype.buttonStates=function(){if(this.monicaConnection.serverConnection==null){this.connectorButton.innerHTML="Connect";this.newPointTableButton.disabled=true;this.newPlotButton.disabled=true;this.presetButton.disabled=true}else{this.connectorButton.innerHTML="Disconnect "+this.availableServers[this.monicaConnection.serverIndex].name;this.newPointTableButton.disabled=false;this.newPlotButton.disabled=false;this.presetButton.disabled=false}if(this.monicaConnection.serverConnection==
null){this.starterButton.innerHTML="Not connected";this.starterButton.disabled=true}else if(this.monicaConnection.serverConnection.isUpdating==false){this.starterButton.innerHTML="Start";this.starterButton.disabled=false}else if(this.monicaConnection.serverConnection.isUpdating==true){this.starterButton.innerHTML="Stop";this.starterButton.disabled=false}};
monicaHTMLFrontPage.prototype.connectionHandler=function(){if(this.connectorButton.innerHTML=="Connect"){var a=this.monicaServersBox.value;this.monicaConnection.serverConnection=new monicaConnection(a);for(var b=0;b<this.availableServers.length;b++)if(this.availableServers[b].host==a){this.monicaConnection.serverIndex=b;break}}else this.connectorButton.innerHTML.substr(0,10)=="Disconnect"&&this.disconnectServer();this.buttonStates()};
monicaHTMLFrontPage.prototype.updaterHandler=function(){if(this.starterButton.innerHTML=="Start")this.monicaConnection.serverConnection.startMonitoring(this.updateTimeBox.value);else this.starterButton.innerHTML=="Stop"&&this.monicaConnection.serverConnection.stopMonitoring();this.buttonStates()};
monicaHTMLFrontPage.prototype.addPointTable=function(){this.childContainers.push(new monicaContainer({name:"Container"+this.childContainers.length,parent:this}));this.childPointTables.push(new pointTable(this.monicaConnection.serverConnection,this.childContainers[this.childContainers.length-1]));dojo.byId(this.topDivId).appendChild(this.childContainers[this.childContainers.length-1].domNode)};
monicaHTMLFrontPage.prototype.addPlot=function(){this.childContainers.push(new monicaContainer({name:"Container"+this.childContainers.length,parent:this}));this.childPlots.push(new timeSeries(this.monicaConnection.serverConnection,this.childContainers[this.childContainers.length-1]));dojo.byId(this.topDivId).appendChild(this.childContainers[this.childContainers.length-1].domNode)};
monicaHTMLFrontPage.prototype.childStopped=function(a){for(var b=0;b<this.childPointTables.length;b++)if(this.childPointTables[b]==a.childObject){this.childPointTables.splice(b,1);break}for(b=0;b<this.childContainers.length;b++)this.childContainers[b]==a&&this.childContainers.splice(b,1)};
monicaHTMLFrontPage.prototype.generateLink=function(){var a=location.href.split(/\?/)[0],b="?";if(this.monicaConnection.serverConnection!=null){b+="server="+this.monicaConnection.serverConnection.monitoringServer;b+="&updateTime="+this.monicaConnection.serverConnection.updateTime;for(var c=0;c<this.childContainers.length;c++)if(this.childContainers[c].childType=="pointTable"){b+="&pointTable=";for(var d=0;d<this.childContainers[c].childObject.hasPoints.length;d++){if(d!=0)b+=",";b+=this.childContainers[c].childObject.hasPoints[d]}}else if(this.childContainers[c].childType==
"timeSeries"){b+="&timeSeries=";for(d=0;d<this.childContainers[c].childObject.hasPoints.length;d++){if(d!=0)b+=",";b+=this.childContainers[c].childObject.hasPoints[d]}b+=","+this.childContainers[c].childObject.timeIntervalInput.value;b+=this.childContainers[c].childObject.timeNowInput.checked==true||this.childContainers[c].childObject.timeStartBox.value==""?",-1":","+this.childContainers[c].childObject.timeStartBox.value;b+=this.childContainers[c].childObject.maxPointsCheckbox.checked==false||this.childContainers[c].childObject.maxPointsInput.value==
""?",-1":","+this.childContainers[c].childObject.maxPointsInput.value}this.dialogLinkBox.value=a+b;this.dialogLinkRow.style.visibility="visible";this.dialogPopup.show()}};
function linkParser(a){if(a){var b=location.search;if(b.length!=0){b+="&";b=this.tagValue({tag:"server",string:b});var c=b.value;b=b.remainder;if(a.frontPage)a.frontPage.connectServer({host:c});else this.monicaConnection=new monicaConnection(c);b=this.tagValue({tag:"updateTime",string:b});c=b.value;b=b.remainder;for(var d=this.nextToken(b);d!=null;){b=this.tagValue({tag:d,string:b});var e=b.value;b=b.remainder;if(d=="pointTable"){d=e.split(/\,/);for(e=0;e<d.length;e++)if(d[e]==""){d.splice(e,1);e--}if(a.frontPage){a.frontPage.addPointTable();
a.frontPage.childPointTables[a.frontPage.childPointTables.length-1].addPoints(d)}else if(a.topDivId){e=new monicaContainer("pointTable");var f=new pointTable(this.monicaConnection,e);dojo.byId(topDivId).appendChild(e.domNode);f.addPoints(d)}}else if(d=="timeSeries"){d=e.split(/\,/);for(e=0;e<d.length;e++)if(d[e]==""){d.splice(e,1);e--}if(a.frontPage){a.frontPage.addPlot();e=d.pop();f=d.pop();var i=d.pop(),g=a.frontPage.childPlots[a.frontPage.childPlots.length-1];g.addPoints(d);g.setPlotTime(f,i,e);
g.updatePlot()}else if(a.topDivId){e=new monicaContainer("timeSeries");g=new pointTable(this.monicaConnection,e);dojo.byId(topDivId).appendChild(e.domNode);e=d.pop();f=d.pop();i=d.pop();g.addPoints(d);g.setPlotTime(f,i,e);g.updatePlot()}}d=this.nextToken(b)}if(c>0)if(a.frontPage){a.frontPage.updateTimeBox.value=c;a.frontPage.updaterHandler()}else a.topDivId&&this.monicaConnection.startMonitoring(c)}}else document.write("Unable to setup page according to link: no information!")}
linkParser.prototype.nextToken=function(a){a=/^\?*(\S+?)\=.*$/.exec(a);if(!a)return null;return a[1]};linkParser.prototype.tagValue=function(a){if(!a||!a.tag||!a.string)return null;a=RegExp("^(.*?)"+a.tag+"\\=(\\S+?)\\&(.*)$","").exec(a.string);return{value:a[2],remainder:a[1]+a[3]}};
function timeSeries(a,b){this.hasPoints=[];this.timeSpan=60;this.startTime=-1;this.contentDomNode=dojo.create("div",{"class":"timeSeriesDiv"});this.plotObject=null;this.editDomNode=dojo.create("div",{"class":"timeSeriesEdit"});this.monicaServer=a;this.monicaContainer=b;this.monicaContainer.childObject=this;this.monicaContainer.childType="timeSeries";this.updaterFunction=this.updatePlot;this.hasChanged=true;this.pointsChanged=false;this.monicaContainer.content.appendChild(this.contentDomNode);this.monicaContainer.editor.appendChild(this.editDomNode);
this.timeSelectionDomNode=dojo.create("div",{"class":"plotTimeSelectDiv"});this.editDomNode.appendChild(this.timeSelectionDomNode);this.timeSelectionTable=dojo.create("table");this.timeSelectionDomNode.appendChild(this.timeSelectionTable);var c=dojo.create("tr");this.timeSelectionTable.appendChild(c);var d=dojo.create("th",{innerHTML:"Plot: "});c.appendChild(d);d=dojo.create("td");c.appendChild(d);this.timeIntervalInput=dojo.create("input",{type:"text",size:"5",value:"60"});d.appendChild(this.timeIntervalInput);
d=dojo.create("td",{innerHTML:"minutes"});c.appendChild(d);d=dojo.create("th",{innerHTML:"starting: "});c.appendChild(d);this.timeNowInput=dojo.create("input",{type:"radio",name:"timeStarting",value:"now",checked:"true"});d=dojo.create("td");d.appendChild(this.timeNowInput);c.appendChild(d);d=dojo.create("td",{innerHTML:"now"});c.appendChild(d);this.timeStartInput=dojo.create("input",{type:"radio",name:"timeStarting",value:"then"});d=dojo.create("td");d.appendChild(this.timeStartInput);c.appendChild(d);
d=dojo.create("td",{innerHTML:"time:"});c.appendChild(d);this.timeStartBox=dojo.create("input",{name:"startTime",id:"startTime",type:"text",size:"20"});d=dojo.create("td");d.appendChild(this.timeStartBox);c.appendChild(d);d=dojo.create("td");c.appendChild(d);this.timeStartHREF="javascript:NewCssCal('startTime','yyyymmdd','dropdown',true,24,false)";this.timeStartBoxSelector=dojo.create("a",{href:this.timeStartHREF,innerHTML:'<img src="images/cal.gif" width="16" height="16" alt="Pick a date">'});d.appendChild(this.timeStartBoxSelector);
d=dojo.create("td");c.appendChild(d);this.maxPointsCheckbox=dojo.create("input",{type:"checkbox",name:"maxPointsCheck",value:"true",checked:true});d.appendChild(this.maxPointsCheckbox);d=dojo.create("td",{innerHTML:"max # points: "});c.appendChild(d);d=dojo.create("td");c.appendChild(d);this.maxPointsInput=dojo.create("input",{type:"text",name:"maxPoints",size:"5",value:"200"});d.appendChild(this.maxPointsInput);this.timeHandle1=dojo.connect(this.timeNowInput,"onclick",this,this.buttonStates);this.timeHandle2=
dojo.connect(this.timeStartInput,"onclick",this,this.buttonStates);this.maxPointsHandle=dojo.connect(this.maxPointsCheckbox,"onclick",this,this.buttonStates);this.maxPointsChangeHandle=dojo.connect(this.maxPointsInput,"onchange",this,this.valuesUpdated);this.intervalChangeHandle=dojo.connect(this.timeIntervalInput,"onchange",this,this.valuesUpdated);this.timeChangeHandle=dojo.connect(this.timeStartBox,"onchange",this,this.valuesUpdated);this.treeSideDiv=dojo.create("div",{"class":"plotTreeSideDiv"});
this.treeSideDiv.appendChild(dojo.create("p",{innerHTML:"Available Points"}));this.treeDiv=dojo.create("div",{"class":"plotTreeDiv"});this.treeControl=new dijit.Tree({model:this.monicaServer.treeModel,showRoot:false,"class":"plotTreeControl"});this.treeDiv.appendChild(this.treeControl.domNode);this.treeSideDiv.appendChild(this.treeDiv);this.editDomNode.appendChild(this.treeSideDiv);this.treeHandle=dojo.connect(this.treeControl,"onDblClick",this,this.addFromClick);this.editSelectDiv=dojo.create("div",
{"class":"plotEditDiv"});this.editSelectDiv.appendChild(dojo.create("p",{innerHTML:"Points in plots"}));this.editSelectScrollDiv=dojo.create("div",{"class":"plotEditScrollDiv"});this.editSelectDiv.appendChild(this.editSelectScrollDiv);this.editSelect=dojo.create("select",{multiple:"multiple",size:"20","class":"plotEditSelect"});this.editSelectScrollDiv.appendChild(this.editSelect);this.editRemoveButton=dojo.create("button",{type:"button",innerHTML:"Remove Points","class":"plotEditRemoveButton"});
this.editSelectDiv.appendChild(this.editRemoveButton);this.removeButtonHandle=dojo.connect(this.editRemoveButton,"onclick",this,this.removePoints);this.removeClickHandle=dojo.connect(this.editSelect,"ondblclick",this,this.removeFromClick);this.editDomNode.appendChild(this.editSelectDiv);this.editSelectOptions=[];this.buttonStates()}
timeSeries.prototype.setPlotTime=function(a,b,c){if(a!=null){if(a==-1){this.timeNowInput.checked=true;this.timeStartInput.checked=false}else{this.timeNowInput.checked=false;this.timeStartInput.checked=true;this.timeStartBox.value=a}this.hasChanged=true}if(b!=null){this.timeIntervalInput.value=b;this.hasChanged=true}if(c!=null)if(c==-1)this.maxPointsCheckbox.checked=false;else{this.maxPointsCheckbox.checked=true;this.maxPointsInput.value=c}this.buttonStates()};
timeSeries.prototype.destroy=function(){this.monicaServer.removeTimeSeriesPoint(null,this);this.plotObject&&this.plotObject.destroy();dojo.disconnect(this.timeHandle1);dojo.disconnect(this.timeHandle2);dojo.disconnect(this.treeHandle);dojo.disconnect(this.removeButtonHandle);dojo.disconnect(this.removeClickHandle);dojo.disconnect(this.maxPointsHandle);dojo.disconnect(this.maxPointsChangeHandle);dojo.disconnect(this.intervalChangeHandle);dojo.disconnect(this.timeChangeHandle)};
timeSeries.prototype.buttonStates=function(){if(this.timeNowInput.checked){this.timeStartBox.disabled=true;this.timeStartBoxSelector.href="javascript:return false;"}else if(this.timeStartInput.checked){this.timeStartBox.disabled=false;this.timeStartBoxSelector.href=this.timeStartHREF}this.maxPointsInput.disabled=this.maxPointsCheckbox.checked?false:true;this.hasChanged=true};timeSeries.prototype.addFromClick=function(a){a=this.monicaServer.store.getValue(a,"id");a.split(/\./);this.addPoints([a])};
timeSeries.prototype.addPoints=function(a){for(var b=[],c=0;c<a.length;c++){for(var d=0,e=0;e<this.hasPoints.length;e++)if(a[c]==this.hasPoints[e]){d=1;break}if(d==0){this.hasPoints.push(a[c]);b.push(a[c]);this.editSelectOptions.push(dojo.create("option",{innerHTML:a[c]}));this.editSelect.appendChild(this.editSelectOptions[this.editSelectOptions.length-1])}}this.monicaServer.addTimeSeriesPoint(b,this);this.pointsChanged=this.hasChanged=true};
timeSeries.prototype.removeFromClick=function(a){a=a.target;this.monicaServer.removeTimeSeriesPoint([a.innerHTML],this);for(var b=0;b<this.hasPoints.length;b++)if(this.hasPoints[b]==a.innerHTML){this.hasPoints.splice(b,1);break}dojo.destroy(a);this.pointsChanged=this.hasChanged=true};
timeSeries.prototype.removePoints=function(){for(var a=[],b=0;b<this.editSelectOptions.length;b++)if(this.editSelectOptions[b].selected){a.push(this.editSelectOptions[b].innerHTML);for(var c=0;c<this.hasPoints.length;c++)if(this.hasPoints[c]==this.editSelectOptions[b].innerHTML){this.hasPoints.splice(c,1);break}dojo.destroy(this.editSelectOptions[b]);this.editSelectOptions.splice(b,1);b--}this.monicaServer.removeTimeSeriesPoint(a,this);this.pointsChanged=this.hasChanged=true};
timeSeries.prototype.valuesUpdated=function(){this.hasChanged=true};
timeSeries.prototype.updatePlot=function(){var a=-1;if(this.timeStartInput.checked)a=this.timeStartBox.value.replace(/\s+/g,":");var b=-1;if(this.maxPointsInput.disabled==false)b=this.maxPointsInput.value;a=this.monicaServer.setTimeSeriesPointRange(this,a,this.timeIntervalInput.value,b);if(!this.plotObject){Highcharts.setOptions({global:{useUTC:true},tooltip:{formatter:function(){var e,f;f=/^(.*)\s\[(.*)\]$/.exec(this.series.name);if(f==null){e=this.series.name;f=""}else{e=f[1];f=f[2]}return['<span style="font-size: 10px">',
Highcharts.dateFormat("%Y-%m-%d %H:%M:%S",this.x),"</span><br/>",'<span style="color:'+this.series.color+'">',e,"</span> = ",this.y," "+f].join("")}}});this.plotObject=new Highcharts.Chart({chart:{renderTo:this.contentDomNode,defaultSeriesType:"line"},title:{text:"MoniCA plot"},xAxis:{type:"datetime",title:{enabled:true,text:"Time (UT)",startOnTick:false,endOnTick:false,showLastLabel:true}},yAxis:{title:{text:"Value"}},series:[]})}this.hasChanged=false;if(this.pointsChanged==true){this.pointsChanged=
false;this.monicaServer.getDescriptions()}else if(a==true)this.monicaServer.pollValues();else{this.plotObject.showLoading("Please wait, getting points from MoniCA server");var c=this.monicaServer.getTimeSeriesPoints(this);for(a=0;a<c.length;a++){c[a].name=this.modifyName(c[a].name);var d=-1;for(b=0;b<this.plotObject.series.length;b++)if(this.plotObject.series[b].name==c[a].name){d=b;break}d==-1?this.plotObject.addSeries(c[a],false):this.plotObject.series[d].setData(c[a].data,false)}for(a=0;a<this.plotObject.series.length;a++){c=
-1;for(b=0;b<this.hasPoints.length;b++)if(this.plotObject.series[a].name==this.modifyName(this.hasPoints[b])){c=b;break}if(c==-1){this.plotObject.series[a].remove(false);a--}}this.plotObject.redraw();this.plotObject.hideLoading()}};timeSeries.prototype.modifyName=function(a){var b=this.monicaServer.monPoints[a].units;a=a.split(/\./g);a=a[0]+" "+a[a.length-1];if(b!="")a+=" ["+b+"]";return a};
