/*
 *
 * this lib need Geo.enchant.js
 *
 */
var Geo = Geo;
var lineLength = 80;
var capLineLength = lineLength/2;
var Cell = (function(){
        var linelayer = {};
        var numberOfNodes = 200;
        var candi = [];
        var cL = 0;
        var candiBuf = [];

        var duringCapture = false;
        var userTouch = {
            x:0,    //捕獲範囲の中心
            y:0,
            capture:[], //捕獲されたセルのリスト
            capComed:false  //捕獲中の状態変数
        };
        var ForceMethods = (function(){
                var calcForce = function(){
                    //相互に受ける力が同じとは限らないので全配列ループする
                    for(var i=0; i<numberOfNodes;i++){
                        //受ける加速度の積
                        var fx=0, fy=0;
                        var nd0 = Cell.CellClass.collection[i];
                        for(var j=0; j<numberOfNodes;j++){
                            var nd1 = Cell.CellClass.collection[j];
                            if(i !== j && nd0 !== undefined && nd1 !== undefined){
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
                                }else if(dist<200 && nd0.type === nd1.type){
                                    fx += dx / dist / dist / dist * 30;
                                    fy += dy / dist / dist / dist * 30;
                                }
                                //なんとなく集合しようとする
                                if(dist>1){
                                    var vx = nd1.vx;
                                    var vy = nd1.vy;
                                    var rad = Math.atan2(vy,vx);
                                    fx += Math.cos(rad) /dist/dist;
                                    fy += Math.sin(rad) /dist/dist;
                                }
                                //加速度を集積
                                nd0.fx += fx;
                                nd0.fy += fy;
                            }
                        }
                        //加速度をノーマライズ
                        var fdist = Math.sqrt(nd0.fx * nd0.fx + nd0.fy * nd0.fy);
                        if(fdist > 1){
                            nd0.fx = nd0.fx/fdist;
                            nd0.fy = nd0.fy/fdist;
                        }
                        //若干ランダムに運動
                        nd0.fx += (Math.random()-0.5)*0.2;
                        nd0.fy += (Math.random()-0.5)*0.2;
                    }
                };
                var applyForce = function(){
                    for(var i=0; i<numberOfNodes;i++){
                        Cell.CellClass.collection[i].vx += Cell.CellClass.collection[i].fx;
                        Cell.CellClass.collection[i].vy += Cell.CellClass.collection[i].fy;
                        var vvx =  Cell.CellClass.collection[i].vx;
                        var vvy =  Cell.CellClass.collection[i].vy;
                        var vdist = Math.sqrt(vvx * vvx + vvy * vvy);
                        //速度をノーマライズ
                        if(vdist > 1){
                            Cell.CellClass.collection[i].vx = vvx/vdist;
                            Cell.CellClass.collection[i].vy = vvy/vdist;
                        }

                        //画面外に出る速度がある場合速度を反転
                        var sumX = Cell.CellClass.collection[i].x + Cell.CellClass.collection[i].vx;
                        var sumY = Cell.CellClass.collection[i].y + Cell.CellClass.collection[i].vy;
                        if(sumX < 5 || sumX > enchant.Core.instance.width-5){
                            Cell.CellClass.collection[i].vx *= -1;
                        }
                        if(sumY < 5 || sumY > enchant.Core.instance.height-5){
                            Cell.CellClass.collection[i].vy *= -1;
                        }

                        //既に画面外にいる場合中心力をかける
                        sumX -= Cell.CellClass.collection[i].vx;
                        sumY -= Cell.CellClass.collection[i].vy;
                        if(sumX < 0 || sumX > enchant.Core.instance.width){
                            Cell.CellClass.collection[i].vx = (enchant.Core.instance.width - sumX)/10;
                        }
                        if(sumY < 0 || sumY > enchant.Core.instance.height){
                            Cell.CellClass.collection[i].vy = (enchant.Core.instance.height - sumY)/10;
                        }

                        //クリック移動中は力積が適用されない（演算自体を飛ばしたほうが効率的）
                        if(Cell.CellClass.collection[i].isCapture === true && Cell.userTouch.capComed === true){
                            //nothing
                        }else{
                            //速度の適用
                            Cell.CellClass.collection[i].x += Cell.CellClass.collection[i].vx;
                            Cell.CellClass.collection[i].y += Cell.CellClass.collection[i].vy;
                            //整数値にならす(GPU環境では特に不要)
                            Cell.CellClass.collection[i].x = (Cell.CellClass.collection[i].x + 0.5) << 0;
                            Cell.CellClass.collection[i].y = (Cell.CellClass.collection[i].y + 0.5) << 0;
                        }
                    }
                }
                var capturingCellsPosition = function(){
                    if(Cell.userTouch.capComed === true){
                        for(var i=0;i<Cell.userTouch.capture.length;i++){
                            Cell.userTouch.capture[i].x = Cell.userTouch.x + Cell.userTouch.capture[i].rVecX;
                            Cell.userTouch.capture[i].y = Cell.userTouch.y + Cell.userTouch.capture[i].rVecY;
                        }
                    }
                }
                return{
                    calcForce: calcForce,
                    applyForce: applyForce,
                    capturingCellsPosition: capturingCellsPosition
                }
        })()
        var addForceEvent = function(){
            enchant.Core.instance.rootScene.addEventListener("enterframe", function(){
                    if(duringCapture === false){
                        //力積の生成
                        //相互に受ける力が同じとは限らないので全配列ループする
                        ForceMethods.calcForce();
                        //力積の適用
                        ForceMethods.applyForce();
                        //力積の適用項内だとクリック時の相対座標保持に問題がありそうなので、別個に処理
                        ForceMethods.capturingCellsPosition();
                    }
            });
        }

        var CellClass = enchant.Class.create(Geo.Circle, {
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
        var addLineLayer = function(){
            linelayer = new Geo.LineLayer(enchant.Core.instance.width, enchant.Core.instance.height);
            enchant.Core.instance.rootScene.addChild(linelayer);
        };
        var addDrawLineEvent = function(){
            enchant.Core.instance.rootScene.addEventListener("enterframe", function(){
                    linelayer.areaWipe();
                    //重複描画を避ける
                    for(var i=0; i<numberOfNodes;i++){
                        for(var j=numberOfNodes-1; j>=i;j--){
                            //描画メソッド
                            Geo.drawLine(Cell.CellClass.collection[i], Cell.CellClass.collection[j]);
                        }
                    }
            });
        }
        var startUserTouch = function(e){
            //ユーザーの初期化
            Cell.userTouch.x = e.x;
            Cell.userTouch.y = e.y;
            Cell.userTouch.capture = [];
            duringCapture = true;
        };
        var recetUserTouch = function(){
            Cell.userTouch.capture = [];
            Cell.userTouch.capComed = false;
        };
        var createDeepCopy = function(){
            var result = [];
            var l = Cell.CellClass.collection.length;
            for(var i=0;i<l;i++){
                result.push(Cell.CellClass.collection[i]);
            }
            return result;
        };
        var addmitCellToCandi = function(e){
            for(var i=0;i<candi.length;i++){
                var dx = candi[i].x - e.x;
                var dy = candi[i].y - e.y;
                var dist = Math.sqrt( Math.pow(dx, 2) + Math.pow(dy,2 ) );
                //結合圏内のセルをリストに追加する
                if(dist < capLineLength){
                    candi[i].isCapture = true;
                    Cell.userTouch.capture.push(candi[i]);
                }
            }
        };
        var initDetectCellPhase = function(){
            Cell.candiBuf = [];
        };
        var endDetectCellPhase = function(){
            console.log("total capturing: " + Cell.userTouch.capture.length);
        }
        var captureLoopPhase = function(){
            //リストのそれぞれの要素から候補までの距離を調べ、近ければリストに追加し候補から外す（演算）
            //まずリストを一巡してリストを増やし、更にそのリストで候補を洗いなおす
            //新しく追加されるセルがなくなるまでこれを繰り返す
            //captureリスト全てに対して行う
            for(var i=0, ie=Cell.userTouch.capture.length;i<ie;i++){
                //全てのcandiリストに対して行う
                for(var j=0;j<candi.length;j++){
                    //同色のセルか確認
                    if(candi[j].type === Cell.userTouch.capture[i].type){
                        var dist = getDistBetween2Cell(candi[j], Cell.userTouch.capture[i]);
                        //candiリストの要素がcaptureリストの要素と近ければ捕獲する
                        if(dist !== 0 && dist < capLineLength){
                            //ノード内のセルと近ければ捕獲し、候補から外す
                            addCellToCandiBuf(candi[j], j);
                        }
                    }
                }
            }
            //ループを続けるか判断
            if(Cell.candiBuf.length === 0){
                console.log("no new capture");
                //新しいセルが捕獲できなければ走査ループ終了
                endDetectCellPhase();
            }else{
                console.log("new capture "+Cell.candiBuf.length);
                //新しく捕獲したセルをリストに追加する
                captureCandidateCells();
                captureLoopPhase(); //再帰
            }
        };
        //セルを捕獲予定リストに載せる
        var addCellToCandiBuf = function(destCell, n){
            destCell.isCapture = true;
            Cell.candiBuf.push(destCell);
            candi.splice(n, 1);
        }
        //全ての捕獲予定セルを捕獲予定リストから確定捕獲リストに移す
        var captureCandidateCells = function(){
            Cell.userTouch.capture = Cell.userTouch.capture.concat(Cell.candiBuf);
            Cell.candiBuf = [];
        }
        var addNewCell = function(cell){
            enchant.Core.instance.rootScene.addChild(cell);
        };
        var addNewCells = function(){
            for(var i=0; i<numberOfNodes;i++){
                var cell = new Cell.CellClass();
                addNewCell(cell);
            }
        }
        var getDistBetween2Cell = function(c1, c2){
            var dx = c1.x - c2.x;
            var dy = c1.y - c2.y;
            var dist = Math.sqrt( Math.pow(dx, 2) + Math.pow(dy,2) );
            return dist;
        };
        var recetCellCapturingStatus = function(){
            var l = Cell.CellClass.collection.length;
            for(var i=0;i<l;i++){
                Cell.CellClass.collection[i].isCapture = false;
            }
        };
        var addTouchEvent = function(){
            //ユーザーイベント
            //クリック終了で捕獲終了
            enchant.Core.instance.rootScene.addEventListener('touchend', function(){
                    //全てのセルの捕獲状態を初期化
                    recetCellCapturingStatus();
                    //ユーザー状態の初期化
                    recetUserTouch();
            });
            //捕獲中はドラッグドロップ
            enchant.Core.instance.rootScene.addEventListener('touchmove', function(e){
                    Cell.userTouch.x = e.x;
                    Cell.userTouch.y = e.y;
            });
            enchant.Core.instance.rootScene.addEventListener('touchstart', function(e){
                    //ユーザー操作状態の初期化
                    startUserTouch(e);
                    //ディープコピーを作る
                    candi = createDeepCopy();
                    //結合距離の半分以内にいるセルをリストアップ
                    addmitCellToCandi(e);
                    //リストアップされたセル数を表示
                    console.log("first: "+ Cell.userTouch.capture.length);
                    //追加されたセルに結合しているセルを更にリストに追加する
                    initDetectCellPhase();
                    //近隣のセルがなくなるまで再帰的に探索する
                    captureLoopPhase();
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
        return {
            candiBuf: candiBuf,
            addForceEvent: addForceEvent,
            CellClass: CellClass,
            addLineLayer: addLineLayer,
            addDrawLineEvent: addDrawLineEvent,
            userTouch: userTouch,
            addNewCells: addNewCells,
            addTouchEvent: addTouchEvent
        
        };
})();

