/*
 * スプライトを基点にした線分を生成するクラス
 * 100個オーダー以上生成するとSurface管理で非常に重くなるのでアメーバでは使わない
 */

//var lineSurface = new Surface(enchant.Core.instance.width, enchant.Core.instance.height);

var Line = enchant.Class.create(enchant.Sprite, {
    initialize: function(e1, e2, color){
        enchant.Sprite.call(this, enchant.Core.instance.width, enchant.Core.instance.height);

//        if(Line.Collection != undefined){
//            Line.prototype.lineSurface = 
//                new Surface(enchant.Core.instance.width, enchant.Core.instance.height);
//        }else{
//        
//        }
//        //キャンバスの生成
//        this.image = Line.prototype.lineSurface;
//        this.sCtx = Line.prototype.lineSurface.context;
//
//        var sf = Line.prototype.lineSurface;

        //基点の処理
        this.point1 = e1;
        this.point2 = e2;
/*
        //基点となるEntity
        this.begin.x = this.point1.x;
        this.begin.y = this.point1.y;

        this.end.x = this.point2.x;
        this.end.y = this.point2.y;
*/

//        this.sCtx = color;
//        enchantのカラーテーブルからあとで拾ってくる
        
        this.addEventListener('exitframe', this.reflesh);
    },

   //最新の状態に描画する 
    reflesh: function(){
        
        this.sCtx = this._layer._element.getContext('2d');
        this.sCtx.fillText("foo", 50,50);
        this.sCtx.beginPath();
        //描画前にワイプする
//        this.sCtx.clearRect(0,0,enchant.Core.instance.width, enchant.Core.instance.height);
        //直線描画
        this.sCtx.moveTo(this.point1.x + this.point1.width/2,
                this.point1.y + this.point1.height/2);
        this.sCtx.lineTo(this.point2.x + this.point2.width/2,
                this.point2.y + this.point2.height/2);
        this.sCtx.closePath();
        this.sCtx.stroke();
    
            this.sCtx.fill();
    }
})


/*
 * 円描画クラス
 *
 */
var Circle = enchant.Class.create(enchant.Sprite, {
    initialize: function(rad){
        enchant.Sprite.call(this, rad*2, rad*2);

        //キャンバスの生成
        var sf = new Surface(rad*2, rad*2);
        this.image = sf;
        this.sCtx = sf.context;
        
        this.reflesh(rad);

        this.addEventListener('touchstart', function(){
            console.log(this);
        })
    },
    reflesh: function(rad){
            this.sCtx.beginPath();
            //描画前にワイプする
            this.sCtx.clearRect(0,0,rad*2, rad*2);
            //円弧描画
            this.sCtx.beginPath();
            this.sCtx.arc(rad, rad, rad, 0, Math.PI*2, true);
            this.sCtx.arc(rad, rad, rad-1, 0, Math.PI*2, false);
            this.sCtx.fill();
            this.sCtx.closePath();
//            this.sCtx.stroke();
    }
})
    
