"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[407],{3349:function(e,t,r){r.d(t,{a:function(){return o}});var l=r(6225);function o(e,t){var r=e.append("foreignObject").attr("width","100000"),o=r.append("xhtml:div");o.attr("xmlns","http://www.w3.org/1999/xhtml");var a=t.label;switch(typeof a){case"function":o.insert(a);break;case"object":o.insert(function(){return a});break;default:o.html(a)}l.bg(o,t.labelStyle),o.style("display","inline-block"),o.style("white-space","nowrap");var n=o.node().getBoundingClientRect();return r.attr("width",n.width).attr("height",n.height),r}},6225:function(e,t,r){r.d(t,{$p:function(){return d},O1:function(){return n},WR:function(){return p},bF:function(){return a},bg:function(){return c}});var l=r(87),o=r(7124);function a(e,t){return!!e.children(t).length}function n(e){return s(e.v)+":"+s(e.w)+":"+s(e.name)}var i=/:/g;function s(e){return e?String(e).replace(i,"\\:"):""}function c(e,t){t&&e.attr("style",t)}function d(e,t,r){t&&e.attr("class",t).attr("class",r+" "+e.attr("class"))}function p(e,t){var r=t.graph();if(l.Z(r)){var a=r.transition;if(o.Z(a))return a(e)}return e}},9792:function(e,t,r){var l=r(1691),o=r(1610);t.Z=(e,t)=>l.Z.lang.round(o.Z.parse(e)[t])},407:function(e,t,r){r.d(t,{diagram:function(){return n}});var l=r(7474),o=r(8583),a=r(1835);r(4218),r(5625),r(1316),r(6060),r(7484),r(6574),r(7856);let n={parser:l.p,db:l.f,renderer:o.f,styles:o.a,init:e=>{e.flowchart||(e.flowchart={}),e.flowchart.arrowMarkerAbsolute=e.arrowMarkerAbsolute,(0,a.p)({flowchart:{arrowMarkerAbsolute:e.arrowMarkerAbsolute}}),o.f.setConf(e.flowchart),l.f.clear(),l.f.setGen("gen-2")}}},8583:function(e,t,r){r.d(t,{a:function(){return h},f:function(){return f}});var l=r(5625),o=r(4218),a=r(1835),n=r(4015),i=r(3349),s=r(9792),c=r(1117);let d={},p=async function(e,t,r,l,o,n){let s=l.select(`[id="${r}"]`);for(let r of Object.keys(e)){let l;let c=e[r],d="default";c.classes.length>0&&(d=c.classes.join(" ")),d+=" flowchart-label";let p=(0,a.k)(c.styles),b=void 0!==c.text?c.text:c.id;if(a.l.info("vertex",c,c.labelType),"markdown"===c.labelType)a.l.info("vertex",c,c.labelType);else if((0,a.m)((0,a.c)().flowchart.htmlLabels)){let e={label:b};(l=(0,i.a)(s,e).node()).parentNode.removeChild(l)}else{let e=o.createElementNS("http://www.w3.org/2000/svg","text");for(let t of(e.setAttribute("style",p.labelStyle.replace("color:","fill:")),b.split(a.e.lineBreakRegex))){let r=o.createElementNS("http://www.w3.org/2000/svg","tspan");r.setAttributeNS("http://www.w3.org/XML/1998/namespace","xml:space","preserve"),r.setAttribute("dy","1em"),r.setAttribute("x","1"),r.textContent=t,e.appendChild(r)}l=e}let u=0,f="";switch(c.type){case"round":u=5,f="rect";break;case"square":case"group":default:f="rect";break;case"diamond":f="question";break;case"hexagon":f="hexagon";break;case"odd":case"odd_right":f="rect_left_inv_arrow";break;case"lean_right":f="lean_right";break;case"lean_left":f="lean_left";break;case"trapezoid":f="trapezoid";break;case"inv_trapezoid":f="inv_trapezoid";break;case"circle":f="circle";break;case"ellipse":f="ellipse";break;case"stadium":f="stadium";break;case"subroutine":f="subroutine";break;case"cylinder":f="cylinder";break;case"doublecircle":f="doublecircle"}let w=await (0,a.r)(b,(0,a.c)());t.setNode(c.id,{labelStyle:p.labelStyle,shape:f,labelText:w,labelType:c.labelType,rx:u,ry:u,class:d,style:p.style,id:c.id,link:c.link,linkTarget:c.linkTarget,tooltip:n.db.getTooltip(c.id)||"",domId:n.db.lookUpDomId(c.id),haveCallback:c.haveCallback,width:"group"===c.type?500:void 0,dir:c.dir,type:c.type,props:c.props,padding:(0,a.c)().flowchart.padding}),a.l.info("setNode",{labelStyle:p.labelStyle,labelType:c.labelType,shape:f,labelText:w,rx:u,ry:u,class:d,style:p.style,id:c.id,domId:n.db.lookUpDomId(c.id),width:"group"===c.type?500:void 0,type:c.type,dir:c.dir,props:c.props,padding:(0,a.c)().flowchart.padding})}},b=async function(e,t,r){let l,n;a.l.info("abc78 edges = ",e);let i=0,s={};if(void 0!==e.defaultStyle){let t=(0,a.k)(e.defaultStyle);l=t.style,n=t.labelStyle}for(let r of e){i++;let c="L-"+r.start+"-"+r.end;void 0===s[c]?s[c]=0:s[c]++,a.l.info("abc78 new entry",c,s[c]);let p=c+"-"+s[c];a.l.info("abc78 new link id to be used is",c,p,s[c]);let b="LS-"+r.start,u="LE-"+r.end,f={style:"",labelStyle:""};switch(f.minlen=r.length||1,"arrow_open"===r.type?f.arrowhead="none":f.arrowhead="normal",f.arrowTypeStart="arrow_open",f.arrowTypeEnd="arrow_open",r.type){case"double_arrow_cross":f.arrowTypeStart="arrow_cross";case"arrow_cross":f.arrowTypeEnd="arrow_cross";break;case"double_arrow_point":f.arrowTypeStart="arrow_point";case"arrow_point":f.arrowTypeEnd="arrow_point";break;case"double_arrow_circle":f.arrowTypeStart="arrow_circle";case"arrow_circle":f.arrowTypeEnd="arrow_circle"}let w="",h="";switch(r.stroke){case"normal":w="fill:none;",void 0!==l&&(w=l),void 0!==n&&(h=n),f.thickness="normal",f.pattern="solid";break;case"dotted":f.thickness="normal",f.pattern="dotted",f.style="fill:none;stroke-width:2px;stroke-dasharray:3;";break;case"thick":f.thickness="thick",f.pattern="solid",f.style="stroke-width: 3.5px;fill:none;";break;case"invisible":f.thickness="invisible",f.pattern="solid",f.style="stroke-width: 0;fill:none;"}if(void 0!==r.style){let e=(0,a.k)(r.style);w=e.style,h=e.labelStyle}f.style=f.style+=w,f.labelStyle=f.labelStyle+=h,void 0!==r.interpolate?f.curve=(0,a.n)(r.interpolate,o.c_6):void 0!==e.defaultInterpolate?f.curve=(0,a.n)(e.defaultInterpolate,o.c_6):f.curve=(0,a.n)(d.curve,o.c_6),void 0===r.text?void 0!==r.style&&(f.arrowheadStyle="fill: #333"):(f.arrowheadStyle="fill: #333",f.labelpos="c"),f.labelType=r.labelType,f.label=await (0,a.r)(r.text.replace(a.e.lineBreakRegex,"\n"),(0,a.c)()),void 0===r.style&&(f.style=f.style||"stroke: #333; stroke-width: 1.5px;fill:none;"),f.labelStyle=f.labelStyle.replace("color:","fill:"),f.id=p,f.classes="flowchart-link "+b+" "+u,t.setEdge(r.start,r.end,f,i)}},u=async function(e,t,r,i){let s,c;a.l.info("Drawing flowchart");let d=i.db.getDirection();void 0===d&&(d="TD");let{securityLevel:u,flowchart:f}=(0,a.c)(),w=f.nodeSpacing||50,h=f.rankSpacing||50;"sandbox"===u&&(s=(0,o.Ys)("#i"+t));let g="sandbox"===u?(0,o.Ys)(s.nodes()[0].contentDocument.body):(0,o.Ys)("body"),y="sandbox"===u?s.nodes()[0].contentDocument:document,k=new l.k({multigraph:!0,compound:!0}).setGraph({rankdir:d,nodesep:w,ranksep:h,marginx:0,marginy:0}).setDefaultEdgeLabel(function(){return{}}),x=i.db.getSubGraphs();a.l.info("Subgraphs - ",x);for(let e=x.length-1;e>=0;e--)c=x[e],a.l.info("Subgraph - ",c),i.db.addVertex(c.id,{text:c.title,type:c.labelType},"group",void 0,c.classes,c.dir);let v=i.db.getVertices(),m=i.db.getEdges();a.l.info("Edges",m);let S=0;for(S=x.length-1;S>=0;S--){c=x[S],(0,o.td_)("cluster").append("text");for(let e=0;e<c.nodes.length;e++)a.l.info("Setting up subgraphs",c.nodes[e],c.id),k.setParent(c.nodes[e],c.id)}await p(v,k,t,g,y,i),await b(m,k);let _=g.select(`[id="${t}"]`),T=g.select("#"+t+" g");if(await (0,n.r)(T,k,["point","circle","cross"],"flowchart",t),a.u.insertTitle(_,"flowchartTitleText",f.titleTopMargin,i.db.getDiagramTitle()),(0,a.o)(k,_,f.diagramPadding,f.useMaxWidth),i.db.indexNodes("subGraph"+S),!f.htmlLabels)for(let e of y.querySelectorAll('[id="'+t+'"] .edgeLabel .label')){let t=e.getBBox(),r=y.createElementNS("http://www.w3.org/2000/svg","rect");r.setAttribute("rx",0),r.setAttribute("ry",0),r.setAttribute("width",t.width),r.setAttribute("height",t.height),e.insertBefore(r,e.firstChild)}Object.keys(v).forEach(function(e){let r=v[e];if(r.link){let l=(0,o.Ys)("#"+t+' [id="'+e+'"]');if(l){let e=y.createElementNS("http://www.w3.org/2000/svg","a");e.setAttributeNS("http://www.w3.org/2000/svg","class",r.classes.join(" ")),e.setAttributeNS("http://www.w3.org/2000/svg","href",r.link),e.setAttributeNS("http://www.w3.org/2000/svg","rel","noopener"),"sandbox"===u?e.setAttributeNS("http://www.w3.org/2000/svg","target","_top"):r.linkTarget&&e.setAttributeNS("http://www.w3.org/2000/svg","target",r.linkTarget);let t=l.insert(function(){return e},":first-child"),o=l.select(".label-container");o&&t.append(function(){return o.node()});let a=l.select(".label");a&&t.append(function(){return a.node()})}}})},f={setConf:function(e){for(let t of Object.keys(e))d[t]=e[t]},addVertices:p,addEdges:b,getClasses:function(e,t){return t.db.getClasses()},draw:u},w=(e,t)=>{let r=s.Z,l=r(e,"r"),o=r(e,"g"),a=r(e,"b");return c.Z(l,o,a,t)},h=e=>`.label {
    font-family: ${e.fontFamily};
    color: ${e.nodeTextColor||e.textColor};
  }
  .cluster-label text {
    fill: ${e.titleColor};
  }
  .cluster-label span,p {
    color: ${e.titleColor};
  }

  .label text,span,p {
    fill: ${e.nodeTextColor||e.textColor};
    color: ${e.nodeTextColor||e.textColor};
  }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: ${e.mainBkg};
    stroke: ${e.nodeBorder};
    stroke-width: 1px;
  }
  .flowchart-label text {
    text-anchor: middle;
  }
  // .flowchart-label .text-outer-tspan {
  //   text-anchor: middle;
  // }
  // .flowchart-label .text-inner-tspan {
  //   text-anchor: start;
  // }

  .node .katex path {
    fill: #000;
    stroke: #000;
    stroke-width: 1px;
  }

  .node .label {
    text-align: center;
  }
  .node.clickable {
    cursor: pointer;
  }

  .arrowheadPath {
    fill: ${e.arrowheadColor};
  }

  .edgePath .path {
    stroke: ${e.lineColor};
    stroke-width: 2.0px;
  }

  .flowchart-link {
    stroke: ${e.lineColor};
    fill: none;
  }

  .edgeLabel {
    background-color: ${e.edgeLabelBackground};
    rect {
      opacity: 0.5;
      background-color: ${e.edgeLabelBackground};
      fill: ${e.edgeLabelBackground};
    }
    text-align: center;
  }

  /* For html labels only */
  .labelBkg {
    background-color: ${w(e.edgeLabelBackground,.5)};
    // background-color: 
  }

  .cluster rect {
    fill: ${e.clusterBkg};
    stroke: ${e.clusterBorder};
    stroke-width: 1px;
  }

  .cluster text {
    fill: ${e.titleColor};
  }

  .cluster span,p {
    color: ${e.titleColor};
  }
  /* .cluster div {
    color: ${e.titleColor};
  } */

  div.mermaidTooltip {
    position: absolute;
    text-align: center;
    max-width: 200px;
    padding: 2px;
    font-family: ${e.fontFamily};
    font-size: 12px;
    background: ${e.tertiaryColor};
    border: 1px solid ${e.border2};
    border-radius: 2px;
    pointer-events: none;
    z-index: 100;
  }

  .flowchartTitleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${e.textColor};
  }
`}}]);