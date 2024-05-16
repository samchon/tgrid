(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[172],{2083:function(s,e,o){(window.__NEXT_P=window.__NEXT_P||[]).push(["/docs",function(){return o(3696)}])},3696:function(s,e,o){"use strict";o.r(e),o.d(e,{__toc:function(){return a},default:function(){return d}});var n=o(5893),r=o(2673),t=o(8164),l=o(8426);o(9128);var i=o(2643),c={src:"/_next/static/media/logo.930e096a.png",height:638,width:1501,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAbklEQVR4nAFjAJz/AZqkuz8GExOP9O/0ziAZE4kCCw8bAP/+/QoHBAP/AADYAYicu8cmKiA4+/TyAOnp9GoiKSjq+Pf2GAUDA//9///BAZmowEr6CgqJDAUBzwP9CYIADhIJ+/v8AP//AAP7/v/le6cuV1gs/eUAAAAASUVORK5CYII=",blurWidth:8,blurHeight:3};let a=[];function _createMdxContent(s){let e=Object.assign({p:"p",img:"img",a:"a",code:"code",ul:"ul",li:"li",pre:"pre",span:"span",blockquote:"blockquote"},(0,i.a)(),s.components);return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(e.p,{children:(0,n.jsx)(e.img,{alt:"TGrid Logo",placeholder:"blur",src:c})}),"\n",(0,n.jsx)("span",{style:{display:"flex",flexDirection:"row"},children:[["MIT License","https://img.shields.io/badge/license-MIT-blue.svg","https://github.com/samchon/tgrid/blob/master/LICENSE"],["NPM Version","https://img.shields.io/npm/v/tgrid.svg","https://www.npmjs.com/package/tgrid"],["NPM Downloads","https://img.shields.io/npm/dm/tgrid.svg","https://www.npmjs.com/package/tgrid"],["Build Status","https://github.com/samchon/tgrid/workflows/build/badge.svg","https://github.com/samchon/tgrid/actions?query=workflow%3Abuild"],["Guide Documents","https://img.shields.io/badge/guide-documents-forestgreen","https://tgrid.io/docs/"]].map(s=>{let[o,r,t]=s;return(0,n.jsx)(e.a,{href:t,style:{marginTop:"30px",marginRight:"6px"},children:(0,n.jsx)(e.img,{src:r,alt:o})})})}),"\n",(0,n.jsx)(e.p,{children:"TypeScript Grid Computing Framework."}),"\n",(0,n.jsxs)(e.p,{children:["TypeScript RPC (Remote Procedure Call) framework for ",(0,n.jsx)(e.code,{children:"WebSocket"})," and ",(0,n.jsx)(e.code,{children:"Worker"})," protocols."]}),"\n",(0,n.jsxs)(e.ul,{children:["\n",(0,n.jsx)(e.li,{children:(0,n.jsx)(e.code,{children:"WebSocket"})}),"\n",(0,n.jsx)(e.li,{children:(0,n.jsx)(e.code,{children:"Worker"})}),"\n",(0,n.jsx)(e.li,{children:(0,n.jsx)(e.code,{children:"SharedWorker"})}),"\n",(0,n.jsx)(e.li,{children:(0,n.jsx)(e.code,{children:"NestJS"})}),"\n"]}),"\n",(0,n.jsx)(e.p,{children:"Also, extremely easy even when composing complicated network system like grid computing."}),"\n",(0,n.jsx)(e.pre,{"data-language":"typescript","data-theme":"default",filename:"examples/websocket/src/client.ts",children:(0,n.jsxs)(e.code,{"data-line-numbers":"","data-language":"typescript","data-theme":"default","data-line-numbers-max-digits":"2",children:[(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"import"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" { Driver"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" WebSocketConnector } "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"from"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"tgrid"'}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:";"})]}),"\n",(0,n.jsx)(e.span,{className:"line",children:" "}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"import"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" { ICalcConfig } "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"from"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"../interfaces/ICalcConfig"'}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:";"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"import"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" { ICalcEvent } "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"from"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"../interfaces/ICalcEvent"'}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:";"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"import"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" { ICalcEventListener } "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"from"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"../interfaces/ICalcEventListener"'}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:";"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"import"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" { ICompositeCalculator } "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"from"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"../interfaces/ICompositeCalculator"'}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:";"})]}),"\n",(0,n.jsx)(e.span,{className:"line",children:" "}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"export"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"const"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"webSocketClientMain"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"async"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" () "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"=>"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"const"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"stack"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:":"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"ICalcEvent"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"[] "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" [];"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"const"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"listener"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:":"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"ICalcEventListener"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"on"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:":"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" (evt"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:":"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"ICalcEvent"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:") "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"=>"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"stack"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:".push"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"(evt)"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,n.jsx)(e.span,{className:"line",children:(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  };"})}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"const"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"connector"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:":"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"WebSocketConnector"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"<"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"ICalcConfig"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"ICalcEventListener"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"ICompositeCalculator"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  > "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"new"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"WebSocketConnector"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"("})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    { precision"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:":"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"2"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" }"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// header"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    listener"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// provider for remote server"})]}),"\n",(0,n.jsx)(e.span,{className:"line",children:(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  );"})}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"await"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"connector"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:".connect"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"("}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"ws://127.0.0.1:37000/composite"'}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:");"})]}),"\n",(0,n.jsx)(e.span,{className:"line",children:" "}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"const"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"remote"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:":"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"Driver"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"<"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"ICompositeCalculator"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"> "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"connector"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:".getDriver"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"();"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"console"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:".log"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"("})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"await"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"remote"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:".plus"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"("}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"10"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"20"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:")"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// returns 30"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"await"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"remote"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:".multiplies"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"("}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"3"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"4"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:")"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// returns 12"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"await"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"remote"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:".divides"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"("}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"5"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"3"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:")"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// returns 1.67"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"await"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"remote"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"."}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"scientific"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:".sqrt"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"("}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"2"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:")"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// returns 1.41"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"await"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"remote"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"."}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"statistics"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:".mean"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"("}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"1"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"3"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"9"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:")"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// returns 4.33"})]}),"\n",(0,n.jsx)(e.span,{className:"line",children:(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  );"})}),"\n",(0,n.jsx)(e.span,{className:"line",children:" "}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"await"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"connector"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:".close"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"();"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"console"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:".log"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"(stack);"})]}),"\n",(0,n.jsx)(e.span,{className:"line",children:(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"};"})})]})}),"\n",(0,n.jsxs)(e.blockquote,{children:["\n",(0,n.jsx)(e.pre,{"data-language":"bash","data-theme":"default",filename:"Terminal",children:(0,n.jsxs)(e.code,{"data-language":"bash","data-theme":"default",children:[(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"$"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string)"},children:"npm"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string)"},children:"start"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"30"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"12"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"1.67"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"1.41"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"4.33"})]}),"\n",(0,n.jsx)(e.span,{className:"line",children:(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"["})}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  { type: "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"'plus'"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:", input: [ "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"10"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:", "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"20"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ], output: "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"30"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" },"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  { type: "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"'multiplies'"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:", input: [ "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"3"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:", "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"4"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ], output: "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"12"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" },"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  { type: "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"'divides'"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:", input: [ "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"5"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:", "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"3"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ], output: "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"1.67"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" },"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  { type: "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"'sqrt'"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:", input: [ "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"2"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ], output: "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"1.41"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" },"})]}),"\n",(0,n.jsxs)(e.span,{className:"line",children:[(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  { type: "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"'mean'"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:", input: [ "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"1"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:", "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"3"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:", "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"9"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ], output: "}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"4.33"}),(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" }"})]}),"\n",(0,n.jsx)(e.span,{className:"line",children:(0,n.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"]"})})]})}),"\n"]})]})}let h={MDXContent:function(){let s=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:e}=Object.assign({},(0,i.a)(),s.components);return e?(0,n.jsx)(e,{...s,children:(0,n.jsx)(_createMdxContent,{...s})}):_createMdxContent(s)},pageOpts:{filePath:"pages/docs/index.mdx",route:"/docs",timestamp:1715864638e3,pageMap:[{kind:"Folder",name:"docs",route:"/docs",children:[{kind:"Folder",name:"examples",route:"/docs/examples",children:[{kind:"MdxPage",name:"nestjs-websocket",route:"/docs/examples/nestjs-websocket"},{kind:"MdxPage",name:"object-oriented-network",route:"/docs/examples/object-oriented-network"},{kind:"MdxPage",name:"remote-function-call",route:"/docs/examples/remote-function-call"},{kind:"MdxPage",name:"remote-object-call",route:"/docs/examples/remote-object-call"},{kind:"Meta",data:{"remote-function-call":"Remote Function Call","remote-object-call":"Remote Object Call","object-oriented-network":"Object Oriented Network","nestjs-websocket":"NestJS WebSocket"}}]},{kind:"Folder",name:"features",route:"/docs/features",children:[{kind:"MdxPage",name:"components",route:"/docs/features/components"},{kind:"MdxPage",name:"websocket",route:"/docs/features/websocket"},{kind:"MdxPage",name:"worker",route:"/docs/features/worker"},{kind:"Meta",data:{components:"Components",websocket:"WebSocket Protocol",worker:"Worker Protocol"}}]},{kind:"MdxPage",name:"index",route:"/docs"},{kind:"Folder",name:"projects",route:"/docs/projects",children:[{kind:"MdxPage",name:"chat",route:"/docs/projects/chat"},{kind:"MdxPage",name:"market",route:"/docs/projects/market"},{kind:"MdxPage",name:"mutex",route:"/docs/projects/mutex"},{kind:"Meta",data:{chat:"Chat Application",market:"Grid Market",mutex:"Mutex Server"}}]},{kind:"MdxPage",name:"remote-procedure-call",route:"/docs/remote-procedure-call"},{kind:"MdxPage",name:"setup",route:"/docs/setup"},{kind:"Meta",data:{index:"\uD83D\uDE4B\uD83C\uDFFB‍♂️ Introduction","remote-procedure-call":"\uD83D\uDCE1 Remote Procedure Call",setup:"\uD83D\uDCE6 Setup","-- tutorial":{type:"separator",title:"\uD83D\uDCD6 Tutorial"},features:"Features",examples:"Learn from Examples",projects:"Learn from Projects","-- appendix":{type:"separator",title:"\uD83D\uDD17 Appendix"},api:{title:"API Documents",href:"/api",newWindow:!0}}}]},{kind:"MdxPage",name:"index",route:"/"},{kind:"Meta",data:{index:{title:"Introduction",type:"page",hidden:!0,display:"hidden",theme:{layout:"full"}},docs:{title:"\uD83D\uDCD6 Guide Documents",type:"page"},playground:{title:"\uD83D\uDCBB Playground",type:"page"}}}],flexsearch:{codeblocks:!0},title:"Index",headings:a},pageNextRoute:"/docs",nextraLayout:t.ZP,themeConfig:l.Z};var d=(0,r.j)(h)},8426:function(s,e,o){"use strict";var n=o(5893);o(7294),e.Z={logo:()=>(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("img",{src:"/favicon/android-chrome-192x192.png",width:36,height:36}),(0,n.jsx)("span",{style:{fontWeight:"bold",fontSize:"1.2rem",paddingLeft:15,paddingRight:10},children:"TGrid"})]}),nextThemes:{defaultTheme:"dark"},project:{link:"https://github.com/samchon/tgrid"},docsRepositoryBase:"https://github.com/samchon/tgrid/blob/master/website",footer:{text:()=>(0,n.jsxs)("span",{children:["Released under the MIT License.",(0,n.jsx)("br",{}),(0,n.jsx)("br",{}),"Copyright 2018 - ",new Date().getFullYear()," ",(0,n.jsx)("a",{href:"https://github.com/samchon",target:"_blank",style:{color:"initial"},children:(0,n.jsx)("u",{children:"Samchon"})})," ","& Contributors"]})},useNextSeoProps:()=>({defaultTitle:"TGrid Guide Documents",titleTemplate:"TGrid Guide Documents - %s",additionalLinkTags:[{rel:"apple-touch-icon",sizes:"180x180",href:"/favicon/apple-touch-icon.png"},{rel:"manifest",href:"/favicon/site.webmanifest"},...[16,32].map(s=>({rel:"icon",type:"image/png",sizes:"".concat(s,"x").concat(s),href:"/favicon/favicon-".concat(s,"x").concat(s,".png")}))],additionalMetaTags:[{property:"og:image",content:"/og.jpg"},{property:"og:type",content:"object"},{property:"og:title",content:"TGrid Guide Documents"},{property:"og:description",content:"TypeScript Grid Computing Framework.\n\nSupport RPC (Remote Procure Call) for WebSocket and Worker protocols.\n\nAlso, possible to integrate with NestJS."},{property:"og:site_name",content:"TGrid Guide Documents"},{property:"og:url",content:"https://tgrid.com"},{name:"twitter:card",content:"summary"},{name:"twitter:image",content:"https://tgrid.com/og.jpg"},{name:"twitter:title",content:"TGrid Guide Documents"},{name:"twitter:description",content:"TypeScript Grid Computing Framework.\n\nSupport RPC (Remote Procure Call) for WebSocket and Worker protocols.\n\nAlso, possible to integrate with NestJS."},{name:"twitter:site",content:"@SamchonGithub"}]})}},5789:function(){}},function(s){s.O(0,[295,774,888,179],function(){return s(s.s=2083)}),_N_E=s.O()}]);