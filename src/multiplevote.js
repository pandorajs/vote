define(function(require, exports, module) {
    /**
     * 多选投票,基于顶踩接口
     *
     * @module Vote
     */
    'use strict';

    var $ = require('$'),
        Core = require('./core'),
        Support = require('./support');

    /**
     * 多选投票,基于顶踩接口
     * @class MultipleVote
     * @extends core
     * @constructs
     */
    var MultipleVote = Core.extend({

        defaults: {

            /**
             * 投票URL接口
             * @attribute url
             * @type {String}
             */
            url: 'http://hits.17173.com/port/hit_batch_read.php',

            /**
             * 页面ID列表, 基于顶踩的接口，如果要进行多选投票，必需申请多个页面ID
             * @attribute webIds
             * @type {Array}
             */
            webIds: [],

            /**
             * 统计类型，1是页面PV，2是顶踩数
             * @type {String}
             */
            countType: '2'
        },

        /**
         * 创建参数和投票项
         * @method createParams
         * @return {Object} 参数对象
         * @private
         */
        createParams: function() {
            var self = this;
            var item;
            var webIds = self.option('webIds');
            var channel = self.option('channel');
            var countType = self.option('countType');
            var categoryId = self.option('kind');
            var keyList = [];
            self.votes = {};
            self.webIdMap = {};

            for (var i = webIds.length - 1; i >= 0; i--) {
                item = '' + channel + webIds[i] + categoryId;
                keyList.push(item);
                self.votes[item] = self.webIdMap[webIds[i]] = new Support({
                    channel: channel,
                    kind: categoryId,
                    webId: webIds[i]
                });
            }

            return {
                channel: channel,
                'key_list': keyList.join(','),
                kind: countType
            };
        },

        /**
         * 投票
         * @method vote
         * @param  {string} webId 页面ID
         */
        vote: function(webId, callBack) {
            var self = this;
            var item = self.webIdMap[webId];
            if (item) {
                self.state(Core.STATE.SENDING);
                item.support(function(data) {
                    self.state(Core.STATE.NORMAL);
                    callBack && callBack.call(self, data);
                    self.fire('vote', data);
                });
            }
        },

        done: function(data) {
            this.state(Core.STATE.NORMAL);
            return true;
        },

        /**
         * 解析数据
         * { 9000811361325:'7#22',9000811361655:'29#10', 9000811361635:'54#6' }
         *
         * @method parseData
         * @param  {Object} data 原始数据
         * @return {Object}      加工后的数据
         * @private
         */
        parseData: function(data) {
            var self = this;
            var webId;
            var itemCount;
            var total = 0;
            var max = 0;
            var tmp = {};

            for (var key in data) {
                itemCount = parseInt(data[key].split('#')[0], 10);
                webId = self.votes[key].option('webId');
                total += itemCount;
                max = Math.max(max, itemCount);
                tmp[webId] = {
                    count: itemCount
                };
            }

            for (var attr in tmp) {
                tmp[attr].percent = tmp[attr].count / total * 100;
                tmp[attr].viewPercent = tmp[attr].count / max * 100;
                tmp[attr].isMax = tmp[attr].count === max;
            }

            tmp.max = max;
            tmp.total = total;
            tmp.original = data;
            return tmp;
        }
    });

    module.exports = MultipleVote;

});
