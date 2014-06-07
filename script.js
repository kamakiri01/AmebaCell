var Cell = Cell;
var Geo = Geo;

enchant();
window.onload = function() {
    var game = new Game(1124, 700);
    game.fps = 30;
    game.rootScene.backgroundColor = "lightgray";
    game.onload = function(){
        //タッチイベントの作成
        Cell.addTouchEvent();
        //Cellの生成
        Cell.addNewCells();
        //描画レイヤーの作成
        Cell.addLineLayer();
        //ライン描画イベント
        Cell.addDrawLineEvent();
        //セル間の相互作用による運動の計算
        Cell.addForceEvent();
    };
    game.start();
};

