/*
 *
 * this lib need Geo.enchant.js
 *
 */

var numberOfNodes = 200;
var lineLength = 80;
var capLineLength = lineLength/2;
var Cell = (function(){
        var candi = [];
        var cL = 0;
        var frag = true;
        var candiBuf = [];

        var duringCapture = false;
        var userTouch = {
            x:0,    //捕獲範囲の中心
            y:0,
            capture:[], //捕獲されたセルのリスト
            capComed:false  //捕獲中の状態変数
        };
        var CellsEntity = enchant.Class.create(Geo.Circle, {
                initialize: function(){
                    Geo.Circle.call(this, 2);
                    //セル表示座標
                    this.x = Math.random() * enchant.Core.instance.width;
                    this.y = Math.random() * enchant.Core.instance.height;
                    //運動速度
                    this.vx = 0;
                    this.vy = 0;
                    //加速度
                    this.fx = (Math.random() - 0.5)*0.02;
                    this.fy = (Math.random() - 0.5)*0.02;
                    //セルのタイプ
                    this.type = Math.random() < 0.5 ? 1 :0;
                    //セルの描画設定
                    this.compositeOperation = "lighter";
                    //捕獲の状態変数とマウスとの相対座標
                    this.isCapture = false;
                    this.rVecX = 0;
                    this.rVecY = 0;
                }
        });
        var startUserTouch = function(e){
            //ユーザーの初期化
            Cell.userTouch.x = e.x;
            Cell.userTouch.y = e.y;
            Cell.userTouch.capture = [];
            Cell.duringCapture = true;
        };
        var recetUserTouch = function(){
            Cell.userTouch.capture = [];
            Cell.userTouch.capComed = false;
        };
        var createDeepCopy = function(){
            var result = [];
            var l = Geo.Circle.collection.length;
            for(var i=0;i<l;i++){
                result.push(Geo.Circle.collection[i]);
            }
            return result;
        };
        var addmitCellToCandi = function(e){
            for(var i=0;i<Cell.candi.length;i++){
                var dx = Cell.candi[i].x - e.x;
                var dy = Cell.candi[i].y - e.y;
                var dist = Math.sqrt( Math.pow(dx, 2) + Math.pow(dy,2 ) );
                //結合圏内のセルをリストに追加する
                if(dist < capLineLength){
                    Cell.candi[i].isCapture = true;
                    Cell.userTouch.capture.push(Cell.candi[i]);
                }
            }
        };
        var initDetectCellPhase = function(){
            Cell.frag = true;
            Cell.candiBuf = [];
        };
        var endDetectCellPhase = function(){
            Cell.frag = false;
            console.log("total capturing: " + Cell.userTouch.capture.length);
        }
        var captureLoopPhase = function(){
            //リストのそれぞれの要素から候補までの距離を調べ、近ければリストに追加し候補から外す（演算）
            //まずリストを一巡してリストを増やし、更にそのリストで候補を洗いなおす
            //新しく追加されるセルがなくなるまでこれを繰り返す
            //captureリスト全てに対して行う
            for(var i=0, ie=Cell.userTouch.capture.length;i<ie;i++){
                //全てのcandiリストに対して行う
                for(var j=0;j<Cell.candi.length;j++){
                    //同色のセルか確認
                    if(Cell.candi[j].type === Cell.userTouch.capture[i].type){
                        var dist = Cell.getDistBetween2Cell(Cell.candi[j], Cell.userTouch.capture[i]);
                        //candiリストの要素がcaptureリストの要素と近ければ捕獲する
                        if(dist !== 0 && dist < capLineLength){
                            //ノード内のセルと近ければ捕獲し、候補から外す
                            Cell.addCellToCandiBuf(Cell.candi[j], j);
                        }
                    }
                }
            }
            //ループを続けるか判断
            if(Cell.candiBuf.length === 0){
                console.log("no new capture");
                //新しいセルが捕獲できなければ走査ループ終了
                Cell.endDetectCellPhase();
            }else{
                console.log("new capture "+Cell.candiBuf.length);
                //新しく捕獲したセルをリストに追加する
                Cell.captureCandidateCells();
                Cell.captureLoopPhase(); //再帰
            }
        };
        //セルを捕獲予定リストに載せる
        var addCellToCandiBuf = function(destCell, n){
            destCell.isCapture = true;
            Cell.candiBuf.push(destCell);
            Cell.candi.splice(n, 1);
        }
        //全ての捕獲予定セルを捕獲予定リストから確定捕獲リストに移す
        var captureCandidateCells = function(){
            Cell.userTouch.capture = Cell.userTouch.capture.concat(Cell.candiBuf);
            Cell.candiBuf = [];
        }
        var addNewCell = function(cell){
            enchant.Core.instance.rootScene.addChild(cell);
        };
        var getDistBetween2Cell = function(c1, c2){
            var dx = c1.x - c2.x;
            var dy = c1.y - c2.y;
            var dist = Math.sqrt( Math.pow(dx, 2) + Math.pow(dy,2) );
            return dist;
        };
        var recetCellCapturingStatus = function(){
            var l = Geo.Circle.collection.length;
            for(var i=0;i<l;i++){
                Geo.Circle.collection[i].isCapture = false;
            }
        };
        return {
            candi: candi,
            cL: cL,
            frag: frag,
            candiBuf: candiBuf,
            duringCapture: duringCapture,
            CellsEntity: CellsEntity,
            userTouch: userTouch,
            startUserTouch: startUserTouch,
            recetUserTouch: recetUserTouch,
            createDeepCopy: createDeepCopy,
            addmitCellToCandi: addmitCellToCandi,
            initDetectCellPhase: initDetectCellPhase,
            endDetectCellPhase: endDetectCellPhase,
            addCellToCandiBuf: addCellToCandiBuf,
            captureCandidateCells: captureCandidateCells,
            captureLoopPhase: captureLoopPhase,
            addNewCell: addNewCell,
            getDistBetween2Cell: getDistBetween2Cell,
            recetCellCapturingStatus: recetCellCapturingStatus
        
        };
})();

Cell.addTouchEvent = function(){
    //ユーザーイベント
    //クリック終了で捕獲終了
    enchant.Core.instance.rootScene.addEventListener('touchend', function(){
            //全てのセルの捕獲状態を初期化
            Cell.recetCellCapturingStatus();
            //ユーザー状態の初期化
            Cell.recetUserTouch();
    });

    //捕獲中はドラッグドロップ
    enchant.Core.instance.rootScene.addEventListener('touchmove', function(e){
            Cell.userTouch.x = e.x;
            Cell.userTouch.y = e.y;
    });

    enchant.Core.instance.rootScene.addEventListener('touchstart', function(e){
            //ユーザー操作状態の初期化
            Cell.startUserTouch(e);
            //捕獲候補リストを先に作っておく
            Cell.cL = Geo.Circle.collection.length;
            //ディープコピーを作る
            Cell.candi = Cell.createDeepCopy();
            //結合距離の半分以内にいるセルをリストアップ
            Cell.addmitCellToCandi(e);
            //リストアップされたセル数を表示
            console.log("first: "+ Cell.userTouch.capture.length);
            //追加されたセルに結合しているセルを更にリストに追加する
            Cell.initDetectCellPhase();

            Cell.captureLoopPhase();
//            while(Cell.frag == true){
//                //リストのそれぞれの要素から候補までの距離を調べ、近ければリストに追加し候補から外す（演算）
//                //まずリストを一巡してリストを増やし、更にそのリストで候補を洗いなおす
//                //新しく追加されるセルがなくなるまでこれを繰り返す
//                
//                //captureリスト全てに対して行う
//                for(var i=0, ie=Cell.userTouch.capture.length;i<ie;i++){
//                    //全てのcandiリストに対して行う
//                    for(var j=0;j<Cell.candi.length;j++){
//                        //同色のセルか確認
//                        if(Cell.candi[j].type === Cell.userTouch.capture[i].type){
//                            var dist = Cell.getDistBetween2Cell(Cell.candi[j], Cell.userTouch.capture[i]);
//                            //candiリストの要素がcaptureリストの要素と近ければ捕獲する
//                            if(dist !== 0 && dist < capLineLength){
//                                //ノード内のセルと近ければ捕獲し、候補から外す
//                                Cell.addCellToCandiBuf(Cell.candi[j], j);
//                            }
//                        }
//                    }
//                }
//                //ループを続けるか判断
//                if(Cell.candiBuf.length === 0){
//                    console.log("no new capture");
//                    //新しいセルが捕獲できなければ走査ループ終了
//                    Cell.endDetectCellPhase();
//                }else{
//                    console.log("new capture "+Cell.candiBuf.length);
//                    //新しく捕獲したセルをリストに追加する
//                    Cell.captureCandidateCells();
//                }
//            }
            //クリック時のマウス座標とセルの相対座標を保存する
            Cell.userTouchLength = Cell.userTouch.capture.length;
            for(var i=0;i<Cell.userTouchLength;i++){
                Cell.userTouch.capture[i].rVecX = Cell.userTouch.capture[i].x - Cell.userTouch.x;
                Cell.userTouch.capture[i].rVecY = Cell.userTouch.capture[i].y - Cell.userTouch.y;
            }
            Cell.userTouch.capComed = true;
            Cell.duringCapture = false;
    });
};
