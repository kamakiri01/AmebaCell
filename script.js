var numberOfNodes = 200;
var lineLength = 80;
var capLineLength = lineLength/2;
var duringCapture = false;
enchant();
window.onload = function() {
    var game = new Game(1124, 700);
    game.fps = 30;
    game.rootScene.backgroundColor = "lightgray";
    game.onload = function(){

        //ユーザー
        var pl = {
            x:0,    //捕獲範囲の中心
            y:0,
            capture:[], //捕獲されたセルのリスト
            capComed:false  //捕獲中の状態変数
        };

        //ユーザーイベント
        //クリック終了で捕獲終了
        enchant.Core.instance.rootScene.addEventListener('touchend', function(){
                //全てのセルの捕獲状態を初期化
                var l = Geo.Circle.collection.length;
                for(var i=0;i<l;i++){
                Geo.Circle.collection[i].isCapture = false;
                };
                //ユーザー状態の初期化
                pl.capture = [];
                pl.capComed = false;
                });

        //捕獲中はドラッグドロップ
        enchant.Core.instance.rootScene.addEventListener('touchmove', function(e){
            pl.x = e.x;
            pl.y = e.y;
        });

        //クリックで周囲のセルを捕獲
        enchant.Core.instance.rootScene.addEventListener('touchstart', function(e){
            console.log("////////////////////capture start");

            //ユーザーの初期化
            pl.x = e.x;
            pl.y = e.y;
            pl.capture = [];
            pl.capComed = false;
            duringCapture = true;

            //捕獲候補リストを先に作っておく
            var cL = Geo.Circle.collection.length;

            //ピックするため新しくセルのリストを生成
            var candi = [];
            //ディープコピーを作る
            for(var i=0;i<cL;i++){
                candi.push(Geo.Circle.collection[i]);
            };

            //結合距離の半分以内にいるセルをリストアップ
            for(var i=0;i<candi.length;i++){
                var dx = candi[i].x - e.x;
                var dy = candi[i].y - e.y;
                var dist = Math.sqrt( Math.pow(dx, 2) + Math.pow(dy,2 ) );

                //結合圏内のセルをリストに追加する
                if(dist < capLineLength){
                    candi[i].isCapture = true;
                    pl.capture.push(candi[i]);

                };
            };

            //リストアップされたセル数を表示
            console.log("first: "+ pl.capture.length)

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
                for(var i=0, ie=pl.capture.length;i<ie;i++){
                    for(var j=0;j<candi.length;j++){
                        if(candi[j].type == pl.capture[i].type){
                            var dx = candi[j].x - pl.capture[i].x;
                            var dy = candi[j].y - pl.capture[i].y;
                            var dist = Math.sqrt( Math.pow(dx, 2) + Math.pow(dy,2) );

                            if(dist != 0 && dist < capLineLength/1){
                                //ノード内のセルと近ければ捕獲し、候補から外す
                                candi[j].isCapture = true;
                                candiBuf.push(candi[j]);
//                                candi.splice(i, 1);
                                candi.splice(j, 1);
                            };
                        };
                    };
                };

                //ループを続けるか判断
                if(candiBuf.length == 0){
                    console.log("no new capture");
                    //新しいセルが捕獲できなければ走査ループ終了
                    frag = false;
                    console.log("total capturing: " + pl.capture.length);
//                    candiBud = [];
                }else{
//                    console.log("pl.capture :" + pl.capture.length);
                    console.log("new capture "+candiBuf.length);
                    //新しく捕獲したセルをリストに追加する
                    pl.capture = pl.capture.concat(candiBuf);
//                    console.log("pl.capture :" + pl.capture.length);
                    candiBuf = [];
                };
            };
            console.log("copy end");

            //クリック時のマウス座標とセルの相対座標を保存する
            var plength = pl.capture.length;
            for(var i=0;i<plength;i++){
                pl.capture[i].rVecX = pl.capture[i].x - pl.x;
                pl.capture[i].rVecY = pl.capture[i].y - pl.y;
            };

            //フラグ終了
            pl.capComed = true;
            duringCapture = false;
        });


        //Cellの生成
        for(var i=0; i<numberOfNodes;i++){
            var cell = new Geo.Circle(2);

            //セル表示座標
            cell.x = Math.random() * game.width;
            cell.y = Math.random() * game.height;

            //運動速度
            cell.vx = 0
            cell.vy = 0;

            //加速度
            cell.fx = (Math.random() - 0.5)*0.02;
            cell.fy = (Math.random() - 0.5)*0.02;

            //セルのタイプ
            cell.type = Math.random() < 0.5 ? 1 :0;

            //セルの描画設定
            cell.compositeOperation = "lighter";

            //捕獲の状態変数とマウスとの相対座標
            cell.isCapture = false;
            cell.rVecX = 0;
            cell.rVecY = 0;

            game.rootScene.addChild(cell);
        };

//        //Cell相互作用を可視化
//        for(var i=0; i<numberOfNodes;i++){
//            for(var j=numberOfNodes-1; j>=i;j--){
//                var line = new Line(Circle.collection[i], Circle.collection[j]);
//                game.rootScene.addChild(line);
//            }
//        }
       
        //ラインを描画するスプライトを生成
//        var linelayer = new Sprite(enchant.Core.instance.width, enchant.Core.instance.height);
//        linelayer.image = new Surface(linelayer.width, linelayer.height);
//        linelayer.compositeOperation = "lighter";
//        game.rootScene.addChild(linelayer);
        var linelayer = new Geo.LineLayer(enchant.Core.instance.width, enchant.Core.instance.height);
        game.rootScene.addChild(linelayer);


        //ライン描画イベント
        game.rootScene.addEventListener('enterframe', function(){
            var sCtx = linelayer.image.context;
            sCtx.clearRect(0,0,enchant.Core.instance.width, enchant.Core.instance.height);

            //重複描画を避ける
            for(var i=0; i<numberOfNodes;i++){
                for(var j=numberOfNodes-1; j>=i;j--){
                    //描画メソッド
                    Geo.drawLine(Geo.Circle.collection[i], Geo.Circle.collection[j]);
                };
            };
        });

        //セル間の相互作用による運動
        game.rootScene.addEventListener('enterframe', function(){
            if(duringCapture == false){
                //力積の生成
                //相互に受ける力が同じとは限らないので全配列ループする
                for(var i=0; i<numberOfNodes;i++){

                //受ける加速度の積
                var fx=0, fy=0;
                var nd0 = Geo.Circle.collection[i];

                for(var j=0; j<numberOfNodes;j++){
                var nd1 = Geo.Circle.collection[j];
                    if(i != j && nd0 != undefined && nd1 != undefined){


                    //距離の計算
                    var dx = nd1.x - nd0.x;
                    var dy = nd1.y - nd0.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);

                    //同種に近付く or 離れる
                    //非常に近距離では反発する
                    if(dist<40 && dist>1){
                        fx -= dx / dist / dist / dist * 40;
                        fy -= dy / dist / dist / dist * 40;
                        //200以上離れていたら同じタイプで引き合う
                    }else if(dist<200 && nd0.type == nd1.type){
                        fx += dx / dist / dist / dist * 30;
                        fy += dy / dist / dist / dist * 30;
                    };

                    //なんとなく集合しようとする
                    if(dist>1){
                        var vx = nd1.vx;
                        var vy = nd1.vy;
                        var rad = Math.atan2(vy,vx);
                        fx += Math.cos(rad) /dist/dist;
                        fy += Math.sin(rad) /dist/dist;
                    };

                    //加速度を集積
                    nd0.fx += fx;
                    nd0.fy += fy;

                    };
                };

                //マウスから逃げる
                //未実装

                //加速度をノーマライズ
                var fdist = Math.sqrt(nd0.fx * nd0.fx + nd0.fy * nd0.fy);
                if(fdist > 1){
                    nd0.fx = nd0.fx/fdist;
                    nd0.fy = nd0.fy/fdist;
                };

                //若干ランダムに運動
                nd0.fx += (Math.random()-0.5)*0.2;
                nd0.fy += (Math.random()-0.5)*0.2;
                };


                //力積の適用
                for(var i=0; i<numberOfNodes;i++){
                    Geo.Circle.collection[i].vx += Geo.Circle.collection[i].fx;
                    Geo.Circle.collection[i].vy += Geo.Circle.collection[i].fy;

                    var vvx =  Geo.Circle.collection[i].vx;
                    var vvy =  Geo.Circle.collection[i].vy;
                    var vdist = Math.sqrt(vvx * vvx + vvy * vvy);

                    //速度をノーマライズ
                    if(vdist > 1){
                        Geo.Circle.collection[i].vx = vvx/vdist;
                        Geo.Circle.collection[i].vy = vvy/vdist;
                    };

                    //画面外に出る速度がある場合速度を反転
                    var sumX = Geo.Circle.collection[i].x + Geo.Circle.collection[i].vx;
                    var sumY = Geo.Circle.collection[i].y + Geo.Circle.collection[i].vy;
                    if(sumX < 5 || sumX > enchant.Core.instance.width-5){
                        Geo.Circle.collection[i].vx *= -1;
                    };
                    if(sumY < 5 || sumY > enchant.Core.instance.height-5){
                        Geo.Circle.collection[i].vy *= -1;
                    };

                    //既に画面外にいる場合中心力をかける
                    sumX -= Geo.Circle.collection[i].vx;
                    sumY -= Geo.Circle.collection[i].vy;
                    if(sumX < 0 || sumX > enchant.Core.instance.width){
                        Geo.Circle.collection[i].vx = (enchant.Core.instance.width - sumX)/10;
                    }
                    if(sumY < 0 || sumY > enchant.Core.instance.height){
                        Geo.Circle.collection[i].vy = (enchant.Core.instance.height - sumY)/10;
                    };

                    //クリック移動中は力積が適用されない（演算自体を飛ばしたほうが効率的）
                    if(Geo.Circle.collection[i].isCapture == true && pl.capComed == true){
                        //Geo.Circle.collection[i].vx = 0;//pl.x - Geo.Circle.collection[i].x;
                        //Geo.Circle.collection[i].vy = 0;//pl.y - Geo.Circle.collection[i].y;

                        //Geo.Circle.collection[i].x = pl.x + Geo.Circle.collection[i].rVecX;
                        //Geo.Circle.collection[i].y = pl.y + Geo.Circle.collection[i].rVecY;

                    }else{

                        //速度の適用
                        Geo.Circle.collection[i].x += Geo.Circle.collection[i].vx;
                        Geo.Circle.collection[i].y += Geo.Circle.collection[i].vy;

                        //整数値にならす(GPU環境では特に不要)
                        Geo.Circle.collection[i].x = (Geo.Circle.collection[i].x + 0.5) << 0;
                        Geo.Circle.collection[i].y = (Geo.Circle.collection[i].y + 0.5) << 0;
                    }
                };
                //力積の適用項内だとクリック時の相対座標保持に問題がありそうなので、別個に処理
                if(pl.capComed == true){
                    for(var i=0;i<pl.capture.length;i++){
                        pl.capture[i].x = pl.x + pl.capture[i].rVecX;
                        pl.capture[i].y = pl.y + pl.capture[i].rVecY;
                    };
                };
            };
        });
    };
    game.start();
};

