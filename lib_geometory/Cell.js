/*
 *
 * this lib need Geo.enchant.js
 *
 */

var numberOfNodes = 200;
var lineLength = 80;
var capLineLength = lineLength/2;
var duringCapture = false;
var Cell = {};


Cell.userTouch = {
    x:0,    //捕獲範囲の中心
    y:0,
    capture:[], //捕獲されたセルのリスト
    capComed:false  //捕獲中の状態変数
};

Cell.initUserTouch = function(e){
    //ユーザーの初期化
    Cell.userTouch.x = e.x;
    Cell.userTouch.y = e.y;
    Cell.userTouch.capture = [];
    duringCapture = true;
}
Cell.createDeepCopy = function(){
    result = [];
    var l = Geo.Circle.collection.length;
    for(var i=0;i<l;i++){
        result.push(Geo.Circle.collection[i]);
    };
    return result;
}



Cell.CellsEntity = enchant.Class.create(Geo.Circle, {
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
Cell.addNewCell = function(cell){
    enchant.Core.instance.rootScene.addChild(cell);
}

Cell.addTouchEvent = function(){
    //ユーザーイベント
    //クリック終了で捕獲終了
    enchant.Core.instance.rootScene.addEventListener('touchend', function(){
            //全てのセルの捕獲状態を初期化
            var l = Geo.Circle.collection.length;
            for(var i=0;i<l;i++){
                Geo.Circle.collection[i].isCapture = false;
            };
            //ユーザー状態の初期化
            Cell.userTouch.capture = [];
            Cell.userTouch.capComed = false;
    });

    //捕獲中はドラッグドロップ
    enchant.Core.instance.rootScene.addEventListener('touchmove', function(e){
            Cell.userTouch.x = e.x;
            Cell.userTouch.y = e.y;
    });

    enchant.Core.instance.rootScene.addEventListener('touchstart', function(e){
            //ユーザー操作状態の初期化
            Cell.initUserTouch(e);

            //捕獲候補リストを先に作っておく

            var cL = Geo.Circle.collection.length;

            //ディープコピーを作る
            var candi = Cell.createDeepCopy();

            //結合距離の半分以内にいるセルをリストアップ
            for(var i=0;i<candi.length;i++){
                var dx = candi[i].x - e.x;
                var dy = candi[i].y - e.y;
                var dist = Math.sqrt( Math.pow(dx, 2) + Math.pow(dy,2 ) );
                //結合圏内のセルをリストに追加する
                if(dist < capLineLength){
                    candi[i].isCapture = true;
                    Cell.userTouch.capture.push(candi[i]);
                };
            };
            //}

            //リストアップされたセル数を表示
            console.log("first: "+ Cell.userTouch.capture.length)
            //追加されたセルに結合しているセルを更にリストに追加する
            var frag = true;
            var cL = Geo.Circle.collection.length;
            var candi = [];
            //ディープコピーを作る
            for(var i=0;i<cL;i++){
                candi.push(Geo.Circle.collection[i]);
            };
            var candiBuf = [];
            while(frag == true){
                //リストのそれぞれの要素から候補までの距離を調べ、近ければリストに追加し、候補から外す（演算）
                //まずリストを一巡してリストを増やし、更にそのリストで候補を洗いなおす
                //新しく追加されるセルがなくなるまでこれを繰り返す
                for(var i=0, ie=Cell.userTouch.capture.length;i<ie;i++){
                    for(var j=0;j<candi.length;j++){
            console.log();
                        if(candi[j].type == Cell.userTouch.capture[i].type){
                            var dx = candi[j].x - Cell.userTouch.capture[i].x;
                            var dy = candi[j].y - Cell.userTouch.capture[i].y;
                            var dist = Math.sqrt( Math.pow(dx, 2) + Math.pow(dy,2) );
                            if(dist != 0 && dist < capLineLength/1){
                                //ノード内のセルと近ければ捕獲し、候補から外す
                                candi[j].isCapture = true;
                                candiBuf.push(candi[j]);
                                candi.splice(j, 1);
                            }
                        }
                    }
                }
                //ループを続けるか判断
                if(candiBuf.length === 0){
                    console.log("no new capture");
                    //新しいセルが捕獲できなければ走査ループ終了
                    frag = false;
                    console.log("total capturing: " + Cell.userTouch.capture.length);
                }else{
                    console.log("new capture "+candiBuf.length);
                    //新しく捕獲したセルをリストに追加する
                    Cell.userTouch.capture = Cell.userTouch.capture.concat(candiBuf);
                    candiBuf = [];
                }
            }
            //クリック時のマウス座標とセルの相対座標を保存する
            Cell.userTouchLength = Cell.userTouch.capture.length;
            for(var i=0;i<Cell.userTouchLength;i++){
                Cell.userTouch.capture[i].rVecX = Cell.userTouch.capture[i].x - Cell.userTouch.x;
                Cell.userTouch.capture[i].rVecY = Cell.userTouch.capture[i].y - Cell.userTouch.y;
            }
            Cell.userTouch.capComed = true;
            duringCapture = false;
    });
};
