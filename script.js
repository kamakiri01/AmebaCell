enchant();
window.onload = function() {
    var game = new Game(1124, 700);
    game.fps = 30;
    game.rootScene.backgroundColor = "lightgray";
    game.onload = function(){
        Cell.addTouchEvent();

        //Cellの生成
        for(var i=0; i<numberOfNodes;i++){
            var cell = new Cell.CellsEntity();
            Cell.addNewCell(cell);
        };
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
            if(Cell.duringCapture == false){
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
                    if(Geo.Circle.collection[i].isCapture == true && Cell.userTouch.capComed == true){
                        //nothing
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
                if(Cell.userTouch.capComed == true){
                    for(var i=0;i<Cell.userTouch.capture.length;i++){
                        Cell.userTouch.capture[i].x = Cell.userTouch.x + Cell.userTouch.capture[i].rVecX;
                        Cell.userTouch.capture[i].y = Cell.userTouch.y + Cell.userTouch.capture[i].rVecY;
                    };
                };
            };
        });
    };
    game.start();
};

