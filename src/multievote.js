define(function(require, exports, module) {
    /**
     * 多选投票,基于顶踩接口
     *
     * @module Vote
     */
    'use strict';

    var $ = require('$'),
        Core = require('./core'),
        UpOrDown = require('./upordown');

    /**
     * 多选投票
     * @class MultieVote
     * @extends core
     * @constructs
     */
    var MultieVote = Core.extend({

        defaults: {

            url: 'http://hits.17173.com/port/hit_batch_read.php',

            /**
             * 页面ID列表
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
                self.votes[item] = self.webIdMap[webIds[i]] = new UpOrDown({
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
         * @param  {string} webId 页面ID
         */
        vote: function(webId, callBack) {
            var self = this;
            var item = self.webIdMap[webId];
            if (item) {
                self.state(Core.STATE.SENDING);
                item.support(function(data) {
                    self.state(Core.STATE.NORMAL);
                    callBack.call(self, data);
                    self.fire('vote', data);
                });
            }
        },

        /**
         * 解析数据
         * { 9000811361325:'7#22',9000811361655:'29#10', 9000811361635:'54#6' }
         *
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

    module.exports = MultieVote;

});
