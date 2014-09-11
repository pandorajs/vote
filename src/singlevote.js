define(function(require, exports, module) {
    /**
     * 单选投票，基于表情投票接口，最多可创建10个选择项。
     *
     * @module Vote
     */
    'use strict';

    var $ = require('$'),
        Core = require('./core');

    /**
     * 单选投票
     * @class SingleVote
     * @extends core
     * @constructs
     */
    var SingleVote = Core.extend({

        defaults: {
            url: 'http://hits.17173.com/mood/mood_opb.php'
        },

        /**
         * 投票
         * @param  {string} key 投票号,如1、2、3…… 到10
         */
        vote: function(key, callBack) {
            var self = this;
            if (!/^(\d|10)$/.test(key)) {
                self.showTips('投票号只能是1至10的整数');
                return false;
            }
            self.params.action = '1';
            self.params.mood = key;
            self.state(Core.STATE.SENDING);
            self.dataServer(function(data) {
                callBack && callBack.apply(self, data);
                self.fire('vote', data);
            });
            return true;
        },

        /**
         * 解析数据
         * 1#9,2#2,3#4,4#4,5#3,6#2,7#2,8#2,9#5,10#4
         *
         * @param  {string} data 原始数据
         * @return {Object}      加工后的数据
         * @private
         */
        parseData: function(resData) {
            var data = resData.data;
            var tmp = {};
            var itemCount;
            var arr = data.match(/\d+(?!#|\d)/g);
            var max = Math.max.apply(null, arr);
            var total = eval(arr.join('+'));

            for (var i = arr.length - 1; i >= 0; i--) {
                itemCount = parseInt(arr[i], 10);
                tmp[i + 1] = {
                    count: itemCount,
                    percent: itemCount / total * 100,
                    viewPercent: itemCount / max * 100,
                    isMax: itemCount === max
                }
            }

            tmp.max = max;
            tmp.total = total;
            tmp.original = data;
            return tmp;
        }
    });

    module.exports = SingleVote;

});
