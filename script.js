var Cell = Cell;
var Geo = Geo;

enchant();
window.onload = function() {
    var game = new Game(1124, 700);
    game.fps = 30;
    game.rootScene.backgroundColor = "lightgray";
    game.onload = function(){
    };
    game.start();
    var initCell = function(){
//リセット処理

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
    $("#start").click(initCell);

    var adittionOnClick = function(){
        Cell.ForceConfigurationMethods.setNearRangeDist(
            $("#nearRangeDist").val()
        );
        Cell.ForceConfigurationMethods.setFarRangeDist(
            $("#farRangeDist").val()
        );
        Cell.ForceConfigurationMethods.setNearRangeForce(
            $("#nearRangeForce").val()
        );
        Cell.ForceConfigurationMethods.setFarRangeForce(
            $("#farRangeForce").val()
        );
        Cell.ForceConfigurationMethods.setGregariousForce(
            $("#gregariousForce").val()
        );
        Cell.ForceConfigurationMethods.setAccelerationScale(
            $("#accelerationScale").val()
        );
        Cell.ForceConfigurationMethods.setRandomScale(
            $("#randomScale").val()
        );
        Cell.ForceConfigurationMethods.setOutToCentralForce(
            $("#outToCentralForce").val()
        );
        console.log("adittion");
    };
    $("#adittion").click(adittionOnClick);

    $("#nearRangeDist").change(function(){
            $("#nearRangeDist-numView").text($("#nearRangeDist").val());
    });
    $("#farRangeDist").change(function(){
            $("#farRangeDist-numView").text($("#farRangeDist").val());
    });
    $("#nearRangeForce").change(function(){
            $("#nearRangeForce-numView").text($("#nearRangeForce").val());
    });
    $("#farRangeForce").change(function(){
            $("#farRangeForce-numView").text($("#farRangeForce").val());
    });
    $("#gregariousForce").change(function(){
            $("#gregariousForce-numView").text($("#gregariousForce").val());
    });
    $("#accelerationScale").change(function(){
            $("#accelerationScale-numView").text($("#accelerationScale").val());
    });
    $("#randomScale").change(function(){
            $("#randomScale-numView").text($("#randomScale").val());
    });
    $("#outToCentralForce").change(function(){
            $("#outToCentralForce-numView").text($("#outToCentralForce").val());
    });

    $("#nearRangeDist-numView").text($("#nearRangeDist").val());
    $("#farRangeDist-numView").text($("#farRangeDist").val());
    $("#nearRangeForce-numView").text($("#nearRangeForce").val());
    $("#farRangeForce-numView").text($("#farRangeForce").val());
    $("#gregariousForce-numView").text($("#gregariousForce").val());
    $("#accelerationScale-numView").text($("#accelerationScale").val());
    $("#randomScale-numView").text($("#randomScale").val());
    $("#outToCentralForce-numView").text($("#outToCentralForce").val());

};

